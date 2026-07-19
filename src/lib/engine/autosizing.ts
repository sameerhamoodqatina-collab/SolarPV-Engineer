import type { PanelDatabaseEntry } from '@/lib/database/panels';
import type { InverterDatabaseEntry } from '@/lib/database/inverters';
import type { BatteryDatabaseEntry } from '@/lib/database/batteries';

export interface LoadInput {
  method: 'simple' | 'professional';
  dayConsumption: number;
  nightConsumption: number;
  hourlyLoad?: number[];
  peakDemand?: number;
  systemVoltage: number;
  autonomyDays: number;
  backupHours: number;
  batteryType: 'lithium' | 'leadacid' | 'gel' | 'agm';
  inverterCategory: 'hybrid' | 'offgrid' | 'ongrid';
}

export interface AutoSizingResult {
  load: {
    dailyConsumption: number;
    peakPower: number;
    averagePower: number;
    hourlyProfile: number[];
  };
  pv: {
    requiredCapacity: number;
    numberOfPanels: number;
    numberOfStrings: number;
    panelsPerString: number;
    actualCapacity: number;
    tiltAngle: number;
    azimuth: number;
    annualYield: number;
  };
  inverter: {
    requiredPower: number;
    recommendedPower: number;
    numberOfInverters: number;
    dcAcRatio: number;
    maxPvInputRequired: number;
  };
  battery: {
    requiredCapacity: number;
    requiredVoltage: number;
    numberOfBatteries: number;
    batteriesInSeries: number;
    batteriesInParallel: number;
    backupTime: number;
    totalCapacity: number;
  };
  cables: {
    dcCableSize: number;
    acCableSize: number;
    batteryCableSize: number;
    dcCableLength: number;
    acCableLength: number;
  };
  protection: {
    dcFuseRating: number;
    dcMcbRating: number;
    acMcbRating: number;
    spdRating: number;
    dcIsolatorRating: number;
    acIsolatorRating: number;
    rcboRating: number;
  };
}

