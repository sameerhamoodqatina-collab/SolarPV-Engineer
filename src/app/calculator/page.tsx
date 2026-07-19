'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  FolderOpen,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  Sun,
  Battery,
  Zap,
  Cable,
  Shield,
  Package,
  FileText,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type {
  ProjectInfo,
  LoadProfile,
  SolarResource,
  PVArrayDesign,
  BatteryDesign,
  InverterDesign,
  CableSizing,
  CableSpec,
  ProtectionDevices,
  ProtectionDevice,
  BOMItem,
  FinancialAnalysis,
  LoadItem,
} from '@/lib/types';
import {
  calculateLoadProfile,
  designPVArray,
  designBatteryBank,
  selectInverter,
  designAllCables,
  designAllProtection,
  performFullFinancialAnalysis,
  calculateNightEnergy,
  calculateRequiredPVPower,
} from '@/lib/calculations';
import { getEnabledPanels, getEnabledInverters, getEnabledBatteries, getUniquePanelBrands, getUniqueInverterBrands, getUniqueBatteryBrands } from '@/lib/database';
import type { PanelDatabaseEntry } from '@/lib/database/panels';
import type { InverterDatabaseEntry } from '@/lib/database/inverters';
import type { BatteryDatabaseEntry } from '@/lib/database/batteries';
import { autoSizeSystem } from '@/lib/engine/autosizing';
import type { LoadInput } from '@/lib/engine/autosizing';
import ProjectReportStep from '@/components/calculator/ProjectReportStep';
import AIAssistant from '@/components/ai/AIAssistant';
import { countries } from '@/lib/data/countries';
import type { CountryData, CityData } from '@/lib/data/countries';

const TOTAL_STEPS = 10;

const STEP_CONFIG = [
  { id: 0, label: 'steps.projectInfo', icon: MapPin },
  { id: 1, label: 'steps.loadProfile', icon: ClipboardList },
  { id: 2, label: 'steps.solarResource', icon: Sun },
  { id: 3, label: 'steps.pvArray', icon: Sun },
  { id: 4, label: 'steps.battery', icon: Battery },
  { id: 5, label: 'steps.inverter', icon: Zap },
  { id: 6, label: 'steps.cable', icon: Cable },
  { id: 7, label: 'steps.protection', icon: Shield },
  { id: 8, label: 'steps.equipment', icon: Package },
  { id: 9, label: 'steps.report', icon: FileText },
] as const;

function generateBOMItems(
  pv: PVArrayDesign,
  inv: InverterDesign,
  batt: BatteryDesign,
  cables: CableSizing,
  prot: ProtectionDevices,
): BOMItem[] {
  const items: BOMItem[] = [];
  let id = 1;

  if (pv.selectedPanel) {
    items.push({
      id: `bom-${id++}`,
      category: 'PV Module',
      description: `${pv.selectedPanel.manufacturer} ${pv.selectedPanel.model} ${pv.selectedPanel.power}W`,
      manufacturer: pv.selectedPanel.manufacturer,
      model: pv.selectedPanel.model,
      quantity: pv.numberOfPanels,
      unit: 'pcs',
      unitPrice: 0,
      totalPrice: 0,
    });
  }

  if (inv.selectedInverter) {
    items.push({
      id: `bom-${id++}`,
      category: 'Inverter',
      description: `${inv.selectedInverter.manufacturer} ${inv.selectedInverter.model} ${inv.selectedInverter.ratedPower}W`,
      manufacturer: inv.selectedInverter.manufacturer,
      model: inv.selectedInverter.model,
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      totalPrice: 0,
    });
  }

  if (batt.selectedBattery) {
    items.push({
      id: `bom-${id++}`,
      category: 'Battery',
      description: `${batt.selectedBattery.manufacturer} ${batt.selectedBattery.model} ${batt.selectedBattery.voltage}V ${batt.selectedBattery.capacity}Ah`,
      manufacturer: batt.selectedBattery.manufacturer,
      model: batt.selectedBattery.model,
      quantity: batt.totalBatteries,
      unit: 'pcs',
      unitPrice: 0,
      totalPrice: 0,
    });
  }

  const cableCategories: [string, string, CableSpec][] = [
    ['DC Cable (PV)', 'PV DC', cables.dcCable],
    ['AC Cable (Inverter)', 'AC', cables.acCable],
    ['Battery Cable', 'Battery DC', cables.batteryCable],
    ['Ground Cable', 'Earthing', cables.groundCable],
  ];

  for (const [desc, cat, spec] of cableCategories) {
    if (spec.recommendedSize > 0) {
      const length = spec.length || 20;
      items.push({
        id: `bom-${id++}`,
        category: cat,
        description: `${desc} ${spec.recommendedSize}mm² ${spec.cableType || 'Cu/PVC'}`,
        manufacturer: '',
        model: `${spec.recommendedSize}mm²`,
        quantity: Math.ceil(length),
        unit: 'm',
        unitPrice: 0,
        totalPrice: 0,
      });
    }
  }

  const protEntries: [string, ProtectionDevice][] = [
    ['MCB', prot.mcb],
    ['MCCB', prot.mccb],
    ['Fuse', prot.fuse],
    ['SPD', prot.spd],
    ['DC Isolator', prot.dcIsolator],
    ['AC Isolator', prot.acIsolator],
    ['RCBO', prot.rcbo],
  ];

  for (const [name, dev] of protEntries) {
    if (dev.rating > 0) {
      items.push({
        id: `bom-${id++}`,
        category: 'Protection',
        description: `${name} ${dev.rating}A ${dev.poles}P`,
        manufacturer: '',
        model: `${name}-${dev.rating}A`,
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0,
        totalPrice: 0,
      });
    }
  }

  return items;
}

function getDefaultProjectInfo(): ProjectInfo {
  return {
    projectName: '',
    location: '',
    country: 'Yemen',
    city: "Sana'a",
    latitude: 15.3694,
    longitude: 44.1910,
    gridVoltage: 220,
    frequency: 50,
    phaseType: 'single',
    systemType: 'hybrid',
    application: 'residential',
  };
}

function getDefaultLoadProfile(): LoadProfile {
  return {
    loads: [],
    hourlyLoad: new Array(24).fill(0),
    dailyEnergy: 0,
    nightEnergy: 0,
    dayEnergy: 0,
    peakDemand: 0,
    averageDemand: 0,
    maximumDemand: 0,
  };
}

function getDefaultSolarResource(): SolarResource {
  return {
    country: '',
    city: '',
    peakSunHours: 5,
    averageIrradiance: 4.5,
    monthlyIrradiance: [3.5, 4.0, 5.0, 6.0, 6.5, 7.0, 7.5, 7.0, 6.0, 5.0, 4.0, 3.5],
    ambientTemperature: [15, 17, 20, 24, 28, 32, 35, 34, 30, 25, 20, 16],
    panelTemperature: 45,
    altitude: 100,
    losses: {
      shading: 3,
      dust: 2,
      cableLoss: 2,
      mismatchLoss: 2,
      soiling: 1,
      temperatureLoss: 8,
      systemLoss: 2,
    },
  };
}

