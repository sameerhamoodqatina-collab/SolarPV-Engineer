export interface ProjectInfo {
  projectName: string;
  location: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  gridVoltage: number;
  frequency: number;
  phaseType: 'single' | 'three';
  systemType: 'ongrid' | 'offgrid' | 'hybrid';
  application: ApplicationType;
}

export type ApplicationType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agriculture'
  | 'hospital'
  | 'datacenter'
  | 'factory';

export interface LoadItem {
  id: string;
  name: string;
  power: number;
  quantity: number;
  powerFactor: number;
  efficiency: number;
  startingCurrent: number;
  workingHours: number;
  startTime: number;
  endTime: number;
  scheduleType: 'day' | 'night' | 'always';
  loadType: 'critical' | 'optional';
  peakHours: boolean;
}

export interface LoadProfile {
  loads: LoadItem[];
  hourlyLoad: number[];
  dailyEnergy: number;
  nightEnergy: number;
  dayEnergy: number;
  peakDemand: number;
  averageDemand: number;
  maximumDemand: number;
}

export interface SolarResource {
  country: string;
  city: string;
  peakSunHours: number;
  averageIrradiance: number;
  monthlyIrradiance: number[];
  ambientTemperature: number[];
  panelTemperature: number;
  altitude: number;
  losses: LossBreakdown;
}

export interface LossBreakdown {
  shading: number;
  dust: number;
  cableLoss: number;
  mismatchLoss: number;
  soiling: number;
  temperatureLoss: number;
  systemLoss: number;
}

export interface PVArrayDesign {
  requiredPVPower: number;
  dcAcRatio: number;
  numberOfPanels: number;
  seriesPanels: number;
  parallelStrings: number;
  stringVoltage: number;
  voc: number;
  vmp: number;
  isc: number;
  imp: number;
  temperatureCorrection: number;
  maxStringVoltage: number;
  minMPPTVoltage: number;
  mpptValidation: boolean;
  inverterCompatibility: boolean;
  safetyMargin: number;
  selectedPanel: SolarPanel | null;
}

export interface SolarPanel {
  id: string;
  manufacturer: string;
  model: string;
  power: number;
  voc: number;
  vmp: number;
  isc: number;
  imp: number;
  tempCoeffVoc: number;
  tempCoeffIsc: number;
  tempCoeffPmax: number;
  noct: number;
  width: number;
  height: number;
  weight: number;
  cells: number;
  efficiency: number;
}

export interface BatteryDesign {
  batteryType: 'lithium' | 'leadacid' | 'gel' | 'agm';
  voltageType: 'high' | 'low';
  backupTime: number;
  nightLoads: number;
  autonomyDays: number;
  dod: number;
  efficiency: number;
  reserveCapacity: number;
  maxDischargeCurrent: number;
  maxChargeCurrent: number;
  batteryVoltage: number;
  batteryCapacity: number;
  totalKwh: number;
  totalAh: number;
  seriesCount: number;
  parallelCount: number;
  totalBatteries: number;
  chargeRate: number;
  dischargeRate: number;
  initialSoc: number;
  sohEstimation: number;
  selectedBattery: Battery | null;
}

export interface Battery {
  id: string;
  manufacturer: string;
  model: string;
  type: 'lithium' | 'leadacid' | 'gel' | 'agm';
  voltage: number;
  capacity: number;
  kwh: number;
  maxDischargeCurrent: number;
  maxChargeCurrent: number;
  dod: number;
  efficiency: number;
  cycleLife: number;
  weight: number;
  width: number;
  height: number;
  depth: number;
}

export interface InverterDesign {
  systemType: 'ongrid' | 'offgrid' | 'hybrid';
  inverterType: 'string' | 'central' | 'micro' | 'battery' | 'hybrid';
  ratedPower: number;
  numberOfMppt: number;
  maxPvInput: number;
  batteryVoltage: number;
  gridVoltage: number;
  safetyFactor: number;
  selectedInverter: Inverter | null;
}

export interface Inverter {
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
}

export interface CableSizing {
  dcCable: CableSpec;
  acCable: CableSpec;
  batteryCable: CableSpec;
  groundCable: CableSpec;
}

export interface CableSpec {
  current: number;
  voltage: number;
  length: number;
  voltageDrop: number;
  voltageDropPercent: number;
  currentCarryingCapacity: number;
  recommendedSize: number;
  cableType: string;
  standard: string;
}

export interface ProtectionDevices {
  mcb: ProtectionDevice;
  mccb: ProtectionDevice;
  fuse: ProtectionDevice;
  spd: ProtectionDevice;
  dcIsolator: ProtectionDevice;
  acIsolator: ProtectionDevice;
  rcbo: ProtectionDevice;
  rcd: ProtectionDevice;
  earthing: ProtectionDevice;
  lightningProtection: ProtectionDevice;
}

export interface ProtectionDevice {
  type: string;
  rating: number;
  breakingCapacity: number;
  poles: number;
  standard: string;
  selected: boolean;
}

export interface BOMItem {
  id: string;
  category: string;
  description: string;
  manufacturer: string;
  model: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface FinancialAnalysis {
  totalSystemCost: number;
  annualEnergy: number;
  annualSavings: number;
  paybackPeriod: number;
  roi: number;
  lcoe: number;
  co2Reduction: number;
  systemLifetime: number;
  annualDegradation: number;
  electricityPrice: number;
  inflationRate: number;
  yearlyCashFlow: number[];
  cumulativeCashFlow: number[];
}

export interface Manufacturer {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  logo: string;
  type: 'panel' | 'inverter' | 'battery' | 'all';
  website: string;
}

export interface HourlyData {
  hour: number;
  solar: number;
  load: number;
  grid: number;
  battery: number;
  soc: number;
}

export interface MonthlyData {
  month: number;
  irradiance: number;
  production: number;
  consumption: number;
  savings: number;
}

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