export function autoSizeSystem(
  loadInput: LoadInput,
  selectedPanel: PanelDatabaseEntry,
  selectedInverter: InverterDatabaseEntry,
  selectedBattery: BatteryDatabaseEntry,
  solarData: { peakSunHours: number; avgDailySolar: number }
): AutoSizingResult {
  const dailyConsumption = loadInput.dayConsumption + loadInput.nightConsumption;
  const isLithium = selectedBattery.type === 'lithium';
  const batteryDod = selectedBattery.specs.dod / 100;
  const batteryEfficiency = selectedBattery.specs.efficiency / 100;

  const avgPower = dailyConsumption / 24;
  const peakPower = loadInput.method === 'professional' && loadInput.peakDemand
    ? loadInput.peakDemand
    : dailyConsumption * 0.4;

  const hourlyProfile = loadInput.method === 'professional' && loadInput.hourlyLoad
    ? loadInput.hourlyLoad
    : generateDefaultProfile(loadInput.dayConsumption, loadInput.nightConsumption);

  const peakSunHours = solarData.peakSunHours || 5.5;
  const systemLossFactor = 0.80;

  const requiredPvCapacity = dailyConsumption / (peakSunHours * systemLossFactor);
  const panelsNeeded = Math.ceil(requiredPvCapacity / (selectedPanel.power / 1000));
  const actualPvCapacity = panelsNeeded * selectedPanel.power / 1000;

  const maxPanelsPerString = calculateMaxPanelsPerString(selectedPanel, selectedInverter);
  const minPanelsPerString = calculateMinPanelsPerString(selectedPanel, selectedInverter);
  const panelsPerString = Math.min(
    Math.max(minPanelsPerString, Math.round(panelsNeeded / Math.ceil(panelsNeeded / maxPanelsPerString))),
    maxPanelsPerString
  );
  const numberOfStrings = Math.ceil(panelsNeeded / panelsPerString);
  const actualPanels = numberOfStrings * panelsPerString;

  const dcAcRatio = (actualPanels * selectedPanel.power / 1000) / selectedInverter.ratedPower;
  const requiredInverterPower = peakPower;
  const recommendedInverterPower = selectedInverter.ratedPower;
  const numberOfInverters = dcAcRatio > selectedInverter.dcAcRatio
    ? Math.ceil((actualPanels * selectedPanel.power / 1000) / (selectedInverter.maxPvInput))
    : 1;

  const batteryRequiredVoltage = selectedInverter.batteryCompatibility?.supportedVoltage?.[0] || loadInput.systemVoltage;
  const nightKwh = loadInput.nightConsumption || dailyConsumption * 0.4;
  const totalBatteryEnergy = (nightKwh * loadInput.backupHours) / (batteryDod * batteryEfficiency);
  const adjustedForAutonomy = totalBatteryEnergy * loadInput.autonomyDays;
  const numberOfBatteriesInSeries = Math.max(1, Math.round(batteryRequiredVoltage / selectedBattery.specs.nominalVoltage));
  const requiredBatteriesForCapacity = adjustedForAutonomy / selectedBattery.specs.kwh;
  const numberOfBatteriesInParallel = Math.max(1, Math.ceil(requiredBatteriesForCapacity / numberOfBatteriesInSeries));
  const totalBatteries = numberOfBatteriesInSeries * numberOfBatteriesInParallel;
  const actualBatteryCapacity = totalBatteries * selectedBattery.specs.kwh;
  const backupTime = loadInput.backupHours;

  const dcCableSize = calculateDCCableSize(
    selectedPanel.imp * numberOfStrings,
    selectedPanel.vmp * panelsPerString,
    numberOfStrings
  );
  const acCableSize = calculateACCableSize(
    selectedInverter.ratedPower * 1000,
    selectedInverter.gridVoltage,
    15
  );
  const batteryCableSize = calculateBatteryCableSize(
    selectedBattery.chargingLimits.maxDischargeCurrent,
    5
  );

  const dcFuseRating = Math.ceil(selectedPanel.isc * 1.5);
  const dcMcbRating = Math.ceil(selectedPanel.imp * numberOfStrings * 1.25);
  const isThreePhase = selectedInverter.gridVoltage > 240;
  const acFactor = isThreePhase ? Math.sqrt(3) : 1;
  const acMcbRating = Math.ceil(selectedInverter.ratedPower * 1000 / (selectedInverter.gridVoltage * acFactor * 0.95));
  const spdRating = selectedInverter.maxDcInputVoltage || 600;
  const dcIsolatorRating = Math.ceil(selectedPanel.isc * numberOfStrings * 1.25);
  const acIsolatorRating = Math.ceil(selectedInverter.ratedPower * 1000 / (selectedInverter.gridVoltage * acFactor * 0.95));
  const rcboRating = Math.min(acMcbRating, 63);

  return {
    load: {
      dailyConsumption,
      peakPower,
      averagePower: avgPower,
      hourlyProfile,
    },
    pv: {
      requiredCapacity: requiredPvCapacity,
      numberOfPanels: actualPanels,
      numberOfStrings,
      panelsPerString,
      actualCapacity: actualPvCapacity,
      tiltAngle: calculateOptimalTilt(loadInput.systemVoltage === 220 ? 15 : 15),
      azimuth: 0,
      annualYield: actualPvCapacity * solarData.avgDailySolar * 365 * systemLossFactor,
    },
    inverter: {
      requiredPower: requiredInverterPower,
      recommendedPower: recommendedInverterPower,
      numberOfInverters,
      dcAcRatio: dcAcRatio,
      maxPvInputRequired: actualPvCapacity,
    },
    battery: {
      requiredCapacity: adjustedForAutonomy,
      requiredVoltage: batteryRequiredVoltage,
      numberOfBatteries: totalBatteries,
      batteriesInSeries: numberOfBatteriesInSeries,
      batteriesInParallel: numberOfBatteriesInParallel,
      backupTime,
      totalCapacity: actualBatteryCapacity,
    },
    cables: {
      dcCableSize,
      acCableSize,
      batteryCableSize,
      dcCableLength: Math.ceil(actualPanels * 1.5 + 10),
      acCableLength: 20,
    },
    protection: {
      dcFuseRating,
      dcMcbRating,
      acMcbRating,
      spdRating,
      dcIsolatorRating,
      acIsolatorRating,
      rcboRating,
    },
  };
}

function calculateMaxPanelsPerString(panel: PanelDatabaseEntry, inverter: InverterDatabaseEntry): number {
  const mppt = inverter.mppt;
  const maxByVoltage = Math.floor(mppt.mpptVoltageRange.max / panel.vmp);
  const maxByDcVoltage = Math.floor(inverter.maxDcInputVoltage / panel.voc);
  return Math.min(maxByVoltage, maxByDcVoltage);
}

function calculateMinPanelsPerString(panel: PanelDatabaseEntry, inverter: InverterDatabaseEntry): number {
  const mppt = inverter.mppt;
  return Math.ceil(mppt.mpptVoltageRange.min / panel.vmp);
}

function calculateOptimalTilt(latitude: number): number {
  return Math.abs(latitude) * 0.76 + 3.1;
}