function getDefaultPVArray(): PVArrayDesign {
  return {
    requiredPVPower: 0,
    dcAcRatio: 1.2,
    numberOfPanels: 0,
    seriesPanels: 0,
    parallelStrings: 0,
    stringVoltage: 0,
    voc: 0,
    vmp: 0,
    isc: 0,
    imp: 0,
    temperatureCorrection: 1,
    maxStringVoltage: 0,
    minMPPTVoltage: 0,
    mpptValidation: true,
    inverterCompatibility: true,
    safetyMargin: 1.25,
    selectedPanel: null,
  };
}

function getDefaultBatteryDesign(): BatteryDesign {
  return {
    batteryType: 'lithium',
    voltageType: 'low',
    backupTime: 4,
    nightLoads: 0,
    autonomyDays: 1,
    dod: 0.8,
    efficiency: 0.95,
    reserveCapacity: 0,
    maxDischargeCurrent: 0,
    maxChargeCurrent: 0,
    batteryVoltage: 48,
    batteryCapacity: 0,
    totalKwh: 0,
    totalAh: 0,
    seriesCount: 1,
    parallelCount: 1,
    totalBatteries: 0,
    chargeRate: 0,
    dischargeRate: 0,
    initialSoc: 80,
    sohEstimation: 100,
    selectedBattery: null,
  };
}

function getDefaultInverterDesign(): InverterDesign {
  return {
    systemType: 'hybrid',
    inverterType: 'hybrid',
    ratedPower: 0,
    numberOfMppt: 1,
    maxPvInput: 0,
    batteryVoltage: 48,
    gridVoltage: 220,
    safetyFactor: 1.25,
    selectedInverter: null,
  };
}

function getDefaultCableSizing(): CableSizing {
  const emptySpec = {
    current: 0,
    voltage: 0,
    length: 0,
    voltageDrop: 0,
    voltageDropPercent: 0,
    currentCarryingCapacity: 0,
    recommendedSize: 0,
    cableType: '',
    standard: '',
  };
  return { dcCable: { ...emptySpec }, acCable: { ...emptySpec }, batteryCable: { ...emptySpec }, groundCable: { ...emptySpec } };
}

function getDefaultProtection(): ProtectionDevices {
  const empty = { type: '', rating: 0, breakingCapacity: 0, poles: 0, standard: '', selected: false };
  return {
    mcb: { ...empty }, mccb: { ...empty }, fuse: { ...empty }, spd: { ...empty },
    dcIsolator: { ...empty }, acIsolator: { ...empty }, rcbo: { ...empty },
    rcd: { ...empty }, earthing: { ...empty }, lightningProtection: { ...empty },
  };
}

function getDefaultFinancial(): FinancialAnalysis {
  return {
    totalSystemCost: 0, annualEnergy: 0, annualSavings: 0, paybackPeriod: 0,
    roi: 0, lcoe: 0, co2Reduction: 0, systemLifetime: 25,
    annualDegradation: 0.5, electricityPrice: 0.12, inflationRate: 2,
    yearlyCashFlow: [], cumulativeCashFlow: [],
  };
}

interface ProjectData {
  projectInfo: ProjectInfo;
  loadProfile: LoadProfile;
  solarResource: SolarResource;
  pvDesign: PVArrayDesign;
  batteryDesign: BatteryDesign;
  inverterDesign: InverterDesign;
  cableSizing: CableSizing;
  protectionDevices: ProtectionDevices;
  bomItems: BOMItem[];
  financialAnalysis: FinancialAnalysis;
}

