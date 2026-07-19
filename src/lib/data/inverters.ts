export interface InverterData {
  id: string;
  manufacturer: string;
  model: string;
  type: 'ongrid' | 'offgrid' | 'hybrid';
  ratedPower: number;
  maxPvInput: number;
  numberOfMppt: number;
  mpptVoltageRange: { min: number; max: number };
  maxInputCurrent: number;
  maxStrings: number;
  efficiency: number;
  gridVoltage: number;
  batteryVoltage?: number;
  dimensions: string;
  weight: number;
  availableInYemen?: boolean;
  yemenDistributor?: string;
}

export const inverters: InverterData[] = [
  // Huawei — Available in Yemen (widely distributed)
  {
    id: 'huawei-sun2000-5ktl',
    manufacturer: 'huawei',
    model: 'SUN2000-5KTL-M1',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 7.5,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 140, max: 560 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 98.4,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '365 × 300 × 160 mm',
    weight: 17.2,
    availableInYemen: true,
    yemenDistributor: 'Multiple distributors in Yemen'
  },
  {
    id: 'huawei-sun2000-10ktl',
    manufacturer: 'huawei',
    model: 'SUN2000-10KTL-M2',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 15,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 200, max: 600 },
    maxInputCurrent: 22.5,
    maxStrings: 4,
    efficiency: 98.6,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '545 × 420 × 220 mm',
    weight: 28.5,
    availableInYemen: true,
    yemenDistributor: 'Multiple distributors in Yemen'
  },
  {
    id: 'huawei-sun2000-25ktl',
    manufacturer: 'huawei',
    model: 'SUN2000-25KTL-M3',
    type: 'hybrid',
    ratedPower: 25,
    maxPvInput: 35,
    numberOfMppt: 4,
    mpptVoltageRange: { min: 200, max: 600 },
    maxInputCurrent: 30,
    maxStrings: 8,
    efficiency: 98.8,
    gridVoltage: 400,
    batteryVoltage: 48,
    dimensions: '650 × 480 × 280 mm',
    weight: 42.0,
    availableInYemen: true,
    yemenDistributor: 'Multiple distributors in Yemen'
  },
  // Sungrow — Available in Yemen
  {
    id: 'sungrow-sg5rt',
    manufacturer: 'sungrow',
    model: 'SG5.0RT',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 8,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 90, max: 560 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 98.3,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '420 × 360 × 190 mm',
    weight: 19.5,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  {
    id: 'sungrow-sg10rt',
    manufacturer: 'sungrow',
    model: 'SG10RT',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 15,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 140, max: 600 },
    maxInputCurrent: 25,
    maxStrings: 4,
    efficiency: 98.5,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 230 mm',
    weight: 27.0,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  {
    id: 'sungrow-sg100hn',
    manufacturer: 'sungrow',
    model: 'SG100HN',
    type: 'ongrid',
    ratedPower: 100,
    maxPvInput: 150,
    numberOfMppt: 10,
    mpptVoltageRange: { min: 200, max: 1000 },
    maxInputCurrent: 225,
    maxStrings: 20,
    efficiency: 99.0,
    gridVoltage: 400,
    dimensions: '700 × 500 × 300 mm',
    weight: 68.0,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  // Deye — Available in Yemen (Alnasr Solar authorized, Naif Falcon)
  {
    id: 'deye-sun-5k',
    manufacturer: 'deye',
    model: 'SUN-5K-SG04LP3',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 7.5,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 120, max: 550 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 97.6,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '420 × 350 × 185 mm',
    weight: 22.0,
    availableInYemen: true,
    yemenDistributor: 'Alnasr Solar / Naif Falcon Trading'
  },
  {
    id: 'deye-sun-12k',
    manufacturer: 'deye',
    model: 'SUN-12K-SG04LP3',
    type: 'hybrid',
    ratedPower: 12,
    maxPvInput: 18,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 120, max: 560 },
    maxInputCurrent: 30,
    maxStrings: 4,
    efficiency: 98.0,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '540 × 420 × 230 mm',
    weight: 32.0,
    availableInYemen: true,
    yemenDistributor: 'Alnasr Solar / Naif Falcon Trading'
  },
  // SMA — Available in Yemen (German brand, widely available)
  {
    id: 'sma-sunny-boy-5',
    manufacturer: 'sma',
    model: 'Sunny Boy 5.0',
    type: 'ongrid',
    ratedPower: 5,
    maxPvInput: 7.5,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 125, max: 480 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 98.2,
    gridVoltage: 220,
    dimensions: '450 × 380 × 185 mm',
    weight: 17.5,
    availableInYemen: true,
    yemenDistributor: 'Imported via Gulf distributors'
  },
  {
    id: 'sma-sunny-highpower-60',
    manufacturer: 'sma',
    model: 'Sunny Highpower PEAK3 60kW',
    type: 'ongrid',
    ratedPower: 60,
    maxPvInput: 90,
    numberOfMppt: 6,
    mpptVoltageRange: { min: 500, max: 850 },
    maxInputCurrent: 120,
    maxStrings: 12,
    efficiency: 99.0,
    gridVoltage: 400,
    dimensions: '660 × 520 × 310 mm',
    weight: 65.0,
    availableInYemen: true,
    yemenDistributor: 'Imported via Gulf distributors'
  },
  // Growatt — Available in Yemen (Naif Falcon distributor)
  {
    id: 'growatt-mid-5kw',
    manufacturer: 'growatt',
    model: 'MIN 5000TL3-X',
    type: 'ongrid',
    ratedPower: 5,
    maxPvInput: 7,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 130, max: 550 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 98.4,
    gridVoltage: 220,
    dimensions: '420 × 360 × 175 mm',
    weight: 18.0,
    availableInYemen: true,
    yemenDistributor: 'Naif Falcon Trading'
  },
  {
    id: 'growatt-sph-10kw',
    manufacturer: 'growatt',
    model: 'SPH 10000TL3-BH-UP',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 13,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 130, max: 550 },
    maxInputCurrent: 25,
    maxStrings: 4,
    efficiency: 98.2,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 220 mm',
    weight: 29.0,
    availableInYemen: true,
    yemenDistributor: 'Naif Falcon Trading'
  },
  {
    id: 'growatt-sph-8kw',
    manufacturer: 'growatt',
    model: 'SPH 8000TL3-BH-UP',
    type: 'hybrid',
    ratedPower: 8,
    maxPvInput: 10.4,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 130, max: 550 },
    maxInputCurrent: 20,
    maxStrings: 4,
    efficiency: 98.0,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 220 mm',
    weight: 28.0,
    availableInYemen: true,
    yemenDistributor: 'Naif Falcon Trading'
  },
  // GoodWe — Available in Yemen
  {
    id: 'goodwe-ews-5kw',
    manufacturer: 'goodwe',
    model: 'ETL 5000-SB',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 7,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 130, max: 550 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 98.0,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '420 × 350 × 180 mm',
    weight: 20.0,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  {
    id: 'goodwe-mid-10kw',
    manufacturer: 'goodwe',
    model: 'ETL 10000H-BP',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 12,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 140, max: 560 },
    maxInputCurrent: 25,
    maxStrings: 4,
    efficiency: 98.3,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 230 mm',
    weight: 30.0,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  // Fronius — Available in Yemen (Austrian brand)
  {
    id: 'fronius-primo-5',
    manufacturer: 'fronius',
    model: 'Primo 5.0-1',
    type: 'ongrid',
    ratedPower: 5,
    maxPvInput: 6.8,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 150, max: 500 },
    maxInputCurrent: 15,
    maxStrings: 2,
    efficiency: 98.0,
    gridVoltage: 220,
    dimensions: '430 × 510 × 210 mm',
    weight: 18.4,
    availableInYemen: true,
    yemenDistributor: 'Imported via Gulf distributors'
  },
  // Solis — Available in Yemen (very popular in Middle East)
  {
    id: 'solis-s5-5k',
    manufacturer: 'solis',
    model: 'S5-EH5K-P',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 7.5,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 90, max: 550 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 97.8,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '420 × 350 × 180 mm',
    weight: 20.5,
    availableInYemen: true,
    yemenDistributor: 'Middle East distributors'
  },
  {
    id: 'solis-s5-10k',
    manufacturer: 'solis',
    model: 'S5-EH10K-P',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 15,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 140, max: 560 },
    maxInputCurrent: 25,
    maxStrings: 4,
    efficiency: 98.2,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 230 mm',
    weight: 30.0,
    availableInYemen: true,
    yemenDistributor: 'Middle East distributors'
  },
  // FoxESS — Available in Yemen
  {
    id: 'foxess-h1-5k',
    manufacturer: 'foxess',
    model: 'H1 5.0',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 7.5,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 90, max: 550 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 97.6,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '420 × 350 × 180 mm',
    weight: 20.0,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  {
    id: 'foxess-h1-10k',
    manufacturer: 'foxess',
    model: 'H1 10.0',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 15,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 140, max: 560 },
    maxInputCurrent: 25,
    maxStrings: 4,
    efficiency: 98.0,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 230 mm',
    weight: 30.0,
    availableInYemen: true,
    yemenDistributor: 'Gulf/Middle East distributors'
  },
  // Victron — Very popular in Yemen for off-grid systems
  {
    id: 'victron-multiplus-5k',
    manufacturer: 'victron',
    model: 'MultiPlus-II 5000VA',
    type: 'offgrid',
    ratedPower: 4,
    maxPvInput: 0,
    numberOfMppt: 0,
    mpptVoltageRange: { min: 0, max: 0 },
    maxInputCurrent: 0,
    maxStrings: 0,
    efficiency: 95,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '462 × 440 × 146 mm',
    weight: 30.0,
    availableInYemen: true,
    yemenDistributor: 'Widely available in Yemen solar shops'
  },
  {
    id: 'victron-multiplus-3k',
    manufacturer: 'victron',
    model: 'MultiPlus-II 3000VA',
    type: 'offgrid',
    ratedPower: 2.4,
    maxPvInput: 0,
    numberOfMppt: 0,
    mpptVoltageRange: { min: 0, max: 0 },
    maxInputCurrent: 0,
    maxStrings: 0,
    efficiency: 94,
    gridVoltage: 220,
    batteryVoltage: 24,
    dimensions: '362 × 320 × 146 mm',
    weight: 18.0,
    availableInYemen: true,
    yemenDistributor: 'Widely available in Yemen solar shops'
  },
  // Afore — Available in Yemen (Middle East market)
  {
    id: 'afore-ht-5k',
    manufacturer: 'afore',
    model: 'AF-H5K-T2',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 7,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 90, max: 550 },
    maxInputCurrent: 15,
    maxStrings: 4,
    efficiency: 97.5,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '420 × 350 × 180 mm',
    weight: 20.0,
    availableInYemen: true,
    yemenDistributor: 'Middle East distributors'
  },
  {
    id: 'afore-ht-10k',
    manufacturer: 'afore',
    model: 'AF-H10K-T2',
    type: 'hybrid',
    ratedPower: 10,
    maxPvInput: 13,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 140, max: 560 },
    maxInputCurrent: 25,
    maxStrings: 4,
    efficiency: 98.0,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '520 × 420 × 230 mm',
    weight: 30.0,
    availableInYemen: true,
    yemenDistributor: 'Middle East distributors'
  },
  // INVT — Available in Yemen (Alnasr Solar sells INVT)
  {
    id: 'invt-5kw-hybrid',
    manufacturer: 'invt',
    model: 'BS5K-48',
    type: 'hybrid',
    ratedPower: 5,
    maxPvInput: 6,
    numberOfMppt: 2,
    mpptVoltageRange: { min: 90, max: 500 },
    maxInputCurrent: 15,
    maxStrings: 2,
    efficiency: 97.0,
    gridVoltage: 220,
    batteryVoltage: 48,
    dimensions: '440 × 350 × 170 mm',
    weight: 18.5,
    availableInYemen: true,
    yemenDistributor: 'Alnasr Solar (Yemen)'
  },
];

export function getInvertersByManufacturer(manufacturer: string): InverterData[] {
  return inverters.filter(i => i.manufacturer === manufacturer);
}

export function getInvertersByType(type: InverterData['type']): InverterData[] {
  return inverters.filter(i => i.type === type);
}

export function getInverterById(id: string): InverterData | undefined {
  return inverters.find(i => i.id === id);
}

export function getInvertersByPowerRange(min: number, max: number): InverterData[] {
  return inverters.filter(i => i.ratedPower >= min && i.ratedPower <= max);
}

export function searchInverters(query: string): InverterData[] {
  const q = query.toLowerCase();
  return inverters.filter(
    i =>
      i.model.toLowerCase().includes(q) ||
      i.manufacturer.toLowerCase().includes(q) ||
      i.type.toLowerCase().includes(q)
  );
}
