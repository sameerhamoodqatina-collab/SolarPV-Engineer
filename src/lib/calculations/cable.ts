import type { CableSizing, CableSpec, PVArrayDesign, BatteryDesign, InverterDesign } from '@/lib/types';

/**
 * Calculate cable size per IEC 60364-5-52 and NEC 310.
 * Vdrop = (2 × L × I) / (σ × A) where σ = 56 S·mm²/m for copper.
 * Max voltage drop: 3% DC (NEC), 3% AC (IEC 60364-5-52).
 */
export function calculateCableSize(
  current: number,
  length: number,
  voltage: number,
  systemType: 'DC' | 'AC',
  ambientTemp: number,
): CableSpec {
  const safetyFactor = 1.25;
  const deratingTemp = Math.max(0.5, 1 - (ambientTemp - 30) * 0.005);
  const effectiveCurrent = current * safetyFactor / deratingTemp;

  const conductivity = 56;
  const voltageDropPercentLimit = 3;
  const refVoltage = voltage > 0 ? voltage : 230;

  const minCrossSection =
    (2 * effectiveCurrent * length) / (conductivity * refVoltage * voltageDropPercentLimit / 100);
  const recommendedSize = getNECCableSize(effectiveCurrent);
  const crossSection = Math.max(minCrossSection, recommendedSize);

  const { drop, percent } = calculateVoltageDrop(
    effectiveCurrent,
    length,
    crossSection,
    conductivity,
    refVoltage,
  );

  const cableType = determineCableType(current, voltage, 'buried');

  return {
    current: effectiveCurrent,
    voltage,
    length,
    voltageDrop: drop,
    voltageDropPercent: percent,
    currentCarryingCapacity: effectiveCurrent,
    recommendedSize: crossSection,
    cableType,
    standard: systemType === 'DC' ? 'IEC 60364-5-52' : 'NEC 310',
  };
}

/**
 * Voltage drop per IEC 60364-5-52 Annex G.
 * Vdrop = (2 × L × I) / (κ × S)
 * κ = 56 for copper at 20°C, S = cross-section in mm²
 * Result in Volts.
 */
export function calculateVoltageDrop(
  current: number,
  length: number,
  crossSection: number,
  conductivity: number,
  systemVoltage: number,
): { drop: number; percent: number } {
  if (crossSection === 0) return { drop: 0, percent: 0 };

  const drop = (2 * length * current) / (conductivity * crossSection);
  const refVoltage = systemVoltage > 0 ? systemVoltage : 230;
  const percent = (drop / refVoltage) * 100;

  return { drop, percent };
}

export function determineCableType(
  current: number,
  voltage: number,
  installation: string,
): string {
  if (voltage > 1000) return 'XLPE 1.8/3kV';
  if (current > 200) return 'XLPE 0.6/1kV';
  if (installation === 'buried') return 'SWA 0.6/1kV';
  if (installation === 'tray') return 'LSZH 0.6/1kV';
  return 'PVC 0.6/1kV';
}

/**
 * NEC Table 310.15(B)(16) - Copper conductors, 75°C rating.
 */
export function getNECCableSize(current: number): number {
  if (current <= 10) return 2.5;
  if (current <= 15) return 4;
  if (current <= 20) return 6;
  if (current <= 25) return 10;
  if (current <= 35) return 16;
  if (current <= 45) return 25;
  if (current <= 60) return 35;
  if (current <= 75) return 50;
  if (current <= 95) return 70;
  if (current <= 120) return 95;
  if (current <= 150) return 120;
  if (current <= 185) return 150;
  if (current <= 230) return 185;
  if (current <= 270) return 240;
  if (current <= 340) return 300;
  if (current <= 400) return 400;
  return 500;
}

export function designAllCables(
  pvDesign: PVArrayDesign,
  batteryDesign: BatteryDesign,
  inverterDesign: InverterDesign,
): CableSizing {
  const dcCurrent = pvDesign.parallelStrings * pvDesign.imp;
  const dcLength = 20;
  const dcVoltage = pvDesign.stringVoltage;
  const dcCable = calculateCableSize(dcCurrent, dcLength, dcVoltage, 'DC', 40);

  const isThreePhase = inverterDesign.gridVoltage > 240;
  const acFactor = isThreePhase ? Math.sqrt(3) : 1;
  const pf = 0.95;
  const acCurrent = (inverterDesign.ratedPower * 1000) / (inverterDesign.gridVoltage * acFactor * pf);
  const acLength = 15;
  const acCable = calculateCableSize(acCurrent, acLength, inverterDesign.gridVoltage, 'AC', 35);

  const batteryCurrent = batteryDesign.maxDischargeCurrent;
  const batteryLength = 5;
  const batteryVoltage = batteryDesign.batteryVoltage;
  const batteryCable = calculateCableSize(batteryCurrent, batteryLength, batteryVoltage, 'DC', 35);

  const groundCable = calculateCableSize(dcCurrent * 0.5, 10, 0, 'DC', 30);

  return { dcCable, acCable, batteryCable, groundCable };
}
