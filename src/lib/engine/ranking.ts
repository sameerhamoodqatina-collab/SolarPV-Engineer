import type { InverterDatabaseEntry } from '@/lib/database/inverters';
import type { BatteryDatabaseEntry } from '@/lib/database/batteries';
import type { PanelDatabaseEntry } from '@/lib/database/panels';
import { yemenPanels } from '@/lib/database/panels';
import { yemenInverters } from '@/lib/database/inverters';
import { yemenBatteries } from '@/lib/database/batteries';

interface RankingCriteria {
  compatibilityWeight: number;
  efficiencyWeight: number;
  reliabilityWeight: number;
  availabilityWeight: number;
  costEffectivenessWeight: number;
}

interface RankedResult<T> {
  item: T;
  score: number;
  compatibilityScore: number;
  efficiencyScore: number;
  reliabilityScore: number;
  availabilityScore: number;
  costEffectivenessScore: number;
  rank: number;
  reasons: string[];
}

const DEFAULT_CRITERIA: RankingCriteria = {
  compatibilityWeight: 0.35,
  efficiencyWeight: 0.25,
  reliabilityWeight: 0.20,
  availabilityWeight: 0.12,
  costEffectivenessWeight: 0.08,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mergeCriteria(partial?: Partial<RankingCriteria>): RankingCriteria {
  return { ...DEFAULT_CRITERIA, ...partial };
}

function computeWeightedScore(
  c: RankedResult<unknown>,
  criteria: RankingCriteria
): number {
  return (
    c.compatibilityScore * criteria.compatibilityWeight +
    c.efficiencyScore * criteria.efficiencyWeight +
    c.reliabilityScore * criteria.reliabilityWeight +
    c.availabilityScore * criteria.availabilityWeight +
    c.costEffectivenessScore * criteria.costEffectivenessWeight
  );
}

function assignRanks<T>(results: RankedResult<T>[]): RankedResult<T>[] {
  results.sort((a, b) => b.score - a.score);
  let currentRank = 1;
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].score < results[i - 1].score) {
      currentRank = i + 1;
    }
    results[i].rank = currentRank;
  }
  return results;
}

function availabilityScore(
  availableInYemen: boolean,
  yemenDistributor: string | undefined,
  preferredBrands: string[] | undefined,
  brand: string
): { score: number; reason: string } {
  let base = 30;
  let reason = 'Not available in Yemen';

  if (availableInYemen && yemenDistributor) {
    base = 100;
    reason = `Available in Yemen via ${yemenDistributor}`;
  } else if (availableInYemen) {
    base = 70;
    reason = 'Available in Yemen (no local distributor)';
  }

  if (preferredBrands && preferredBrands.length > 0) {
    const preferred = preferredBrands.some(
      (pb) => pb.toLowerCase() === brand.toLowerCase()
    );
    if (preferred) {
      base = Math.min(100, base + 10);
      reason += '; brand is preferred';
    }
  }

  return { score: base, reason };
}

function ipRatingScore(ip: string): number {
  const match = ip.match(/IP(\d+)/);
  if (!match) return 50;
  const num = parseInt(match[1], 10);
  if (num >= 66) return 100;
  if (num >= 65) return 85;
  if (num >= 60) return 70;
  if (num >= 54) return 55;
  if (num >= 52) return 45;
  if (num >= 42) return 35;
  if (num >= 21) return 25;
  return 15;
}

function warrantyScore(years: number): number {
  if (years >= 15) return 100;
  if (years >= 12) return 90;
  if (years >= 10) return 80;
  if (years >= 8) return 65;
  if (years >= 5) return 50;
  if (years >= 3) return 35;
  return 20;
}

// ================================================================
// RANK INVERTERS
// ================================================================

interface InverterRequirements {
  requiredPower: number;
  requiredPvInput: number;
  mpptRequirements: {
    minVoltage: number;
    maxVoltage: number;
    maxCurrent: number;
    numberOfStrings: number;
  };
  batteryVoltage: number;
  batteryType: string;
  preferredBrands?: string[];
  category?: string;
}

