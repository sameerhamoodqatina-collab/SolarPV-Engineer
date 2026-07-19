import type { InverterDesign, PVArrayDesign, Inverter } from '@/lib/types';

export function determineSystemType(
  hasBattery: boolean,
  gridConnected: boolean,
): 'ongrid' | 'offgrid' | 'hybrid' {
  if (gridConnected && !hasBattery) return 'ongrid';
  if (!gridConnected && hasBattery) return 'offgrid';
  if (gridConnected && hasBattery) return 'hybrid';
  return 'offgrid';
}

export function calculateInverterPower(peakDemand: number, safetyFactor: number): number {
  return peakDemand * safetyFactor;
}

export function calculateMPPTCount(
  requiredPVPower: number,
  maxPvPerMppt: number,
): number {
  if (maxPvPerMppt === 0) return 1;
  return Math.ceil(requiredPVPower / maxPvPerMppt);
}

export function selectInverter(
  peakDemand: number,
  pvPower: number,
  batteryVoltage: number,
  gridVoltage: number,
): InverterDesign {
  const systemType = determineSystemType(batteryVoltage > 0, gridVoltage > 0);
  const safetyFactor = 1.25;
  const ratedPower = calculateInverterPower(peakDemand, safetyFactor);

  const maxPvPerMppt = ratedPower * 1.3;
  const numberOfMppt = calculateMPPTCount(pvPower, maxPvPerMppt);

  const inverterType =
    systemType === 'ongrid'
      ? 'string'
      : systemType === 'offgrid'
        ? 'battery'
        : 'hybrid';

  return {
    systemType,
    inverterType,
    ratedPower,
    numberOfMppt,
    maxPvInput: pvPower * 1.25,
    batteryVoltage,
    gridVoltage,
    safetyFactor,
    selectedInverter: null,
  };
}

export function validateInverterCompatibility(
  pvDesign: PVArrayDesign,
  inverter: Inverter,
): boolean {
  if (pvDesign.requiredPVPower > inverter.maxPvInput) return false;
  if (pvDesign.numberOfPanels > inverter.maxStrings * pvDesign.seriesPanels) return false;
  if (pvDesign.parallelStrings > inverter.maxStrings) return false;
  if (pvDesign.maxStringVoltage > inverter.mpptVoltageRange.max) return false;
  return true;
}
