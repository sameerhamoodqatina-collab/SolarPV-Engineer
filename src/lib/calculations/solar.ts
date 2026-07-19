import type { PVArrayDesign, SolarPanel } from '@/lib/types';

/**
 * Calculate required PV power in Watts.
 * Formula: PV_W = DailyEnergy_Wh / (PSH * systemLossFactor)
 * Per IEC 61724: PSH = peak sun hours, lossFactor = 1 - totalLosses%
 * dailyEnergy must be in Wh (watt-hours).
 */
export function calculateRequiredPVPower(
  dailyEnergyWh: number,
  psh: number,
  systemLossesPercent: number,
): number {
  const lossFactor = 1 - systemLossesPercent / 100;
  if (psh <= 0 || lossFactor <= 0) return 0;
  return dailyEnergyWh / (psh * lossFactor);
}

export function calculateDCACRatio(requiredPV: number, inverterPower: number): number {
  if (inverterPower === 0) return 0;
  return requiredPV / inverterPower;
}

export function designPVArray(
  requiredPV: number,
  panel: SolarPanel,
  maxVoc: number,
  minMpptV: number,
  maxMpptV: number,
  ambientTempMin?: number,
  ambientTempMax?: number,
): PVArrayDesign {
  const tempMin = ambientTempMin ?? -10;
  const tempMax = ambientTempMax ?? 50;

  const numberOfPanels = Math.ceil(requiredPV / panel.power);
  const { series, parallel } = calculateStringConfig(
    numberOfPanels,
    panel,
    maxVoc,
    minMpptV,
    maxMpptV,
    tempMin,
    tempMax,
  );

  const tempCorrHot = calculateTemperatureCorrection(
    panel.voc,
    panel.isc,
    panel.vmp,
    panel.tempCoeffVoc,
    panel.tempCoeffIsc,
    panel.tempCoeffPmax,
    tempMax,
    panel.noct,
    1000,
  );
  const tempCorrCold = calculateTemperatureCorrection(
    panel.voc,
    panel.isc,
    panel.vmp,
    panel.tempCoeffVoc,
    panel.tempCoeffIsc,
    panel.tempCoeffPmax,
    tempMin,
    panel.noct,
    0,
  );

  const stringVmp = panel.vmp * series;
  const stringVocCold = tempCorrCold.correctedVoc * series;
  const mpptValidation = validateMPPTDesign(
    tempCorrHot.correctedVmp * series,
    stringVocCold,
    minMpptV,
    maxMpptV,
    maxVoc,
  );

  return {
    requiredPVPower: requiredPV,
    dcAcRatio: 0,
    numberOfPanels,
    seriesPanels: series,
    parallelStrings: parallel,
    stringVoltage: stringVmp,
    voc: panel.voc,
    vmp: panel.vmp,
    isc: panel.isc,
    imp: panel.imp,
    temperatureCorrection: tempCorrCold.correctedVoc / panel.voc,
    maxStringVoltage: stringVocCold,
    minMPPTVoltage: minMpptV,
    mpptValidation,
    inverterCompatibility: mpptValidation,
    safetyMargin: 1.25,
    selectedPanel: panel,
  };
}

/**
 * Calculate string configuration (series/parallel) per IEC 62548.
 * - Max series: limited by inverter max DC input voltage (Voc at coldest temp)
 * - Min series: limited by MPPT minimum voltage (Vmp at hottest temp)
 */
export function calculateStringConfig(
  totalPanels: number,
  panel: SolarPanel,
  maxVoc: number,
  minMpptV: number,
  maxMpptV: number,
  ambientTempMin: number = -10,
  ambientTempMax: number = 50,
): { series: number; parallel: number } {
  const tempCorrCold = calculateTemperatureCorrection(
    panel.voc, panel.isc, panel.vmp, panel.tempCoeffVoc, panel.tempCoeffIsc, panel.tempCoeffPmax,
    ambientTempMin, panel.noct, 0,
  );
  const tempCorrHot = calculateTemperatureCorrection(
    panel.voc, panel.isc, panel.vmp, panel.tempCoeffVoc, panel.tempCoeffIsc, panel.tempCoeffPmax,
    ambientTempMax, panel.noct, 1000,
  );

  const correctedVocCold = tempCorrCold.correctedVoc;
  const correctedVmpHot = tempCorrHot.correctedVmp;

  let maxSeries = Math.floor(maxVoc / correctedVocCold);
  maxSeries = Math.min(maxSeries, Math.floor(maxMpptV / correctedVmpHot));

  const minSeries = Math.ceil(minMpptV / correctedVmpHot);

  if (maxSeries < minSeries) {
    maxSeries = minSeries;
  }

  const series = Math.max(1, Math.min(maxSeries, Math.max(minSeries, maxSeries)));
  const parallel = Math.ceil(totalPanels / series);

  return { series, parallel };
}