const INVERTER_BRAND_REPUTATION: Record<string, number> = {
  sma: 95,
  fronius: 95,
  huawei: 95,
  victron: 90,
  sungrow: 85,
  deye: 85,
  growatt: 85,
  goodwe: 85,
  solis: 80,
};

function scoreInverter(
  inverter: InverterDatabaseEntry,
  req: InverterRequirements,
  criteria: RankingCriteria
): RankedResult<InverterDatabaseEntry> {
  const reasons: string[] = [];

  // --- Compatibility (35%) ---
  let compatScore = 0;

  // Power match: want >= requiredPower, penalize oversized >50%
  const powerRatio = inverter.ratedPower / req.requiredPower;
  let powerScore: number;
  if (powerRatio < 1.0) {
    powerScore = Math.max(0, (powerRatio / 1.0) * 60);
    reasons.push(`Undersized: ${inverter.ratedPower}kW < ${req.requiredPower}kW required`);
  } else if (powerRatio <= 1.5) {
    powerScore = 100 - (powerRatio - 1.0) * 40;
    reasons.push(`Good power match: ${inverter.ratedPower}kW (${(powerRatio * 100 - 100).toFixed(0)}% oversized)`);
  } else {
    powerScore = Math.max(10, 80 - (powerRatio - 1.5) * 100);
    reasons.push(`Oversized: ${inverter.ratedPower}kW is ${((powerRatio - 1) * 100).toFixed(0)}% larger than needed`);
  }

  // PV input capacity
  const pvRatio = inverter.maxPvInput / req.requiredPvInput;
  let pvScore: number;
  if (pvRatio < 1.0) {
    pvScore = Math.max(0, pvRatio * 50);
    reasons.push(`Insufficient PV input: ${inverter.maxPvInput}kW < ${req.requiredPvInput}kW`);
  } else if (pvRatio <= 1.5) {
    pvScore = 100 - (pvRatio - 1.0) * 40;
  } else {
    pvScore = Math.max(20, 80 - (pvRatio - 1.5) * 80);
  }

  // MPPT range coverage
  let mpptScore = 0;
  const mpptCoversVoltage =
    inverter.mppt.mpptVoltageRange.min <= req.mpptRequirements.minVoltage &&
    inverter.mppt.mpptVoltageRange.max >= req.mpptRequirements.maxVoltage;
  if (mpptCoversVoltage) {
    mpptScore += 50;
  } else {
    const minCoverage = Math.min(
      1,
      Math.max(
        0,
        (req.mpptRequirements.minVoltage - inverter.mppt.mpptVoltageRange.min + 30) / 30
      )
    );
    const maxCoverage = Math.min(
      1,
      Math.max(
        0,
        (inverter.mppt.mpptVoltageRange.max - req.mpptRequirements.maxVoltage + 30) / 30
      )
    );
    mpptScore += ((minCoverage + maxCoverage) / 2) * 40;
    reasons.push('MPPT voltage range may not fully cover requirements');
  }

  // MPPT current capacity
  if (inverter.mppt.maxInputCurrentPerMppt >= req.mpptRequirements.maxCurrent) {
    mpptScore += 25;
  } else {
    mpptScore += Math.max(0, (inverter.mppt.maxInputCurrentPerMppt / req.mpptRequirements.maxCurrent) * 20);
    reasons.push('MPPT current limit may be exceeded');
  }

  // Number of strings per MPPT
  const totalStringCapacity = inverter.mppt.numberOfMppts * inverter.mppt.maxStringsPerMppt;
  if (totalStringCapacity >= req.mpptRequirements.numberOfStrings) {
    mpptScore += 25;
  } else {
    mpptScore += Math.max(0, (totalStringCapacity / req.mpptRequirements.numberOfStrings) * 20);
    reasons.push(`Can only handle ${totalStringCapacity} strings vs ${req.mpptRequirements.numberOfStrings} needed`);
  }
  mpptScore = clamp(mpptScore, 0, 100);

  // Battery voltage compatibility
  const batteryCompatible = inverter.batteryCompatibility.supportedVoltage.includes(req.batteryVoltage);
  let batteryCompatScore: number;
  if (batteryCompatible) {
    batteryCompatScore = 100;
  } else {
    batteryCompatScore = 0;
    reasons.push(`Battery voltage ${req.batteryVoltage}V not supported`);
  }

  // Battery type compatibility
  const batteryTypeOk = inverter.batteryCompatibility.batteryType.includes(
    req.batteryType as 'lithium' | 'leadacid' | 'gel' | 'agm'
  );
  if (!batteryTypeOk && inverter.category !== 'ongrid') {
    batteryCompatScore *= 0.5;
    reasons.push(`Battery type '${req.batteryType}' not explicitly supported`);
  }

  // Category preference
  let categoryScore = 50;
  if (req.category && inverter.category === req.category) {
    categoryScore = 100;
  } else if (!req.category) {
    categoryScore = 80;
  }

  compatScore =
    powerScore * 0.30 +
    pvScore * 0.25 +
    mpptScore * 0.20 +
    batteryCompatScore * 0.15 +
    categoryScore * 0.10;
  compatScore = clamp(compatScore, 0, 100);

  // --- Efficiency (25%) ---
  const efficiencyScore = clamp(((inverter.efficiency - 94) / (99.5 - 94)) * 100, 0, 100);
  reasons.push(`Efficiency: ${inverter.efficiency}%`);

  // --- Reliability (20%) ---
  const wScore = warrantyScore(inverter.warranty);
  const ipScore = ipRatingScore(inverter.protectionRating);

  const brandKey = inverter.brand.toLowerCase();
  const brandScore = INVERTER_BRAND_REPUTATION[brandKey] ?? 70;

  const tempRange = inverter.operatingTempRange.max - inverter.operatingTempRange.min;
  const tempScore = clamp((tempRange / 85) * 100, 0, 100);

  const reliabilityScore =
    wScore * 0.30 +
    ipScore * 0.25 +
    brandScore * 0.25 +
    tempScore * 0.20;
  reasons.push(`Warranty: ${inverter.warranty}yr, IP: ${inverter.protectionRating}, Brand rep: ${brandScore}`);

  // --- Availability (12%) ---
  const avail = availabilityScore(
    inverter.availableInYemen,
    inverter.yemenDistributor,
    req.preferredBrands,
    inverter.brand
  );
  const availabilityScoreVal = avail.score;
  if (avail.reason) reasons.push(avail.reason);

  // --- Cost Effectiveness (8%) ---
  // Smaller/simpler inverters cost less. Penalize oversized systems.
  let costScore = 100;
  if (powerRatio > 1.5) {
    costScore = Math.max(20, 100 - (powerRatio - 1.5) * 80);
    reasons.push('Cost penalty for oversized system');
  } else if (powerRatio < 1.0) {
    costScore = 100;
    reasons.push('Undersized inverter = lower cost');
  }
  // Simpler inverters (fewer features, fewer MPPTs) tend to be cheaper
  const mpptCountPenalty = inverter.mppt.numberOfMppts > 2 ? (inverter.mppt.numberOfMppts - 2) * 5 : 0;
  costScore = clamp(costScore - mpptCountPenalty, 0, 100);

  const result: RankedResult<InverterDatabaseEntry> = {
    item: inverter,
    score: 0,
    compatibilityScore: Math.round(compatScore * 100) / 100,
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
    reliabilityScore: Math.round(reliabilityScore * 100) / 100,
    availabilityScore: Math.round(availabilityScoreVal * 100) / 100,
    costEffectivenessScore: Math.round(costScore * 100) / 100,
    rank: 0,
    reasons,
  };

  result.score = Math.round(computeWeightedScore(result, criteria) * 100) / 100;
  return result;
}

