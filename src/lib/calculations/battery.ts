import type { BatteryDesign } from '@/lib/types';

/**
 * Calculate required battery capacity in Ah.
 * nightLoads in kW (power), backupHours in hours, batteryVoltage in V.
 * Formula: Ah = (kWh * 1000) / (V * DoD * efficiency)
 */
export function calculateBatteryCapacity(
  nightLoadsKw: number,
  backupHours: number,
  dod: number,
  efficiency: number,
  batteryVoltage: number,
): number {
  const requiredKwh = nightLoadsKw * backupHours;
  const requiredWh = requiredKwh * 1000;
  const requiredAh = requiredWh / (batteryVoltage * dod * efficiency);
  return requiredAh;
}

export function calculateBatteryCount(
  capacityAh: number,
  parallelCount: number,
  seriesCount: number,
): number {
  return parallelCount * seriesCount;
}

/**
 * Design battery bank.
 * nightLoads in Wh (daily night energy consumption from load profile).
 * All energy arithmetic in Wh → Ah at nominal voltage.
 * Per IEC 62620 and manufacturer specs for DoD/efficiency derating.
 */
export function designBatteryBank(
  nightEnergyWh: number,
  backupHours: number,
  autonomyDays: number,
  dod: number,
  efficiency: number,
  batteryVoltage: number,
): BatteryDesign {
  const totalEnergyWh = nightEnergyWh * autonomyDays;
  const requiredWh = totalEnergyWh;

  const requiredAh = requiredWh / (batteryVoltage * dod * efficiency);
  const totalKwh = requiredWh / 1000;

  const batteryVoltagePerUnit = batteryVoltage <= 48 ? batteryVoltage : 48;
  const seriesCount = Math.max(1, Math.ceil(batteryVoltage / batteryVoltagePerUnit));
  const parallelCount = Math.max(1, Math.ceil(requiredAh / 200));

  const batteryCapacity = Math.ceil(requiredAh / parallelCount);
  const totalBatteries = seriesCount * parallelCount;

  const maxDischargeCurrent = (requiredAh * 0.2) / parallelCount;
  const maxChargeCurrent = (requiredAh * 0.1) / parallelCount;

  const chargeRate = calculateChargeRate(batteryCapacity, maxChargeCurrent);
  const dischargeRate = calculateDischargeRate(batteryCapacity, maxDischargeCurrent);

  const initialSoc = 80;
  const sohEstimation = estimateSOH(0, 5000);

  return {
    batteryType: 'lithium',
    voltageType: batteryVoltage <= 48 ? 'low' : 'high',
    backupTime: backupHours,
    nightLoads: nightEnergyWh,
    autonomyDays,
    dod,
    efficiency,
    reserveCapacity: requiredWh - totalEnergyWh,
    maxDischargeCurrent,
    maxChargeCurrent,
    batteryVoltage,
    batteryCapacity,
    totalKwh,
    totalAh: requiredAh,
    seriesCount,
    parallelCount,
    totalBatteries,
    chargeRate,
    dischargeRate,
    initialSoc,
    sohEstimation,
    selectedBattery: null,
  };
}

export function calculateSOC(charge: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.max(0, Math.min(100, (charge / capacity) * 100));
}

export function estimateSOH(cycles: number, maxCycles: number): number {
  if (maxCycles === 0) return 100;
  return Math.max(0, 100 * (1 - cycles / maxCycles));
}

export function calculateDischargeRate(
  capacityAh: number,
  maxDischargeCurrent: number,
): number {
  if (capacityAh === 0) return 0;
  return maxDischargeCurrent / capacityAh;
}

export function calculateChargeRate(
  capacityAh: number,
  maxChargeCurrent: number,
): number {
  if (capacityAh === 0) return 0;
  return maxChargeCurrent / capacityAh;
}