export default function CalculatorPage() {
  const { t, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(getDefaultProjectInfo);
  const [loadProfile, setLoadProfile] = useState<LoadProfile>(getDefaultLoadProfile);
  const [solarResource, setSolarResource] = useState<SolarResource>(getDefaultSolarResource);
  const [pvDesign, setPvDesign] = useState<PVArrayDesign>(getDefaultPVArray);
  const [batteryDesign, setBatteryDesign] = useState<BatteryDesign>(getDefaultBatteryDesign);
  const [inverterDesign, setInverterDesign] = useState<InverterDesign>(getDefaultInverterDesign);
  const [cableSizing, setCableSizing] = useState<CableSizing>(getDefaultCableSizing);
  const [protectionDevices, setProtectionDevices] = useState<ProtectionDevices>(getDefaultProtection);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [financialAnalysis, setFinancialAnalysis] = useState<FinancialAnalysis>(getDefaultFinancial);
  const [selectedPanelBrand, setSelectedPanelBrand] = useState<string>('');
  const [selectedInverterBrand, setSelectedInverterBrand] = useState<string>('');
  const [selectedBatteryBrand, setSelectedBatteryBrand] = useState<string>('');
  const [autoSelectedPanel, setAutoSelectedPanel] = useState<PanelDatabaseEntry | null>(null);
  const [autoSelectedInverter, setAutoSelectedInverter] = useState<InverterDatabaseEntry | null>(null);
  const [autoSelectedBattery, setAutoSelectedBattery] = useState<BatteryDatabaseEntry | null>(null);
  const [loadInputMethod, setLoadInputMethod] = useState<'simple' | 'professional'>('simple');
  const [dayConsumption, setDayConsumption] = useState<number>(0);
  const [nightConsumption, setNightConsumption] = useState<number>(0);

  const autoCalculate = useCallback(() => {
    if (loadProfile.loads.length === 0) return;

    const profile = calculateLoadProfile(loadProfile.loads);
    setLoadProfile(profile);

    if (profile.dailyEnergy > 0 && solarResource.peakSunHours > 0) {
      const totalLoss = Object.values(solarResource.losses).reduce((a, b) => a + b, 0);
      const requiredPV = calculateRequiredPVPower(profile.dailyEnergy, solarResource.peakSunHours, totalLoss);

      const mockPanel = {
        id: 'default', manufacturer: 'Default', model: 'Standard 400W',
        power: 400, voc: 37.5, vmp: 31.5, isc: 11.5, imp: 10.8,
        tempCoeffVoc: -0.28, tempCoeffIsc: 0.05, tempCoeffPmax: -0.35,
        noct: 45, width: 1.7, height: 1.0, weight: 20, cells: 72, efficiency: 20.5,
      };

      const pvArray = designPVArray(requiredPV, mockPanel, 600, 150, 500, 5, 55);
      setPvDesign(pvArray);

      const lowLoad = profile.dailyEnergy < 3;
      const sysVoltage = lowLoad ? 12 : 48;
      const battDesign = designBatteryBank(
        profile.nightEnergy, batteryDesign.backupTime || 4, batteryDesign.autonomyDays || 1, batteryDesign.dod || 0.8, batteryDesign.efficiency || 0.95, sysVoltage
      );
      setBatteryDesign(battDesign);

      const invDesign: InverterDesign = {
        systemType: projectInfo.systemType,
        inverterType: projectInfo.systemType === 'ongrid' ? 'string' : projectInfo.systemType === 'offgrid' ? 'battery' : 'hybrid',
        ratedPower: profile.peakDemand * 1.25,
        numberOfMppt: Math.ceil(requiredPV / (requiredPV * 1.3)) || 1,
        maxPvInput: requiredPV * 1.25,
        batteryVoltage: sysVoltage,
        gridVoltage: projectInfo.gridVoltage || 220,
        safetyFactor: 1.25,
        selectedInverter: null,
      };
      setInverterDesign(invDesign);

      const cables = designAllCables(pvArray, battDesign, invDesign);
      setCableSizing(cables);

      const protection = designAllProtection(pvArray, battDesign, invDesign);
      setProtectionDevices(protection);

      const annualEnergy = requiredPV / 1000 * solarResource.peakSunHours * 365 * (1 - totalLoss / 100);
      const co2Reduction = annualEnergy * 0.5 / 1000;
      setFinancialAnalysis({
        ...getDefaultFinancial(),
        annualEnergy,
        co2Reduction,
      });

      const autoBom = generateBOMItems(pvArray, invDesign, battDesign, cables, protection);
      setBomItems(autoBom);
    }
  }, [loadProfile.loads, solarResource, projectInfo.gridVoltage]);

  const autoSelectEquipment = useCallback(() => {
    if (!selectedPanelBrand || !selectedInverterBrand || !selectedBatteryBrand) return;

    const totalConsumption = dayConsumption + nightConsumption;
    if (totalConsumption <= 0) return;

    const hourly = new Array(24).fill(0);
    const dayPerHour = dayConsumption / 6;
    const nightPerHour = nightConsumption / 10;
    for (let h = 6; h < 12; h++) hourly[h] = dayPerHour * 1.1;
    for (let h = 12; h < 18; h++) hourly[h] = dayPerHour * 1.3;
    for (let h = 18; h < 24; h++) hourly[h] = nightPerHour;
    for (let h = 0; h < 6; h++) hourly[h] = nightPerHour * 0.7;
    const hourTotal = hourly.reduce((a, b) => a + b, 0);
    const adjustedHourly = hourTotal > 0 ? hourly.map(v => v * totalConsumption / hourTotal) : hourly;

    setLoadProfile({
      loads: [],
      hourlyLoad: adjustedHourly,
      dailyEnergy: totalConsumption,
      nightEnergy: nightConsumption,
      dayEnergy: dayConsumption,
      peakDemand: totalConsumption * 0.4,
      averageDemand: totalConsumption / 24,
      maximumDemand: totalConsumption * 0.4,
    });

    const loadInput: LoadInput = {
      method: loadInputMethod,
      dayConsumption,
      nightConsumption,
      systemVoltage: projectInfo.gridVoltage || 220,
      autonomyDays: 1,
      backupHours: batteryDesign.backupTime || 4,
      batteryType: 'lithium',
      inverterCategory: projectInfo.systemType,
    };

    const allPanels = getEnabledPanels();
    const invCategory = projectInfo.systemType === 'ongrid' ? 'ongrid' : projectInfo.systemType === 'offgrid' ? 'offgrid' : 'hybrid';
    const allInverters = getEnabledInverters(invCategory);
    const lowLoad = totalConsumption < 3;
    const allBatteries = getEnabledBatteries();

    const brandPanels = allPanels.filter(p => p.brand === selectedPanelBrand);
    const brandInverters = allInverters.filter(i => i.brand === selectedInverterBrand);
    const brandBatteries = allBatteries.filter(b => b.brand === selectedBatteryBrand);

    if (brandPanels.length === 0 || brandInverters.length === 0 || brandBatteries.length === 0) return;

    const bestPanel = brandPanels.reduce((best, p) => {
      const bestDist = Math.abs(best.power - 700);
      const pDist = Math.abs(p.power - 700);
      if (pDist < bestDist) return p;
      if (pDist === bestDist && p.efficiency > best.efficiency) return p;
      return best;
    });

    const peakSunHours = solarResource.peakSunHours || 5.5;
    const requiredPvKw = totalConsumption / (peakSunHours * 0.80);
    const requiredPeakW = totalConsumption * 0.4;
    const requiredInverterKw = requiredPeakW * 1.25;

    const bestInverter = brandInverters
      .filter(i => i.ratedPower >= requiredInverterKw * 0.7 && i.ratedPower <= requiredInverterKw * 2.5)
      .sort((a, b) => {
        const distA = Math.abs(a.ratedPower - requiredInverterKw);
        const distB = Math.abs(b.ratedPower - requiredInverterKw);
        if (distA !== distB) return distA - distB;
        return b.efficiency - a.efficiency;
      })[0]
      || brandInverters.reduce((best, i) => {
        const distBest = Math.abs(best.ratedPower - requiredInverterKw);
        const distI = Math.abs(i.ratedPower - requiredInverterKw);
        return distI < distBest ? i : best;
      });

    const backupHr = batteryDesign.backupTime || 4;
    const nightHours = 10;
    const nightLoadKw = nightConsumption / nightHours;
    const backupEnergyKwh = nightLoadKw * backupHr;
    const requiredBatteryKwh = backupEnergyKwh / (0.95 * 0.95);

    const filteredByKwh = brandBatteries.filter(b => b.specs.kwh <= requiredBatteryKwh * 2 && b.specs.kwh >= requiredBatteryKwh * 0.1);
    const bestBattery = filteredByKwh.length > 0
      ? filteredByKwh.sort((a, b) => {
          const distA = Math.abs(a.specs.kwh - requiredBatteryKwh);
          const distB = Math.abs(b.specs.kwh - requiredBatteryKwh);
          if (distA !== distB) return distA - distB;
          if (lowLoad) return a.specs.nominalVoltage - b.specs.nominalVoltage;
          return b.specs.cycleLife - a.specs.cycleLife;
        })[0]
      : brandBatteries.sort((a, b) => {
          const distA = Math.abs(a.specs.kwh - requiredBatteryKwh);
          const distB = Math.abs(b.specs.kwh - requiredBatteryKwh);
          if (distA !== distB) return distA - distB;
          return lowLoad ? a.specs.nominalVoltage - b.specs.nominalVoltage : b.specs.cycleLife - a.specs.cycleLife;
        })[0];

    setAutoSelectedPanel(bestPanel);
    setAutoSelectedInverter(bestInverter);
    setAutoSelectedBattery(bestBattery);

    const solarData = {
      peakSunHours: solarResource.peakSunHours || 5.5,
      avgDailySolar: solarResource.averageIrradiance || 4.5,
    };

    const result = autoSizeSystem(loadInput, bestPanel, bestInverter, bestBattery, solarData);

    const systemVoltage = lowLoad ? 12 : (result.battery.requiredVoltage || 48);

    const newPvDesign: PVArrayDesign = {
      requiredPVPower: result.pv.requiredCapacity,
      dcAcRatio: result.inverter.dcAcRatio,
      numberOfPanels: result.pv.numberOfPanels,
      seriesPanels: result.pv.panelsPerString,
      parallelStrings: result.pv.numberOfStrings,
      stringVoltage: result.pv.panelsPerString * bestPanel.vmp,
      voc: result.pv.panelsPerString * bestPanel.voc,
      vmp: result.pv.panelsPerString * bestPanel.vmp,
      isc: bestPanel.isc,
      imp: bestPanel.imp,
      temperatureCorrection: 1,
      maxStringVoltage: result.pv.panelsPerString * bestPanel.voc * 1.12,
      minMPPTVoltage: bestInverter.mppt.mpptVoltageRange.min,
      mpptValidation: true,
      inverterCompatibility: true,
      safetyMargin: 1.25,
      selectedPanel: {
        id: bestPanel.id,
        manufacturer: bestPanel.brand,
        model: bestPanel.model,
        power: bestPanel.power,
        voc: bestPanel.voc,
        vmp: bestPanel.vmp,
        isc: bestPanel.isc,
        imp: bestPanel.imp,
        tempCoeffVoc: bestPanel.tempCoeffVoc,
        tempCoeffIsc: bestPanel.tempCoeffIsc,
        tempCoeffPmax: bestPanel.tempCoeffPmax,
        noct: bestPanel.noct,
        width: bestPanel.dimensions.width / 1000,
        height: bestPanel.dimensions.height / 1000,
        weight: bestPanel.weight,
        cells: bestPanel.cells,
        efficiency: bestPanel.efficiency,
      },
    };
    setPvDesign(newPvDesign);

    const newBattDesign: BatteryDesign = {
      batteryType: bestBattery.type,
      voltageType: 'low',
      backupTime: result.battery.backupTime,
      nightLoads: nightConsumption,
      autonomyDays: 1,
      dod: bestBattery.specs.dod / 100,
      efficiency: bestBattery.specs.efficiency / 100,
      reserveCapacity: 0,
      maxDischargeCurrent: bestBattery.chargingLimits.maxDischargeCurrent,
      maxChargeCurrent: bestBattery.chargingLimits.maxChargeCurrent,
      batteryVoltage: systemVoltage,
      batteryCapacity: bestBattery.specs.capacity,
      totalKwh: result.battery.totalCapacity,
      totalAh: result.battery.requiredCapacity / systemVoltage * 1000,
      seriesCount: result.battery.batteriesInSeries,
      parallelCount: result.battery.batteriesInParallel,
      totalBatteries: result.battery.numberOfBatteries,
      chargeRate: bestBattery.chargingLimits.maxChargeCurrent,
      dischargeRate: bestBattery.chargingLimits.maxDischargeCurrent,
      initialSoc: 80,
      sohEstimation: 100,
      selectedBattery: {
        id: bestBattery.id,
        manufacturer: bestBattery.brand,
        model: bestBattery.model,
        type: bestBattery.type,
        voltage: bestBattery.specs.nominalVoltage,
        capacity: bestBattery.specs.capacity,
        kwh: bestBattery.specs.kwh,
        maxDischargeCurrent: bestBattery.chargingLimits.maxDischargeCurrent,
        maxChargeCurrent: bestBattery.chargingLimits.maxChargeCurrent,
        dod: bestBattery.specs.dod,
        efficiency: bestBattery.specs.efficiency,
        cycleLife: bestBattery.specs.cycleLife,
        weight: bestBattery.specs.weight,
        width: bestBattery.specs.dimensions.width,
        height: bestBattery.specs.dimensions.height,
        depth: bestBattery.specs.dimensions.depth,
      },
    };
    setBatteryDesign(newBattDesign);

    const newInvDesign: InverterDesign = {
      systemType: projectInfo.systemType,
      inverterType: projectInfo.systemType === 'ongrid' ? 'string' : projectInfo.systemType === 'offgrid' ? 'battery' : 'hybrid',
      ratedPower: bestInverter.ratedPower,
      numberOfMppt: bestInverter.mppt.numberOfMppts,
      maxPvInput: bestInverter.maxPvInput,
      batteryVoltage: systemVoltage,
      gridVoltage: projectInfo.gridVoltage || 220,
      safetyFactor: 1.25,
      selectedInverter: {
        id: bestInverter.id,
        manufacturer: bestInverter.brand,
        model: bestInverter.model,
        type: bestInverter.category as 'hybrid' | 'offgrid' | 'ongrid',
        ratedPower: bestInverter.ratedPower,
        maxPvInput: bestInverter.maxPvInput,
        numberOfMppt: bestInverter.mppt.numberOfMppts,
        mpptVoltageRange: bestInverter.mppt.mpptVoltageRange,
        maxInputCurrent: bestInverter.mppt.maxInputCurrentPerMppt,
        maxStrings: bestInverter.mppt.maxStringsPerMppt * bestInverter.mppt.numberOfMppts,
        efficiency: bestInverter.efficiency,
        gridVoltage: bestInverter.gridVoltage,
        batteryVoltage: bestInverter.batteryCompatibility?.supportedVoltage?.[0],
        dimensions: bestInverter.dimensions,
        weight: bestInverter.weight,
      },
    };
    setInverterDesign(newInvDesign);

    const newCables = designAllCables(newPvDesign, newBattDesign, newInvDesign);
    setCableSizing(newCables);

    const newProtection = designAllProtection(newPvDesign, newBattDesign, newInvDesign);
    setProtectionDevices(newProtection);

    const newBom = generateBOMItems(newPvDesign, newInvDesign, newBattDesign, newCables, newProtection);
    setBomItems(newBom);
  }, [selectedPanelBrand, selectedInverterBrand, selectedBatteryBrand, dayConsumption, nightConsumption, loadInputMethod, solarResource, projectInfo.gridVoltage]);

  useEffect(() => {
    const timer = setTimeout(autoCalculate, 300);
    return () => clearTimeout(timer);
  }, [loadProfile.loads, solarResource, projectInfo.gridVoltage]);

  const goToNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const saveProject = useCallback(() => {
    try {
      const data: ProjectData = {
        projectInfo, loadProfile, solarResource, pvDesign,
        batteryDesign, inverterDesign, cableSizing, protectionDevices,
        bomItems, financialAnalysis,
      };
      localStorage.setItem('solar-pv-project', JSON.stringify(data));
      setSaveMessage(t('validation.saveSuccess'));
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage(t('validation.saveError'));
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [projectInfo, loadProfile, solarResource, pvDesign, batteryDesign, inverterDesign, cableSizing, protectionDevices, bomItems, financialAnalysis, t]);

  const loadProject = useCallback(() => {
    try {
      const raw = localStorage.getItem('solar-pv-project');
      if (!raw) {
        setSaveMessage('No saved project found');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
      const data: ProjectData = JSON.parse(raw);
      setProjectInfo(data.projectInfo || getDefaultProjectInfo());
      setLoadProfile(data.loadProfile || getDefaultLoadProfile());
      setSolarResource(data.solarResource || getDefaultSolarResource());
      setPvDesign(data.pvDesign || getDefaultPVArray());
      setBatteryDesign(data.batteryDesign || getDefaultBatteryDesign());
      setInverterDesign(data.inverterDesign || getDefaultInverterDesign());
      setCableSizing(data.cableSizing || getDefaultCableSizing());
      setProtectionDevices(data.protectionDevices || getDefaultProtection());
      setBomItems(data.bomItems || []);
      setFinancialAnalysis(data.financialAnalysis || getDefaultFinancial());
      setSaveMessage(t('validation.loadSuccess'));
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage(t('validation.loadError'));
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [t]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectInfoStep 
            projectInfo={projectInfo} 
            onChange={setProjectInfo} 
            onSolarAutoFill={(cityData) => {
              setSolarResource(prev => ({
                ...prev,
                country: projectInfo.country,
                city: projectInfo.city,
                peakSunHours: cityData.peakSunHours,
                averageIrradiance: cityData.averageIrradiance,
                monthlyIrradiance: cityData.monthlyIrradiance,
                ambientTemperature: cityData.ambientTemperature,
              }));
            }}
          />
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-solar-sun" />
                {t('steps.loadProfile') || 'Load Profile'}
              </h2>
              <p className="text-text-secondary mt-1">Select load input method and enter consumption data</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLoadInputMethod('simple')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  loadInputMethod === 'simple'
                    ? 'border-solar-sky bg-solar-sky/10 text-solar-sky'
                    : 'border-border hover:border-solar-sky/30'
                }`}
              >
                <div className="font-semibold">Simple Method</div>
                <div className="text-xs text-text-muted mt-1">Enter day & night consumption in kWh</div>
              </button>
              <button
                onClick={() => setLoadInputMethod('professional')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  loadInputMethod === 'professional'
                    ? 'border-solar-sky bg-solar-sky/10 text-solar-sky'
                    : 'border-border hover:border-solar-sky/30'
                }`}
              >
                <div className="font-semibold">Professional Load Schedule</div>
                <div className="text-xs text-text-muted mt-1">Detailed hourly load table</div>
              </button>
            </div>
            {loadInputMethod === 'simple' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-primary">Day Consumption (kWh)</label>
                  <input
                    type="number"
                    value={dayConsumption || ''}
                    onChange={(e) => setDayConsumption(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none text-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-primary">Night Consumption (kWh)</label>
                  <input
                    type="number"
                    value={nightConsumption || ''}
                    onChange={(e) => setNightConsumption(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none text-text-primary"
                  />
                </div>
                <div className="col-span-2 p-4 rounded-xl bg-solar-sun/5 border border-solar-sun/20">
                  <div className="text-sm text-text-secondary">Total Daily Consumption</div>
                  <div className="text-2xl font-bold text-solar-sun">{dayConsumption + nightConsumption} kWh</div>
                </div>
              </div>
            ) : (
              <LoadProfileStep loadProfile={loadProfile} onChange={setLoadProfile} />
            )}
          </div>
        );
      case 2:
        return (
          <SolarResourceStep solarResource={solarResource} onChange={setSolarResource} />
        );
      case 3:
        return (
          <PVArrayStep pvDesign={pvDesign} onChange={setPvDesign} />
        );
      case 4:
        return (
          <BatteryStep batteryDesign={batteryDesign} onChange={setBatteryDesign} />
        );
      case 5:
        return (
          <InverterStep inverterDesign={inverterDesign} onChange={setInverterDesign} />
        );
      case 6:
        return (
          <CableStep cableSizing={cableSizing} onChange={setCableSizing} />
        );
      case 7:
        return (
          <ProtectionStep protectionDevices={protectionDevices} onChange={setProtectionDevices} />
        );
      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <Package className="w-6 h-6 text-solar-sun" />
                Equipment Selection — Yemen Market
              </h2>
              <p className="text-text-secondary mt-1">Select your preferred brands. The software will automatically choose the best model.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Sun className="w-4 h-4 text-solar-sun" /> Solar Panel Brand
                </label>
                <select
                  value={selectedPanelBrand}
                  onChange={(e) => setSelectedPanelBrand(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none text-text-primary"
                >
                  <option value="">Select Panel Brand</option>
                  {getUniquePanelBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {autoSelectedPanel && (
                  <div className="p-3 rounded-lg bg-solar-sun/5 border border-solar-sun/20 text-sm">
                    <div className="font-bold text-solar-sun">{autoSelectedPanel.brand} {autoSelectedPanel.model}</div>
                    <div className="text-text-secondary">{autoSelectedPanel.power}W | {autoSelectedPanel.efficiency}% | {autoSelectedPanel.cellType}</div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4 text-solar-purple" /> Inverter Brand
                </label>
                <select
                  value={selectedInverterBrand}
                  onChange={(e) => setSelectedInverterBrand(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none text-text-primary"
                >
                  <option value="">Select Inverter Brand</option>
                  {getUniqueInverterBrands(projectInfo.systemType).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {autoSelectedInverter && (
                  <div className="p-3 rounded-lg bg-solar-purple/5 border border-solar-purple/20 text-sm">
                    <div className="font-bold text-solar-purple">{autoSelectedInverter.brand} {autoSelectedInverter.model}</div>
                    <div className="text-text-secondary">{autoSelectedInverter.ratedPower}kW | {autoSelectedInverter.category} | {autoSelectedInverter.mppt.numberOfMppts} MPPT</div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Battery className="w-4 h-4 text-solar-green" /> Battery Brand
                </label>
                <select
                  value={selectedBatteryBrand}
                  onChange={(e) => setSelectedBatteryBrand(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none text-text-primary"
                >
                  <option value="">Select Battery Brand</option>
                  {getUniqueBatteryBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {autoSelectedBattery && (
                  <div className="p-3 rounded-lg bg-solar-green/5 border border-solar-green/20 text-sm">
                    <div className="font-bold text-solar-green">{autoSelectedBattery.brand} {autoSelectedBattery.model}</div>
                    <div className="text-text-secondary">{autoSelectedBattery.specs.kwh}kWh | {autoSelectedBattery.specs.nominalVoltage}V {autoSelectedBattery.specs.capacity}Ah | {autoSelectedBattery.specs.cycleLife} cycles</div>
                  </div>
                )}
              </div>
            </div>
            {selectedPanelBrand && selectedInverterBrand && selectedBatteryBrand && (
              <button
                onClick={autoSelectEquipment}
                className="w-full py-3 rounded-xl bg-solar-sky text-white font-bold hover:bg-solar-sky/90 transition-colors"
              >
                Auto-Calculate System with Selected Brands
              </button>
            )}
          </div>
        );
      case 9:
        return (
          <ProjectReportStep
            projectInfo={projectInfo}
            loadProfile={loadProfile}
            solarResource={solarResource}
            pvDesign={pvDesign}
            batteryDesign={batteryDesign}
            inverterDesign={inverterDesign}
            cableSizing={cableSizing}
            protectionDevices={protectionDevices}
            bomItems={bomItems}
            financialAnalysis={financialAnalysis}
          />
        );
      default:
        return null;
    }
  }, [currentStep, projectInfo, loadProfile, solarResource, pvDesign, batteryDesign, inverterDesign, cableSizing, protectionDevices, bomItems, financialAnalysis, loadInputMethod, dayConsumption, nightConsumption, selectedPanelBrand, selectedInverterBrand, selectedBatteryBrand, autoSelectedPanel, autoSelectedInverter, autoSelectedBattery]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 z-40 bg-solar-sky text-white p-3 rounded-full shadow-lg lg:hidden print:hidden"
        style={isRTL ? { left: '1rem' } : { right: '1rem' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={isRTL ? { x: 300 } : { x: -300 }}
              animate={{ x: 0 }}
              exit={isRTL ? { x: 300 } : { x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 z-50 w-72 bg-surface border-e border-border shadow-xl lg:hidden print:hidden"
              style={isRTL ? { right: 0 } : { left: 0 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-bold text-text-primary">{t('nav.calculator')}</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-alt transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
                {STEP_CONFIG.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(step.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-solar-sky/10 text-solar-sky border border-solar-sky/20'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{t(step.label)}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ms-auto shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-e border-border bg-surface shrink-0 print:hidden" dir="ltr">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-text-primary text-sm">{t('nav.calculator')}</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Step {currentStep + 1} of {STEP_CONFIG.length}
          </p>
          <div className="mt-2 h-1.5 bg-surface-alt rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-solar-sky to-solar-sun rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEP_CONFIG.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {STEP_CONFIG.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-solar-sky/10 text-solar-sky border border-solar-sky/20 shadow-sm'
                    : isCompleted
                      ? 'text-solar-green hover:bg-solar-green/5 border border-transparent'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <Icon className="w-4 h-4" />
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-solar-green rounded-full" />
                  )}
                </div>
                <span className="truncate">{t(step.label)}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ms-auto shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-[10px] text-text-muted text-center">
            Solar PV Engineer v1.0
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto" dir="ltr">
        <div className="max-w-5xl mx-auto p-6 lg:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.25 }}
        >
          {renderStep}
        </motion.div>
      </AnimatePresence>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-solar-green/10 border border-solar-green/20 text-solar-green text-sm font-medium shadow-lg z-50"
        >
          {saveMessage}
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border print:hidden">
        <button
          onClick={goToPrev}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-surface border border-border text-text-primary hover:bg-surface-alt transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={saveProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-solar-green/10 text-solar-green border border-solar-green/20 hover:bg-solar-green/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            {t('common.save')}
          </button>
          <button
            onClick={loadProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-alt border border-border text-text-secondary hover:bg-surface transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={goToNext}
          disabled={currentStep === TOTAL_STEPS - 1}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-solar-sky text-white hover:bg-solar-sky/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
        </div>
      </main>

      <AIAssistant
        projectInfo={projectInfo}
        loadProfile={loadProfile}
        solarResource={solarResource}
        pvDesign={pvDesign}
        batteryDesign={batteryDesign}
        inverterDesign={inverterDesign}
        cableSizing={cableSizing}
        protectionDevices={protectionDevices}
      />
    </div>
  );
}

/* ─── Inline Step Components ─────────────────────────────── */

function ProjectInfoStep({
  projectInfo,
  onChange,
  onSolarAutoFill,
}: {
  projectInfo: ProjectInfo;
  onChange: (p: ProjectInfo) => void;
  onSolarAutoFill: (cityData: CityData) => void;
}) {
  const { t, language } = useLanguage();

  const update = (field: keyof ProjectInfo, value: string | number) => {
    onChange({ ...projectInfo, [field]: value });
  };

  const selectedCountry = countries.find((c) => c.name === projectInfo.country || c.nameAr === projectInfo.country);
  const cities = selectedCountry?.cities || [];

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      onChange({
        ...projectInfo,
        country: language === 'ar' ? country.nameAr : country.name,
        city: '',
        latitude: 0,
        longitude: 0,
      });
    }
  };

  const handleCityChange = (cityName: string) => {
    const city = cities.find(
      (c) => c.name === cityName || c.nameAr === cityName
    );
    if (city) {
      const displayName = language === 'ar' ? city.nameAr : city.name;
      onChange({
        ...projectInfo,
        city: displayName,
        latitude: city.latitude,
        longitude: city.longitude,
      });
      onSolarAutoFill(city);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('project.title')}</h2>
        <p className="text-text-secondary mt-1">{t('project.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.projectName')}</label>
          <input
            type="text"
            value={projectInfo.projectName}
            placeholder={t('project.projectNamePlaceholder')}
            onChange={(e) => update('projectName', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.location')}</label>
          <input
            type="text"
            value={projectInfo.location}
            placeholder={t('project.locationPlaceholder')}
            onChange={(e) => update('location', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.country')}</label>
          <select
            value={selectedCountry?.code || ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          >
            <option value="">{t('project.countryPlaceholder')}</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {language === 'ar' ? country.nameAr : country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.city')}</label>
          <select
            value={selectedCountry ? (cities.find((c) => (language === 'ar' ? c.nameAr : c.name) === projectInfo.city)?.name || '') : ''}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedCountry}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors disabled:opacity-50"
          >
            <option value="">{t('project.cityPlaceholder')}</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {language === 'ar' ? city.nameAr : city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.latitude')}</label>
          <input
            type="number"
            value={projectInfo.latitude || ''}
            placeholder={t('project.latitudePlaceholder')}
            onChange={(e) => update('latitude', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.longitude')}</label>
          <input
            type="number"
            value={projectInfo.longitude || ''}
            placeholder={t('project.longitudePlaceholder')}
            onChange={(e) => update('longitude', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <a
            href={`https://www.openstreetmap.org/?mlat=${projectInfo.latitude || 15}&mlon=${projectInfo.longitude || 44}#map=10/${projectInfo.latitude || 15}/${projectInfo.longitude || 44}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-solar-green/10 text-solar-green border border-solar-green/20 text-sm font-medium hover:bg-solar-green/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t('project.pickFromMap') || 'Pick Location from Map'}
          </a>
          <span className="text-xs text-text-muted">Opens OpenStreetMap</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.gridVoltage')}</label>
          <input
            type="number"
            value={projectInfo.gridVoltage}
            placeholder={t('project.gridVoltagePlaceholder')}
            onChange={(e) => update('gridVoltage', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.frequency')}</label>
          <input
            type="number"
            value={projectInfo.frequency}
            placeholder={t('project.frequencyPlaceholder')}
            onChange={(e) => update('frequency', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.phaseType')}</label>
          <select
            value={projectInfo.phaseType}
            onChange={(e) => update('phaseType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          >
            <option value="single">Single Phase</option>
            <option value="three">Three Phase</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">System Type</label>
          <select
            value={projectInfo.systemType}
            onChange={(e) => update('systemType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          >
            <option value="hybrid">Hybrid (On-Grid + Battery)</option>
            <option value="ongrid">On-Grid (Grid-Tied Only)</option>
            <option value="offgrid">Off-Grid (Standalone)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.application')}</label>
          <select
            value={projectInfo.application}
            onChange={(e) => update('application', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none transition-colors"
          >
            {['residential', 'commercial', 'industrial', 'agriculture', 'hospital', 'datacenter', 'factory'].map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function LoadProfileStep({
  loadProfile,
  onChange,
}: {
  loadProfile: LoadProfile;
  onChange: (p: LoadProfile) => void;
}) {
  const { t } = useLanguage();

  const addLoad = () => {
    const newLoad: LoadItem = {
      id: `load-${Date.now()}`,
      name: '',
      power: 0,
      quantity: 1,
      powerFactor: 0.85,
      efficiency: 90,
      startingCurrent: 1,
      workingHours: 8,
      startTime: 8,
      endTime: 16,
      scheduleType: 'day',
      loadType: 'critical',
      peakHours: true,
    };
    onChange({ ...loadProfile, loads: [...loadProfile.loads, newLoad] });
  };

  const removeLoad = (id: string) => {
    onChange({ ...loadProfile, loads: loadProfile.loads.filter((l) => l.id !== id) });
  };

  const updateLoad = (id: string, field: keyof LoadItem, value: string | number | boolean) => {
    const updated = loadProfile.loads.map((l) =>
      l.id === id ? { ...l, [field]: value } : l
    );
    onChange({ ...loadProfile, loads: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{t('load.title')}</h2>
          <p className="text-text-secondary mt-1">{t('load.subtitle')}</p>
        </div>
        <button
          onClick={addLoad}
          className="px-4 py-2 rounded-xl bg-solar-sky text-white text-sm font-medium hover:bg-solar-sky/90 transition-colors shadow-sm"
        >
          + {t('load.addLoad')}
        </button>
      </div>

      {loadProfile.loads.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p>{t('load.noLoads')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loadProfile.loads.map((load, idx) => (
            <div key={load.id} className="p-4 rounded-xl border border-border bg-surface hover:border-border-hover transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted">Load #{idx + 1}</span>
                <button onClick={() => removeLoad(load.id)} className="text-xs text-solar-red hover:underline">
                  {t('load.removeLoad')}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  value={load.name}
                  placeholder={t('load.loadNamePlaceholder')}
                  onChange={(e) => updateLoad(load.id, 'name', e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-surface-alt border border-border text-sm focus:border-solar-sky outline-none"
                />
                <input
                  type="number"
                  value={load.power || ''}
                  placeholder={t('load.powerPlaceholder')}
                  onChange={(e) => updateLoad(load.id, 'power', parseFloat(e.target.value) || 0)}
                  className="px-2.5 py-2 rounded-lg bg-surface-alt border border-border text-sm focus:border-solar-sky outline-none"
                />
                <input
                  type="number"
                  value={load.quantity || ''}
                  placeholder={t('load.quantityPlaceholder')}
                  onChange={(e) => updateLoad(load.id, 'quantity', parseInt(e.target.value) || 0)}
                  className="px-2.5 py-2 rounded-lg bg-surface-alt border border-border text-sm focus:border-solar-sky outline-none"
                />
                <input
                  type="number"
                  value={load.workingHours || ''}
                  placeholder={t('load.workingHoursPlaceholder')}
                  onChange={(e) => updateLoad(load.id, 'workingHours', parseInt(e.target.value) || 0)}
                  className="px-2.5 py-2 rounded-lg bg-surface-alt border border-border text-sm focus:border-solar-sky outline-none"
                />
                <select
                  value={load.scheduleType}
                  onChange={(e) => updateLoad(load.id, 'scheduleType', e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-surface-alt border border-border text-sm focus:border-solar-sky outline-none"
                >
                  <option value="day">{t('load.dayOnly')}</option>
                  <option value="night">{t('load.nightOnly')}</option>
                  <option value="always">{t('load.alwaysOn')}</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {loadProfile.loads.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            [t('load.dailyEnergy'), `${loadProfile.dailyEnergy.toFixed(1)} kWh`],
            [t('load.peakDemand'), `${loadProfile.peakDemand.toFixed(2)} kW`],
            [t('load.averageDemand'), `${loadProfile.averageDemand.toFixed(2)} kW`],
            [t('load.nightEnergy'), `${loadProfile.nightEnergy.toFixed(1)} kWh`],
          ].map(([label, value]) => (
            <div key={label} className="p-3 rounded-xl bg-solar-sky/5 border border-solar-sky/20 text-center">
              <div className="text-lg font-bold text-solar-sky">{value}</div>
              <div className="text-xs text-text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SolarResourceStep({
  solarResource,
  onChange,
}: {
  solarResource: SolarResource;
  onChange: (s: SolarResource) => void;
}) {
  const { t } = useLanguage();

  const updateLoss = (field: keyof SolarResource['losses'], value: number) => {
    onChange({
      ...solarResource,
      losses: { ...solarResource.losses, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('solar.title')}</h2>
        <p className="text-text-secondary mt-1">{t('solar.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.country')}</label>
          <input
            type="text"
            value={solarResource.country || '-'}
            readOnly
            className="w-full px-3 py-2.5 rounded-xl bg-surface-alt border border-border text-text-muted text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('project.city')}</label>
          <input
            type="text"
            value={solarResource.city || '-'}
            readOnly
            className="w-full px-3 py-2.5 rounded-xl bg-surface-alt border border-border text-text-muted text-sm cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('solar.peakSunHours')}</label>
          <input
            type="number"
            value={solarResource.peakSunHours}
            onChange={(e) => onChange({ ...solarResource, peakSunHours: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('solar.averageIrradiance')}</label>
          <input
            type="number"
            value={solarResource.averageIrradiance}
            onChange={(e) => onChange({ ...solarResource, averageIrradiance: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('solar.altitude')}</label>
          <input
            type="number"
            value={solarResource.altitude}
            onChange={(e) => onChange({ ...solarResource, altitude: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">{t('solar.losses')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(
            [
              ['shading', t('solar.shading')],
              ['dust', t('solar.dust')],
              ['cableLoss', t('solar.cableLoss')],
              ['mismatchLoss', t('solar.mismatchLoss')],
              ['soiling', t('solar.soiling')],
              ['temperatureLoss', t('solar.temperatureLoss')],
              ['systemLoss', t('solar.systemLoss')],
            ] as [keyof SolarResource['losses'], string][]
          ).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-text-secondary mb-1">{label} (%)</label>
              <input
                type="number"
                value={solarResource.losses[key]}
                onChange={(e) => updateLoss(key, parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-2 rounded-lg bg-surface-alt border border-border text-sm focus:border-solar-sky outline-none"
              />
            </div>
          ))}
          <div className="p-2.5 rounded-lg bg-solar-sky/5 border border-solar-sky/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-bold text-solar-sky">
                {Object.values(solarResource.losses).reduce((a, b) => a + b, 0).toFixed(1)}%
              </div>
              <div className="text-[10px] text-text-muted">{t('solar.totalLosses')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PVArrayStep({
  pvDesign,
  onChange,
}: {
  pvDesign: PVArrayDesign;
  onChange: (p: PVArrayDesign) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('pv.title')}</h2>
        <p className="text-text-secondary mt-1">{t('pv.subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            ['requiredPVPower', t('pv.requiredPVPower'), 'W'],
            ['numberOfPanels', t('pv.numberOfPanels'), ''],
            ['seriesPanels', t('pv.seriesPanels'), ''],
            ['parallelStrings', t('pv.parallelStrings'), ''],
            ['stringVoltage', t('pv.stringVoltage'), 'V'],
            ['voc', t('pv.voc'), 'V'],
            ['vmp', t('pv.vmp'), 'V'],
            ['mpptValidation', t('pv.mpptValidation'), ''],
          ] as [keyof PVArrayDesign, string, string][]
        ).map(([key, label, unit]) => (
          <div key={key as string} className="p-3 rounded-xl bg-surface border border-border">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="text-lg font-bold text-text-primary mt-1">
              {typeof pvDesign[key] === 'boolean'
                ? (pvDesign[key] ? 'PASS' : 'FAIL')
                : `${Number(pvDesign[key] || 0).toLocaleString()} ${unit}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatteryStep({
  batteryDesign,
  onChange,
}: {
  batteryDesign: BatteryDesign;
  onChange: (b: BatteryDesign) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('battery.title')}</h2>
        <p className="text-text-secondary mt-1">{t('battery.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('battery.backupTime')}</label>
          <input
            type="number"
            value={batteryDesign.backupTime}
            onChange={(e) => onChange({ ...batteryDesign, backupTime: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('battery.dod')}</label>
          <input
            type="number"
            value={batteryDesign.dod * 100}
            onChange={(e) => onChange({ ...batteryDesign, dod: (parseFloat(e.target.value) || 0) / 100 })}
            className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-text-primary text-sm focus:border-solar-sky outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            ['batteryVoltage', t('battery.batteryVoltage'), 'V'],
            ['batteryCapacity', t('battery.batteryCapacity'), 'Ah'],
            ['totalKwh', t('battery.totalKwh'), 'kWh'],
            ['totalBatteries', t('battery.totalBatteries'), ''],
          ] as [keyof BatteryDesign, string, string][]
        ).map(([key, label, unit]) => (
          <div key={key as string} className="p-3 rounded-xl bg-solar-green/5 border border-solar-green/20 text-center">
            <div className="text-lg font-bold text-solar-green">
              {Number(batteryDesign[key] || 0).toLocaleString()} {unit}
            </div>
            <div className="text-xs text-text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InverterStep({
  inverterDesign,
  onChange,
}: {
  inverterDesign: InverterDesign;
  onChange: (i: InverterDesign) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('inverter.title')}</h2>
        <p className="text-text-secondary mt-1">{t('inverter.subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(
          [
            ['systemType', t('inverter.systemType')],
            ['ratedPower', t('inverter.ratedPower')],
            ['numberOfMppt', t('inverter.numberOfMppt')],
            ['maxPvInput', t('inverter.maxPvInput')],
            ['gridVoltage', t('inverter.gridVoltage')],
            ['safetyFactor', t('inverter.safetyFactor')],
          ] as [keyof InverterDesign, string][]
        ).map(([key, label]) => (
          <div key={key as string} className="p-3 rounded-xl bg-solar-purple/5 border border-solar-purple/20">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="text-lg font-bold text-solar-purple mt-1">
              {typeof inverterDesign[key] === 'string'
                ? String(inverterDesign[key]).toUpperCase()
                : Number(inverterDesign[key] || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CableStep({
  cableSizing,
  onChange,
}: {
  cableSizing: CableSizing;
  onChange: (c: CableSizing) => void;
}) {
  const { t } = useLanguage();
  const specs = [
    { key: 'dcCable' as const, label: t('cable.dcCable') },
    { key: 'acCable' as const, label: t('cable.acCable') },
    { key: 'batteryCable' as const, label: t('cable.batteryCable') },
    { key: 'groundCable' as const, label: t('cable.groundCable') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('cable.title')}</h2>
        <p className="text-text-secondary mt-1">{t('cable.subtitle')}</p>
      </div>
      <div className="space-y-3">
        {specs.map(({ key, label }) => {
          const spec = cableSizing[key];
          return (
            <div key={key} className="p-4 rounded-xl border border-border bg-surface">
              <h4 className="font-semibold text-text-primary mb-2">{label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-text-muted">Size: </span>
                  <span className="font-medium">{spec.recommendedSize} mm2</span>
                </div>
                <div>
                  <span className="text-text-muted">Current: </span>
                  <span className="font-medium">{spec.current.toFixed(1)} A</span>
                </div>
                <div>
                  <span className="text-text-muted">V-Drop: </span>
                  <span className={`font-medium ${spec.voltageDropPercent > 3 ? 'text-solar-red' : 'text-solar-green'}`}>
                    {spec.voltageDropPercent.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Type: </span>
                  <span className="font-medium">{spec.cableType || '-'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProtectionStep({
  protectionDevices,
  onChange,
}: {
  protectionDevices: ProtectionDevices;
  onChange: (p: ProtectionDevices) => void;
}) {
  const { t } = useLanguage();
  const devices: [string, keyof ProtectionDevices][] = [
    ['MCB (DC)', 'mcb'],
    ['MCCB (AC)', 'mccb'],
    ['Fuse', 'fuse'],
    ['SPD', 'spd'],
    ['DC Isolator', 'dcIsolator'],
    ['AC Isolator', 'acIsolator'],
    ['RCBO', 'rcbo'],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t('protection.title')}</h2>
        <p className="text-text-secondary mt-1">{t('protection.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {devices.map(([name, key]) => {
          const dev = protectionDevices[key] as { rating: number; breakingCapacity: number; poles: number; standard: string };
          return (
            <div key={key} className="p-4 rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-text-primary text-sm">{name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-solar-green/10 text-solar-green">
                  {t('protection.selected')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-text-secondary">
                <div>Rating: <strong className="text-text-primary">{dev.rating} A</strong></div>
                <div>Breaking: <strong className="text-text-primary">{dev.breakingCapacity.toLocaleString()} A</strong></div>
                <div>Poles: <strong className="text-text-primary">{dev.poles}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