function rankInverters(
  inverters: InverterDatabaseEntry[],
  requirements: InverterRequirements,
  criteria?: Partial<RankingCriteria>
): RankedResult<InverterDatabaseEntry>[] {
  const c = mergeCriteria(criteria);
  const results = inverters
    .filter((inv) => inv.enabled)
    .map((inv) => scoreInverter(inv, requirements, c));
  return assignRanks(results);
}

// ================================================================
// RANK BATTERIES
// ================================================================

interface BatteryRequirements {
  requiredVoltage: number;
  requiredCapacity: number;
  maxBudget?: number;
  preferredBrands?: string[];
  preferredType?: string;
}

function scoreBattery(
  battery: BatteryDatabaseEntry,
  req: BatteryRequirements,
  criteria: RankingCriteria
): RankedResult<BatteryDatabaseEntry> {
  const reasons: string[] = [];

  // --- Compatibility (35%) ---
  let voltageScore: number;
  const voltageDiff = Math.abs(battery.specs.nominalVoltage - req.requiredVoltage);
  if (voltageDiff < 1) {
    voltageScore = 100;
  } else if (voltageDiff <= 4) {
    voltageScore = Math.max(20, 100 - voltageDiff * 20);
  } else if (battery.seriesSupport > 1 || battery.parallelSupport > 1) {
    // Can potentially series/parallel to reach voltage
    voltageScore = 50;
    reasons.push(`Requires series/parallel configuration to reach ${req.requiredVoltage}V`);
  } else {
    voltageScore = 10;
    reasons.push(`Voltage mismatch: ${battery.specs.nominalVoltage}V vs ${req.requiredVoltage}V required`);
  }

  // Capacity match
  const effectiveCapacity = battery.specs.capacity * (battery.specs.dod / 100);
  let capacityScore: number;
  if (req.requiredCapacity <= effectiveCapacity) {
    capacityScore = 100;
    reasons.push(`Adequate capacity: ${effectiveCapacity}Ah effective`);
  } else {
    const unitsNeeded = Math.ceil(req.requiredCapacity / effectiveCapacity);
    if (unitsNeeded <= battery.parallelSupport) {
      capacityScore = Math.max(30, 100 - (unitsNeeded - 1) * 15);
      reasons.push(`Would need ${unitsNeeded} unit(s) for required capacity`);
    } else {
      capacityScore = 5;
      reasons.push(`Cannot reach required capacity even with max parallel units`);
    }
  }

  // Communication protocol availability
  const hasCan = battery.communication.protocols.includes('CAN');
  const hasRs485 = battery.communication.protocols.includes('RS485');
  const commScore = hasCan && hasRs485 ? 100 : hasCan || hasRs485 ? 75 : battery.type === 'lithium' ? 40 : 80;
  if (commScore < 60) {
    reasons.push('Limited communication protocol support');
  }

  // Preferred type match
  let typeScore = 50;
  if (req.preferredType && battery.type === req.preferredType) {
    typeScore = 100;
    reasons.push(`Matches preferred type: ${battery.type}`);
  } else if (!req.preferredType) {
    typeScore = 70;
  }

  // Number of units needed penalty
  const totalUnitsForVoltage = req.requiredVoltage / battery.specs.nominalVoltage;
  const unitsPenalty = totalUnitsForVoltage > 1 ? clamp(100 - (totalUnitsForVoltage - 1) * 30, 30, 100) : 100;

  const compatScore =
    voltageScore * 0.30 +
    capacityScore * 0.30 +
    commScore * 0.20 +
    typeScore * 0.10 +
    unitsPenalty * 0.10;

  // --- Efficiency (25%) ---
  const effScore = clamp(((battery.specs.efficiency - 75) / (100 - 75)) * 100, 0, 100);
  const dodScore = clamp(((battery.specs.dod - 40) / (95 - 40)) * 100, 0, 100);
  const efficiencyScore = effScore * 0.5 + dodScore * 0.5;
  reasons.push(`Efficiency: ${battery.specs.efficiency}%, DoD: ${battery.specs.dod}%`);

  // --- Reliability (20%) ---
  let cycleLifeScore: number;
  if (battery.specs.cycleLife >= 8000) cycleLifeScore = 100;
  else if (battery.specs.cycleLife >= 6000) cycleLifeScore = 85;
  else if (battery.specs.cycleLife >= 4000) cycleLifeScore = 70;
  else if (battery.specs.cycleLife >= 2000) cycleLifeScore = 50;
  else cycleLifeScore = 30;

  const calendarScore = clamp((battery.specs.calendarLife / 20) * 100, 0, 100);
  const certScore = clamp((battery.certifications.length / 5) * 100, 0, 100);

  const reliabilityScore =
    cycleLifeScore * 0.45 +
    calendarScore * 0.30 +
    certScore * 0.25;
  reasons.push(`Cycle life: ${battery.specs.cycleLife}, Calendar: ${battery.specs.calendarLife}yr, Certs: ${battery.certifications.length}`);

  // --- Availability (12%) ---
  const avail = availabilityScore(
    battery.availableInYemen,
    battery.yemenDistributor,
    req.preferredBrands,
    battery.brand
  );
  const availabilityScoreVal = avail.score;
  if (avail.reason) reasons.push(avail.reason);

  // --- Cost Effectiveness (8%) ---
  let costScore = 50;
  if (battery.type === 'lithium') {
    costScore = 85;
  } else if (battery.type === 'leadacid') {
    costScore = 70;
  } else if (battery.type === 'gel') {
    costScore = 65;
  } else {
    costScore = 60;
  }
  // 51.2V lithium is most cost-effective per kWh (fewer units needed for 48V system)
  if (battery.type === 'lithium' && Math.abs(battery.specs.nominalVoltage - 51.2) < 1) {
    costScore = 100;
    reasons.push('51.2V LiFePO4 - most cost-effective per kWh');
  } else if (battery.type === 'lithium') {
    costScore = Math.max(70, costScore);
  }
  // Penalize if many units are needed
  if (req.requiredVoltage / battery.specs.nominalVoltage > 1) {
    costScore = Math.max(20, costScore - (req.requiredVoltage / battery.specs.nominalVoltage - 1) * 15);
  }

  // Budget check
  if (req.maxBudget) {
    // Rough estimate: lithium ~$250/kWh, lead-acid ~$100/kWh
    const pricePerKwh = battery.type === 'lithium' ? 250 : 120;
    const estimatedCost = battery.specs.kwh * pricePerKwh;
    if (estimatedCost > req.maxBudget) {
      costScore *= 0.6;
      reasons.push(`Estimated cost $${estimatedCost} exceeds budget $${req.maxBudget}`);
    }
  }

  const result: RankedResult<BatteryDatabaseEntry> = {
    item: battery,
    score: 0,
    compatibilityScore: Math.round(clamp(compatScore, 0, 100) * 100) / 100,
    efficiencyScore: Math.round(clamp(efficiencyScore, 0, 100) * 100) / 100,
    reliabilityScore: Math.round(clamp(reliabilityScore, 0, 100) * 100) / 100,
    availabilityScore: Math.round(availabilityScoreVal * 100) / 100,
    costEffectivenessScore: Math.round(clamp(costScore, 0, 100) * 100) / 100,
    rank: 0,
    reasons,
  };

  result.score = Math.round(computeWeightedScore(result, criteria) * 100) / 100;
  return result;
}