function generateDefaultProfile(dayConsumption: number, nightConsumption: number): number[] {
  const profile = new Array(24).fill(0);
  const dayHours = 6;
  const nightHours = 10;
  const dayLoadPerHour = dayConsumption / dayHours;
  const nightLoadPerHour = nightConsumption / nightHours;

  for (let h = 6; h < 12; h++) profile[h] = dayLoadPerHour * 1.1;
  for (let h = 12; h < 18; h++) profile[h] = dayLoadPerHour * 1.3;
  for (let h = 18; h < 24; h++) profile[h] = nightLoadPerHour;
  for (let h = 0; h < 6; h++) profile[h] = nightLoadPerHour * 0.7;

  const total = profile.reduce((a, b) => a + b, 0);
  const target = dayConsumption + nightConsumption;
  return profile.map(v => v * target / total);
}

function calculateDCCableSize(current: number, voltage: number, numberOfStrings: number): number {
  const designCurrent = current * 1.5625;
  const voltageDropLimit = 0.02;
  const voltageForCalc = voltage > 0 ? voltage : 300;
  const crossSection = (2 * designCurrent * 30) / (voltageForCalc * voltageDropLimit * 56);
  const standardSizes = [2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];
  return standardSizes.find(s => s >= crossSection) || standardSizes[standardSizes.length - 1];
}

function calculateACCableSize(power: number, voltage: number, length: number): number {
  const isThreePhase = voltage > 240;
  const acFactor = isThreePhase ? Math.sqrt(3) : 1;
  const current = power / (voltage * acFactor * 0.95) * 1.25;
  const voltageDropLimit = 0.03;
  const crossSection = (2 * current * length) / (voltage * voltageDropLimit * 56);
  const standardSizes = [2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];
  return standardSizes.find(s => s >= crossSection) || standardSizes[standardSizes.length - 1];
}

function calculateBatteryCableSize(current: number, length: number): number {
  const designCurrent = current * 1.25;
  const voltageDropLimit = 0.02;
  const voltage = 48;
  const crossSection = (2 * designCurrent * length) / (voltage * voltageDropLimit * 56);
  const standardSizes = [6, 10, 16, 25, 35, 50, 70, 95];
  return standardSizes.find(s => s >= crossSection) || standardSizes[standardSizes.length - 1];
}

export function calculateHourlySolarProduction(
  panel: PanelDatabaseEntry,
  numberOfPanels: number,
  latitude: number,
  month: number = 6
): number[] {
  const declination = 23.45 * Math.sin((360 / 365) * (284 + month * 30) * Math.PI / 180);
  const hourAngles: number[] = [];
  for (let h = 6; h <= 18; h++) {
    hourAngles.push((h - 12) * 15);
  }

  const hourlyProduction: number[] = new Array(24).fill(0);
  const peakPower = (panel.power * numberOfPanels) / 1000;

  for (let h = 6; h <= 18; h++) {
    const hourAngle = (h - 12) * 15;
    const altitude = Math.asin(
      Math.sin(latitude * Math.PI / 180) * Math.sin(declination * Math.PI / 180) +
      Math.cos(latitude * Math.PI / 180) * Math.cos(declination * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180)
    );

    const altitudeDeg = altitude * 180 / Math.PI;
    if (altitudeDeg > 0) {
      const airMass = 1 / Math.sin(altitude);
      const clearness = Math.exp(-0.2 * airMass);
      const ghiFactor = Math.max(0, Math.sin(altitude));
      hourlyProduction[h] = peakPower * ghiFactor * clearness * 0.80;
    }
  }

  return hourlyProduction;
}

export function calculateBatterySOC(
  battery: BatteryDatabaseEntry,
  numberOfBatteries: number,
  dailyConsumption: number,
  hourlyLoad: number[],
  hourlySolar: number[],
  autonomyDays: number
): number[] {
  const totalCapacity = numberOfBatteries * battery.specs.kwh;
  const dod = battery.specs.dod / 100;
  const efficiency = battery.specs.efficiency / 100;
  const soc: number[] = new Array(24).fill(0);
  let currentSoc = totalCapacity * 0.95;

  for (let h = 0; h < 24; h++) {
    const load = hourlyLoad[h] || 0;
    const solar = hourlySolar[h] || 0;

    if (solar > load) {
      const surplus = (solar - load) * efficiency;
      currentSoc = Math.min(totalCapacity, currentSoc + surplus);
    } else {
      const deficit = load - solar;
      currentSoc = Math.max(totalCapacity * (1 - dod), currentSoc - deficit);
    }

    soc[h] = (currentSoc / totalCapacity) * 100;
  }

  return soc;
}