/**
 * Temperature correction per IEC 60891.
 * Cell temp at given condition: Tcell = Tambient + (NOCT - 20) * (G / 800)
 * Voc correction: Voc(T) = Voc_STC * (1 + β * (Tcell - 25))
 * Isc correction: Isc(T) = Isc_STC * (1 + α * (Tcell - 25))
 * Vmp correction: Vmp(T) = Vmp_STC * (1 + γ * (Tcell - 25))
 */
export function calculateTemperatureCorrection(
  voc: number,
  isc: number,
  vmp: number,
  tempCoeffVoc: number,
  tempCoeffIsc: number,
  tempCoeffPmax: number,
  ambientTemp: number,
  noct: number,
  irradiance: number,
): { correctedVoc: number; correctedIsc: number; correctedVmp: number } {
  const cellTemp = ambientTemp + (noct - 20) * (irradiance / 800);
  const deltaT = cellTemp - 25;

  const correctedVoc = voc * (1 + (tempCoeffVoc / 100) * deltaT);
  const correctedIsc = isc * (1 + (tempCoeffIsc / 100) * deltaT);
  const tempCoeffVmp = (tempCoeffPmax - tempCoeffIsc) / 100;
  const correctedVmp = vmp * (1 + tempCoeffVmp * deltaT);

  return { correctedVoc, correctedIsc, correctedVmp };
}

export function validateMPPTDesign(
  stringVmp: number,
  stringVoc: number,
  inverterMpptMin: number,
  inverterMpptMax: number,
  maxInverterVoc: number,
): boolean {
  if (stringVoc > maxInverterVoc) return false;
  if (stringVmp < inverterMpptMin) return false;
  if (stringVmp > inverterMpptMax) return false;
  return true;
}

/**
 * Monthly production per IEC 61724.
 * Uses actual days per month and location-specific irradiance data.
 */
export function calculateMonthlyProduction(
  pvPowerW: number,
  monthlyIrradiance: number[],
  lossesPercent: number,
): number[] {
  const lossFactor = 1 - lossesPercent / 100;
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return monthlyIrradiance.map((irradiance, i) => {
    const days = daysInMonths[i] || 30;
    return (pvPowerW / 1000) * irradiance * days * lossFactor;
  });
}

/**
 * Hourly solar production using the BRL model (Boland & Rideout).
 * Accounts for air mass, clearness index, and solar geometry.
 */
export function calculateHourlySolarProduction(
  pvPowerW: number,
  latitude: number,
  lossesPercent: number,
): number[] {
  const hourlyProduction = new Array(24).fill(0);
  const lossFactor = 1 - lossesPercent / 100;

  const dayOfYear = 172;
  const declination = 23.45 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const declRad = (declination * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  const sunriseHour = Math.max(
    0,
    12 - (12 / Math.PI) * Math.acos(-Math.tan(latRad) * Math.tan(declRad)),
  );
  const sunsetHour = Math.min(
    24,
    12 + (12 / Math.PI) * Math.acos(-Math.tan(latRad) * Math.tan(declRad)),
  );

  for (let h = Math.floor(sunriseHour); h <= Math.ceil(sunsetHour) && h < 24; h++) {
    const hourAngle = ((h - 12) * 15 * Math.PI) / 180;
    const elevation =
      Math.asin(
        Math.sin(latRad) * Math.sin(declRad) +
          Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngle),
      ) * (180 / Math.PI);

    if (elevation > 0) {
      const clearnessIndex = 0.7;
      const airMass =
        1 /
        (Math.sin((elevation * Math.PI) / 180) +
          0.50572 * Math.pow(elevation + 6.07995, -1.6364));
      const irradiance = 1000 * clearnessIndex * Math.exp(-0.2 * airMass);
      const normalizedIrradiance = Math.max(0, irradiance / 1000);

      hourlyProduction[h] = (pvPowerW * normalizedIrradiance * lossFactor) / 1000;
    }
  }

  return hourlyProduction;
}