function rankBatteries(
  batteries: BatteryDatabaseEntry[],
  requirements: BatteryRequirements,
  criteria?: Partial<RankingCriteria>
): RankedResult<BatteryDatabaseEntry>[] {
  const c = mergeCriteria(criteria);
  const results = batteries
    .filter((b) => b.enabled)
    .map((b) => scoreBattery(b, requirements, c));
  return assignRanks(results);
}

// ================================================================
// RANK PANELS
// ================================================================

interface PanelRequirements {
  requiredPower: number;
  maxArea?: number;
  preferredBrands?: string[];
  preferredCellType?: string;
}

function scorePanel(
  panel: PanelDatabaseEntry,
  req: PanelRequirements,
  criteria: RankingCriteria
): RankedResult<PanelDatabaseEntry> {
  const reasons: string[] = [];

  // --- Compatibility (35%) ---
  const panelsNeeded = Math.ceil(req.requiredPower / panel.power);
  const panelAreaM2 = (panel.dimensions.width * panel.dimensions.height) / 1000000;
  const totalArea = panelsNeeded * panelAreaM2;

  // Number of panels needed: fewer is better
  const numPanelsScore = clamp(100 - (panelsNeeded - 8) * 5, 20, 100);

  // Area efficiency (W/m²)
  const wattPerM2 = panel.power / panelAreaM2;
  const areaEffScore = clamp(((wattPerM2 - 350) / (450 - 350)) * 100, 0, 100);

  // Area constraint check
  let areaConstraintScore = 100;
  if (req.maxArea && totalArea > req.maxArea) {
    areaConstraintScore = Math.max(10, (req.maxArea / totalArea) * 80);
    reasons.push(`Total area ${totalArea.toFixed(1)}m\u00B2 exceeds max ${req.maxArea}m\u00B2`);
  }

  // Cell type preference
  let cellTypeScore = 50;
  if (req.preferredCellType && panel.cellType === req.preferredCellType) {
    cellTypeScore = 100;
    reasons.push(`Matches preferred cell type: ${panel.cellType}`);
  } else if (!req.preferredCellType) {
    cellTypeScore = 75;
  }

  const compatScore =
    numPanelsScore * 0.30 +
    areaEffScore * 0.30 +
    areaConstraintScore * 0.20 +
    cellTypeScore * 0.20;
  reasons.push(`${panelsNeeded} panels needed, total area: ${totalArea.toFixed(1)}m\u00B2`);

  // --- Efficiency (25%) ---
  const efficiencyScore = clamp(((panel.efficiency - 20) / (26 - 20)) * 100, 0, 100);
  reasons.push(`Panel efficiency: ${panel.efficiency}%`);

  // --- Reliability (20%) ---
  const panelWarrantyScore = warrantyScore(panel.warrantyPerformance);

  // Degradation: lower is better
  const degradationScore = clamp(((5 - panel.degradationYear25) / (5 - 1)) * 100, 0, 100);

  const panelCertScore = clamp((panel.certifications.length / 6) * 100, 0, 100);

  // Cell type reliability: n-type/topcon/bifacial > mono-perc
  let cellReliabilityScore: number;
  switch (panel.cellType) {
    case 'topcon':
    case 'n-type':
    case 'hjt':
      cellReliabilityScore = 100;
      break;
    case 'bifacial':
      cellReliabilityScore = 90;
      break;
    case 'mono-perc':
      cellReliabilityScore = 65;
      break;
    default:
      cellReliabilityScore = 50;
  }

  const reliabilityScore =
    panelWarrantyScore * 0.30 +
    degradationScore * 0.25 +
    panelCertScore * 0.20 +
    cellReliabilityScore * 0.25;
  reasons.push(`Warranty: ${panel.warrantyPerformance}yr, degradation: ${panel.degradationYear25}% at yr25, certs: ${panel.certifications.length}`);

  // --- Availability (12%) ---
  const avail = availabilityScore(
    panel.availableInYemen,
    panel.yemenDistributor,
    req.preferredBrands,
    panel.brand
  );
  const availabilityScoreVal = avail.score;
  if (avail.reason) reasons.push(avail.reason);

  // --- Cost Effectiveness (8%) ---
  // Higher wattage panels = fewer needed = lower balance-of-system cost
  let costScore: number;
  if (panel.power >= 600) costScore = 100;
  else if (panel.power >= 500) costScore = 85;
  else if (panel.power >= 400) costScore = 70;
  else costScore = 55;
  reasons.push(`${panel.power}W panel - BOS cost factor: ${costScore}`);

  const result: RankedResult<PanelDatabaseEntry> = {
    item: panel,
    score: 0,
    compatibilityScore: Math.round(clamp(compatScore, 0, 100) * 100) / 100,
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
    reliabilityScore: Math.round(clamp(reliabilityScore, 0, 100) * 100) / 100,
    availabilityScore: Math.round(availabilityScoreVal * 100) / 100,
    costEffectivenessScore: Math.round(costScore * 100) / 100,
    rank: 0,
    reasons,
  };

  result.score = Math.round(computeWeightedScore(result, criteria) * 100) / 100;
  return result;
}

