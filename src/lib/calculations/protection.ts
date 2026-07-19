import type {
  ProtectionDevices,
  ProtectionDevice,
  PVArrayDesign,
  BatteryDesign,
  InverterDesign,
} from '@/lib/types';

export function calculateMCBRating(current: number): ProtectionDevice {
  const safetyFactor = 1.25;
  const rating = Math.ceil(current * safetyFactor / 1) * 1;
  const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
  let selectedRating = standardRatings[standardRatings.length - 1];
  for (const r of standardRatings) {
    if (r >= rating) {
      selectedRating = r;
      break;
    }
  }

  return {
    type: 'MCB',
    rating: selectedRating,
    breakingCapacity: 10000,
    poles: 1,
    standard: 'IEC 60898-1',
    selected: true,
  };
}

export function calculateMCCBRating(current: number): ProtectionDevice {
  const safetyFactor = 1.25;
  const rating = Math.ceil(current * safetyFactor / 1) * 1;
  const standardRatings = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800];
  let selectedRating = standardRatings[standardRatings.length - 1];
  for (const r of standardRatings) {
    if (r >= rating) {
      selectedRating = r;
      break;
    }
  }

  return {
    type: 'MCCB',
    rating: selectedRating,
    breakingCapacity: 25000,
    poles: 3,
    standard: 'IEC 60947-2',
    selected: true,
  };
}

export function calculateFuseRating(current: number): ProtectionDevice {
  const safetyFactor = 1.25;
  const rating = Math.ceil(current * safetyFactor / 1) * 1;
  const standardRatings = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200];
  let selectedRating = standardRatings[standardRatings.length - 1];
  for (const r of standardRatings) {
    if (r >= rating) {
      selectedRating = r;
      break;
    }
  }

  return {
    type: 'Fuse',
    rating: selectedRating,
    breakingCapacity: 50000,
    poles: 1,
    standard: 'IEC 60269',
    selected: true,
  };
}

export function calculateSPDRating(voltage: number): ProtectionDevice {
  let rating: number;
  let breakingCapacity: number;

  if (voltage <= 275) {
    rating = 275;
    breakingCapacity = 20000;
  } else if (voltage <= 400) {
    rating = 400;
    breakingCapacity = 25000;
  } else if (voltage <= 600) {
    rating = 600;
    breakingCapacity = 40000;
  } else {
    rating = 1000;
    breakingCapacity = 50000;
  }

  return {
    type: 'SPD',
    rating,
    breakingCapacity,
    poles: 3,
    standard: 'IEC 61643-11',
    selected: true,
  };
}

export function calculateIsolatorRating(current: number, voltage: number): ProtectionDevice {
  const safetyFactor = 1.25;
  const rating = Math.ceil(current * safetyFactor / 1) * 1;
  const standardRatings = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];
  let selectedRating = standardRatings[standardRatings.length - 1];
  for (const r of standardRatings) {
    if (r >= rating) {
      selectedRating = r;
      break;
    }
  }

  return {
    type: 'Isolator',
    rating: selectedRating,
    breakingCapacity: 10000,
    poles: voltage > 50 ? 2 : 1,
    standard: 'IEC 60947-3',
    selected: true,
  };
}

export function calculateRCBORating(current: number): ProtectionDevice {
  const safetyFactor = 1.25;
  const rating = Math.ceil(current * safetyFactor / 1) * 1;
  const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63];
  let selectedRating = standardRatings[standardRatings.length - 1];
  for (const r of standardRatings) {
    if (r >= rating) {
      selectedRating = r;
      break;
    }
  }

  return {
    type: 'RCBO',
    rating: selectedRating,
    breakingCapacity: 10000,
    poles: 2,
    standard: 'IEC 61009-1',
    selected: true,
  };
}

export function calculateEarthingResistance(
  resistivity: number,
  rodLength: number,
  rodDiameter: number,
): number {
  const R = (resistivity / (2 * Math.PI * rodLength)) * Math.log((4 * rodLength) / rodDiameter);
  return R;
}

export function designAllProtection(
  pvDesign: PVArrayDesign,
  batteryDesign: BatteryDesign,
  inverterDesign: InverterDesign,
): ProtectionDevices {
  const dcCurrent = pvDesign.parallelStrings * pvDesign.imp;
  const isThreePhase = inverterDesign.gridVoltage > 240;
  const acFactor = isThreePhase ? Math.sqrt(3) : 1;
  const pf = 0.95;
  const acCurrent = (inverterDesign.ratedPower * 1000) / (inverterDesign.gridVoltage * acFactor * pf);

  const mcb = calculateMCBRating(dcCurrent * 1.25);
  const mccb = calculateMCCBRating(acCurrent * 1.25);
  const fuse = calculateFuseRating(pvDesign.imp * 1.25);
  const spd = calculateSPDRating(inverterDesign.gridVoltage);
  const dcIsolator = calculateIsolatorRating(dcCurrent * 1.25, pvDesign.stringVoltage);
  const acIsolator = calculateIsolatorRating(acCurrent, inverterDesign.gridVoltage);
  const rcbo = calculateRCBORating(acCurrent);
  const rcd: ProtectionDevice = {
    type: 'RCD',
    rating: acIsolator.rating,
    breakingCapacity: 10000,
    poles: 2,
    standard: 'IEC 61008',
    selected: true,
  };
  const earthing: ProtectionDevice = {
    type: 'Earthing',
    rating: 0,
    breakingCapacity: 0,
    poles: 0,
    standard: 'IEC 60364-5-54',
    selected: true,
  };
  const lightningProtection: ProtectionDevice = {
    type: 'Lightning Protection',
    rating: 0,
    breakingCapacity: 50000,
    poles: 0,
    standard: 'IEC 62305',
    selected: true,
  };

  return { mcb, mccb, fuse, spd, dcIsolator, acIsolator, rcbo, rcd, earthing, lightningProtection };
}