function rankPanels(
  panels: PanelDatabaseEntry[],
  requirements: PanelRequirements,
  criteria?: Partial<RankingCriteria>
): RankedResult<PanelDatabaseEntry>[] {
  const c = mergeCriteria(criteria);
  const results = panels
    .filter((p) => p.enabled)
    .map((p) => scorePanel(p, requirements, c));
  return assignRanks(results);
}

// ================================================================
// SELECT OPTIMAL EQUIPMENT
// ================================================================

interface OptimalEquipmentResult {
  panels: RankedResult<PanelDatabaseEntry>;
  inverter: RankedResult<InverterDatabaseEntry>;
  battery: RankedResult<BatteryDatabaseEntry>;
  overallScore: number;
  warnings: string[];
}

function selectOptimalEquipment(
  panelReqs: PanelRequirements,
  inverterReqs: InverterRequirements,
  batteryReqs: BatteryRequirements,
  panelCriteria?: Partial<RankingCriteria>,
  inverterCriteria?: Partial<RankingCriteria>,
  batteryCriteria?: Partial<RankingCriteria>
): OptimalEquipmentResult | null {
  const warnings: string[] = [];

  // 1. Get enabled panels and rank them
  const enabledPanels = yemenPanels.filter((p) => p.enabled);
  if (enabledPanels.length === 0) {
    warnings.push('No enabled panels found in database');
    return null;
  }
  const rankedPanels = rankPanels(enabledPanels, panelReqs, panelCriteria);
  if (rankedPanels.length === 0) {
    warnings.push('No panels matched the ranking criteria');
    return null;
  }

  // 3. Take best panel and calculate system requirements
  const bestPanel = rankedPanels[0];
  const panelsNeeded = Math.ceil(panelReqs.requiredPower / bestPanel.item.power);
  const totalPvPower = panelsNeeded * bestPanel.item.power;

  // Calculate string configuration
  const vmpPerPanel = bestPanel.item.vmp;
  const iscPerPanel = bestPanel.item.isc;

  // Determine strings in series for each string (targeting inverter MPPT voltage range)
  const targetVmp = (inverterReqs.mpptRequirements.minVoltage + inverterReqs.mpptRequirements.maxVoltage) / 2;
  const panelsPerString = Math.round(targetVmp / vmpPerPanel);
  const stringsNeeded = Math.ceil(panelsNeeded / panelsPerString);
  const actualTotalPanels = panelsPerString * stringsNeeded;

  const stringVmp = panelsPerString * vmpPerPanel;
  const stringVoc = panelsPerString * bestPanel.item.voc;
  const stringIsc = iscPerPanel;

  warnings.push(`System: ${actualTotalPanels}x ${bestPanel.item.power}W panels = ${(actualTotalPanels * bestPanel.item.power / 1000).toFixed(1)}kW total`);
  warnings.push(`String config: ${panelsPerString} panels/series x ${stringsNeeded} strings, Vmp=${stringVmp.toFixed(1)}V, Voc=${stringVoc.toFixed(1)}V`);

  // 4. Update inverter requirements based on panel system
  const updatedInverterReqs: InverterRequirements = {
    ...inverterReqs,
    requiredPvInput: totalPvPower / 1000,
    mpptRequirements: {
      ...inverterReqs.mpptRequirements,
      minVoltage: stringVmp * 0.9,
      maxVoltage: stringVoc * 1.05,
      maxCurrent: stringIsc,
      numberOfStrings: stringsNeeded,
    },
  };

  // 5. Rank inverters
  const enabledInverters = yemenInverters.filter((i) => i.enabled);
  if (enabledInverters.length === 0) {
    warnings.push('No enabled inverters found in database');
    return null;
  }
  const rankedInverters = rankInverters(enabledInverters, updatedInverterReqs, inverterCriteria);
  if (rankedInverters.length === 0) {
    warnings.push('No inverters matched the ranking criteria');
    return null;
  }

  // 6. Take best inverter
  const bestInverter = rankedInverters[0];

  // 7. Update battery requirements based on inverter
  const updatedBatteryReqs: BatteryRequirements = {
    ...batteryReqs,
    requiredVoltage: bestInverter.item.batteryCompatibility.supportedVoltage.length > 0
      ? bestInverter.item.batteryCompatibility.supportedVoltage[0]
      : batteryReqs.requiredVoltage,
  };

  // 8. Rank batteries
  const enabledBatteries = yemenBatteries.filter((b) => b.enabled);
  if (enabledBatteries.length === 0) {
    warnings.push('No enabled batteries found in database');
    return null;
  }
  const rankedBatteries = rankBatteries(enabledBatteries, updatedBatteryReqs, batteryCriteria);
  if (rankedBatteries.length === 0) {
    warnings.push('No batteries matched the ranking criteria');
    return null;
  }

  // 9. Take best battery
  const bestBattery = rankedBatteries[0];

  // 10. Final compatibility verification
  // Check inverter battery voltage supports the selected battery
  const battVoltageSupported = bestInverter.item.batteryCompatibility.supportedVoltage.some(
    (v) => Math.abs(v - bestBattery.item.specs.nominalVoltage) < 2
  );
  if (!battVoltageSupported) {
    warnings.push(
      `WARNING: Selected battery (${bestBattery.item.specs.nominalVoltage}V) may not be compatible with inverter (${bestInverter.item.brand} ${bestInverter.item.model})`
    );
  }

  // Check inverter battery type compatibility
  const battTypeSupported = bestInverter.item.batteryCompatibility.batteryType.includes(bestBattery.item.type);
  if (!battTypeSupported && bestInverter.item.category !== 'ongrid') {
    warnings.push(
      `WARNING: Battery type '${bestBattery.item.type}' may not be fully supported by ${bestInverter.item.brand} inverter`
    );
  }

  // Check battery brand compatibility with inverter
  const battBrandCompatible = bestInverter.item.batteryCompatibility.compatibleBatteryBrands.some(
    (b) => b.toLowerCase() === bestBattery.item.brand.toLowerCase()
  );
  if (!battBrandCompatible && bestInverter.item.category !== 'ongrid') {
    warnings.push(
      `Battery brand '${bestBattery.item.brand}' not explicitly listed as compatible with ${bestInverter.item.brand} inverter`
    );
  }

  // Check charge current limits
  const totalBatteryCapacity = bestBattery.item.specs.capacity;
  const recommendedChargeA = totalBatteryCapacity * 0.5; // 0.5C for LiFePO4
  if (bestInverter.item.batteryCompatibility.maxChargeCurrent < recommendedChargeA && bestBattery.item.type === 'lithium') {
    warnings.push(
      `Inverter max charge current (${bestInverter.item.batteryCompatibility.maxChargeCurrent}A) may limit battery charge rate`
    );
  }

  // Check PV power to inverter ratio
  const pvToInverterRatio = totalPvPower / (bestInverter.item.ratedPower * 1000);
  if (pvToInverterRatio > bestInverter.item.dcAcRatio + 0.1) {
    warnings.push(
      `PV/AC ratio (${pvToInverterRatio.toFixed(2)}) exceeds recommended DC/AC ratio (${bestInverter.item.dcAcRatio})`
    );
  }

  // Verify MPPT current capacity
  const totalStringCurrent = stringsNeeded * iscPerPanel;
  const mpptCurrentCapacity = bestInverter.item.mppt.numberOfMppts * bestInverter.item.mppt.maxInputCurrentPerMppt;
  if (totalStringCurrent > mpptCurrentCapacity) {
    warnings.push(
      `Total string current (${totalStringCurrent.toFixed(1)}A) exceeds inverter MPPT capacity (${mpptCurrentCapacity}A)`
    );
  }

  // 11. Calculate overall score
  const overallScore =
    bestPanel.score * 0.35 +
    bestInverter.score * 0.40 +
    bestBattery.score * 0.25;

  warnings.push(`Overall system score: ${overallScore.toFixed(1)}/100`);

  return {
    panels: bestPanel,
    inverter: bestInverter,
    battery: bestBattery,
    overallScore: Math.round(overallScore * 100) / 100,
    warnings,
  };
}

export type {
  RankingCriteria,
  RankedResult,
  InverterRequirements,
  BatteryRequirements,
  PanelRequirements,
  OptimalEquipmentResult,
};

export {
  rankInverters,
  rankBatteries,
  rankPanels,
  selectOptimalEquipment,
  DEFAULT_CRITERIA,
};
