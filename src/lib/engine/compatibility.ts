import type { InverterDatabaseEntry, MPPTConfig } from '@/lib/database/inverters';
import type { BatteryDatabaseEntry } from '@/lib/database/batteries';
import type { PanelDatabaseEntry } from '@/lib/database/panels';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  category:
    | 'mppt'
    | 'voltage'
    | 'current'
    | 'dc_ac_ratio'
    | 'battery'
    | 'protocol'
    | 'temperature'
    | 'safety';
  message: string;
  messageAr: string;
  requirement?: string;
  actual?: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
  score: number;
  details: {
    mpptCompatible: boolean;
    voltageCompatible: boolean;
    currentCompatible: boolean;
    dcAcRatioOk: boolean;
    batteryCompatible: boolean;
    protocolCompatible: boolean;
    temperatureOk: boolean;
  };
}

interface StringSizingResult {
  valid: boolean;
  minPanels: number;
  maxPanels: number;
  issues: CompatibilityIssue[];
}

// ---------------------------------------------------------------------------
// Constants – Yemen ambient temperature envelope
// ---------------------------------------------------------------------------

/** Mountain winter low */
const AMBIENT_TEMP_MIN_DEFAULT = -5;

/** Desert summer peak */
const AMBIENT_TEMP_MAX_DEFAULT = 55;

/** Standard test-condition cell temperature */
const CELL_TEMP_STC = 25;

/** Lowest practical operating temperature used for Voc cold checks (°C) */
const VOC_TEMP_LOW = -10;

/** Optimal DC/AC ratio lower bound */
const DC_AC_RATIO_MIN = 0.8;

/** Optimal DC/AC ratio upper bound */
const DC_AC_RATIO_OPTIMAL_MAX = 1.2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcVocAtTemp(voc: number, tempCoeffVoc: number, tempC: number): number {
  return voc * (1 + (tempCoeffVoc / 100) * (tempC - CELL_TEMP_STC));
}

function cellTemperature(ambientTempC: number, noct: number, irradiance: number): number {
  return ambientTempC + ((noct - 20) / 80) * irradiance;
}

function pushIssue(
  issues: CompatibilityIssue[],
  issue: CompatibilityIssue,
): void {
  issues.push(issue);
}

function buildResult(issues: CompatibilityResult['issues']): CompatibilityResult {
  const hasErrors = issues.some((i) => i.type === 'error');
  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 10);

  return {
    compatible: !hasErrors,
    issues,
    score,
    details: {
      mpptCompatible: !issues.some(
        (i) => i.category === 'mppt' && i.type === 'error',
      ),
      voltageCompatible: !issues.some(
        (i) => i.category === 'voltage' && i.type === 'error',
      ),
      currentCompatible: !issues.some(
        (i) => i.category === 'current' && i.type === 'error',
      ),
      dcAcRatioOk: !issues.some(
        (i) => i.category === 'dc_ac_ratio' && i.type === 'error',
      ),
      batteryCompatible: !issues.some(
        (i) => i.category === 'battery' && i.type === 'error',
      ),
      protocolCompatible: !issues.some(
        (i) => i.category === 'protocol' && i.type === 'error',
      ),
      temperatureOk: !issues.some(
        (i) => i.category === 'temperature' && i.type === 'error',
      ),
    },
  };
}

function mergeResults(...results: CompatibilityResult[]): CompatibilityResult {
  const allIssues = results.flatMap((r) => r.issues);
  return buildResult(allIssues);
}

// ---------------------------------------------------------------------------
// 1. Panel ↔ Inverter compatibility
// ---------------------------------------------------------------------------

/**
 * Checks the electrical compatibility between a PV panel and a string inverter.
 *
 * Evaluates MPPT voltage window, current limits, string sizing constraints,
 * DC/AC ratio, maximum PV input power, temperature envelope, and N-1
 * redundancy for multi-MPPT inverters.
 *
 * @param panel          Panel database entry
 * @param inverter       Inverter database entry
 * @param numberOfPanelsInString  Number of panels wired in series per string
 * @param numberOfStrings         Total number of parallel strings
 * @returns CompatibilityResult with score 0-100
 */
export function checkPanelInverterCompatibility(
  panel: PanelDatabaseEntry,
  inverter: InverterDatabaseEntry,
  numberOfPanelsInString: number,
  numberOfStrings: number,
): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];

  const totalPanels = numberOfPanelsInString * numberOfStrings;

  // ---- Derived values ----

  const vmpString = panel.vmp * numberOfPanelsInString;
  const vocString25 = panel.voc * numberOfPanelsInString;
  const vocStringCold = calcVocAtTemp(
    panel.voc,
    panel.tempCoeffVoc,
    VOC_TEMP_LOW,
  ) * numberOfPanelsInString;

  const impPerString = panel.imp;
  const totalCurrent = impPerString * numberOfStrings;

  const totalPanelPower = panel.power * totalPanels;
  const inverterRatedPowerW = inverter.ratedPower * 1000;
  const inverterMaxPvW = inverter.maxPvInput * 1000;

  const dcAcRatio = totalPanelPower / inverterRatedPowerW;

  // ---- MPPT Voltage Range ----

  if (vmpString < inverter.mppt.mpptVoltageRange.min) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: `String Vmp (${round2(vmpString)}V) is below the MPPT minimum (${inverter.mppt.mpptVoltageRange.min}V). The inverter cannot track the maximum power point at this voltage.`,
      messageAr: `جهد Vmp للسلسلة (${round2(vmpString)}V) أقل من الحد الأدنى لنطاق MPPT (${inverter.mppt.mpptVoltageRange.min}V). لا يمكن للعاكس تتبع أقصى نقطة طاقة عند هذا الجهد.`,
      requirement: `≥ ${inverter.mppt.mpptVoltageRange.min}V`,
      actual: `${round2(vmpString)}V`,
    });
  }

  if (vmpString > inverter.mppt.mpptVoltageRange.max) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: `String Vmp (${round2(vmpString)}V) exceeds the MPPT maximum (${inverter.mppt.mpptVoltageRange.max}V). Output power will be clipped.`,
      messageAr: `جهد Vmp للسلسلة (${round2(vmpString)}V) يتجاوز حد MPPT الأقصى (${inverter.mppt.mpptVoltageRange.max}V). ستتم قص القوة الناتجة.`,
      requirement: `≤ ${inverter.mppt.mpptVoltageRange.max}V`,
      actual: `${round2(vmpString)}V`,
    });
  }

  // ---- Max DC Input Voltage (cold Voc) ----

  if (vocStringCold > inverter.maxDcInputVoltage) {
    pushIssue(issues, {
      type: 'error',
      category: 'voltage',
      message: `String Voc at ${VOC_TEMP_LOW}°C (${round2(vocStringCold)}V) exceeds the inverter's maximum DC input voltage (${inverter.maxDcInputVoltage}V). This can permanently damage the inverter.`,
      messageAr: `جهد Voc للسلسلة عند ${VOC_TEMP_LOW}°C (${round2(vocStringCold)}V) يتجاوز أقصى جهد DC للعاكس (${inverter.maxDcInputVoltage}V). قد يتلف العكس بشكل دائم.`,
      requirement: `≤ ${inverter.maxDcInputVoltage}V`,
      actual: `${round2(vocStringCold)}V`,
    });
  }

  // ---- MPPT Current ----

  if (impPerString > inverter.mppt.maxInputCurrentPerMppt) {
    pushIssue(issues, {
      type: 'error',
      category: 'current',
      message: `Panel Imp (${round2(impPerString)}A) exceeds the maximum input current per MPPT tracker (${inverter.mppt.maxInputCurrentPerMppt}A).`,
      messageAr: `تيار Imp للوحة (${round2(impPerString)}A) يتجاوز أقصى تيار مدخل لكل متتبع MPPT (${inverter.mppt.maxInputCurrentPerMppt}A).`,
      requirement: `≤ ${inverter.mppt.maxInputCurrentPerMppt}A per MPPT`,
      actual: `${round2(impPerString)}A`,
    });
  }

  // ---- MPPT Strings capacity ----

  const maxTotalStrings = inverter.mppt.maxStringsPerMppt * inverter.mppt.numberOfMppts;
  if (numberOfStrings > maxTotalStrings) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: `Number of strings (${numberOfStrings}) exceeds the inverter's maximum supported strings (${maxTotalStrings} = ${inverter.mppt.numberOfMppts} MPPTs × ${inverter.mppt.maxStringsPerMppt} strings/MPPT).`,
      messageAr: `عدد السلاسل (${numberOfStrings}) يتجاوز الحد الأقصى للعاكس (${maxTotalStrings} = ${inverter.mppt.numberOfMppts} MPPTs × ${inverter.mppt.maxStringsPerMppt} سلسلة/MPPT).`,
      requirement: `≤ ${maxTotalStrings} strings`,
      actual: `${numberOfStrings} strings`,
    });
  }

  // ---- DC/AC Ratio ----

  if (dcAcRatio < DC_AC_RATIO_MIN) {
    pushIssue(issues, {
      type: 'error',
      category: 'dc_ac_ratio',
      message: `DC/AC ratio (${round2(dcAcRatio)}) is below the minimum (${DC_AC_RATIO_MIN}). The inverter is significantly oversized for this array.`,
      messageAr: `نسبة DC/AC (${round2(dcAcRatio)}) أقل من الحد الأدنى (${DC_AC_RATIO_MIN}). العكس أكبر بكثير من 필요한 لهذا المصفوفة.`,
      requirement: `≥ ${DC_AC_RATIO_MIN}`,
      actual: `${round2(dcAcRatio)}`,
    });
  }

  if (dcAcRatio > inverter.dcAcRatio) {
    pushIssue(issues, {
      type: 'error',
      category: 'dc_ac_ratio',
      message: `DC/AC ratio (${round2(dcAcRatio)}) exceeds the inverter's maximum rated ratio (${inverter.dcAcRatio}). Excessive clipping will occur.`,
      messageAr: `نسبة DC/AC (${round2(dcAcRatio)}) تتجاوز الحد الأقصى للعاكس (${inverter.dcAcRatio}). ستحدث قص مفرط للطاقة.`,
      requirement: `≤ ${inverter.dcAcRatio}`,
      actual: `${round2(dcAcRatio)}`,
    });
  }

  if (dcAcRatio > DC_AC_RATIO_OPTIMAL_MAX && dcAcRatio <= inverter.dcAcRatio) {
    pushIssue(issues, {
      type: 'warning',
      category: 'dc_ac_ratio',
      message: `DC/AC ratio (${round2(dcAcRatio)}) is above the optimal range (${DC_AC_RATIO_MIN}-${DC_AC_RATIO_OPTIMAL_MAX}). Some energy clipping may occur during peak irradiance.`,
      messageAr: `نسبة DC/AC (${round2(dcAcRatio)}) أعلى من النطاق الأمثل (${DC_AC_RATIO_MIN}-${DC_AC_RATIO_OPTIMAL_MAX}). قد يحدث خسارة طاقة بعض الشيء أثناء الذروة.`,
      requirement: `${DC_AC_RATIO_MIN}–${DC_AC_RATIO_OPTIMAL_MAX} (optimal)`,
      actual: `${round2(dcAcRatio)}`,
    });
  }

  // ---- Max PV Input Power ----

  if (totalPanelPower > inverterMaxPvW) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: `Total PV power (${round2(totalPanelPower)}W) exceeds the inverter's maximum PV input (${round2(inverterMaxPvW)}W).`,
      messageAr: `إجمالي طاقة PV (${round2(totalPanelPower)}W) يتجاوز أقصى مدخل PV للعاكس (${round2(inverterMaxPvW)}W).`,
      requirement: `≤ ${round2(inverterMaxPvW)}W`,
      actual: `${round2(totalPanelPower)}W`,
    });
  }

  // ---- Temperature checks ----

  const noctCellMax = cellTemperature(AMBIENT_TEMP_MAX_DEFAULT, panel.noct, 1000);
  const noctCellMin = cellTemperature(AMBIENT_TEMP_MIN_DEFAULT, panel.noct, 0);

  if (noctCellMax > 85) {
    pushIssue(issues, {
      type: 'warning',
      category: 'temperature',
      message: `Estimated maximum cell temperature (${round2(noctCellMax)}°C) may exceed the typical rated maximum (85°C) during peak summer conditions in Yemen.`,
      messageAr: `درجة حرارة الخلية القصوى المقدرة (${round2(noctCellMax)}°C) قد تتجاوز الحد الأقصى المصنف النموذجي (85°C) أثناء فصل الصيف في اليمن.`,
      requirement: `≤ 85°C`,
      actual: `${round2(noctCellMax)}°C`,
    });
  }

  if (panel.vmp * numberOfPanelsInString < inverter.mppt.mpptVoltageRange.min) {
    const minPanelsVmp = Math.ceil(inverter.mppt.mpptVoltageRange.min / panel.vmp);
    const minPanelsVoc = Math.ceil(inverter.maxDcInputVoltage / calcVocAtTemp(panel.voc, panel.tempCoeffVoc, VOC_TEMP_LOW));
    const minPanels = Math.max(minPanelsVmp, 1);
    if (numberOfPanelsInString < minPanels) {
      pushIssue(issues, {
        type: 'info',
        category: 'temperature',
        message: `At cold temperatures Voc rises. Recommended minimum panels per string is ${minPanels} to stay within the MPPT range.`,
        messageAr: `عند درجات الحرارة المنخفضة يرتفع Voc. الحد الأدنى الموصى به هو ${minPanels} لوحة لكل سلسلة للبقاء ضمن نطاق MPPT.`,
        requirement: `≥ ${minPanels} panels`,
        actual: `${numberOfPanelsInString} panels`,
      });
    }
  }

  // ---- N-1 MPPT failure analysis ----

  if (inverter.mppt.numberOfMppts > 1) {
    const operationalMppts = inverter.mppt.numberOfMppts - 1;
    const maxStringsAfterFailure = operationalMppts * inverter.mppt.maxStringsPerMppt;
    if (numberOfStrings > maxStringsAfterFailure) {
      pushIssue(issues, {
        type: 'warning',
        category: 'safety',
        message: `With ${inverter.mppt.numberOfMppts} MPPTs, if one fails (N-1), only ${operationalMppts} MPPT(s) remain with capacity for ${maxStringsAfterFailure} string(s). The current design uses ${numberOfStrings} string(s) and will not operate fully after a single MPPT failure.`,
        messageAr: `مع ${inverter.mppt.numberOfMppts} MPPTs، إذا فشل واحد (N-1)، يتبقى فقط ${operationalMppts} MPPT(s) بسعة ${maxStringsAfterFailure} سلسلة(سلسلات). التصميم الحالي يستخدم ${numberOfStrings} سلسلة ولن يعمل بالكامل بعد فشل MPPT واحد.`,
        requirement: `≤ ${maxStringsAfterFailure} strings for N-1 redundancy`,
        actual: `${numberOfStrings} strings`,
      });
    }

    const mpptPowerCapacity =
      operationalMppts * (inverter.mppt.mpptVoltageRange.max * inverter.mppt.maxInputCurrentPerMppt);
    if (totalPanelPower > mpptPowerCapacity) {
      pushIssue(issues, {
        type: 'warning',
        category: 'mppt',
        message: `After an N-1 MPPT failure, remaining MPPT power capacity (${round2(mpptPowerCapacity)}W) may be insufficient for total array power (${round2(totalPanelPower)}W).`,
        messageAr: `بعد فشل MPPT (N-1)، قد لا تكون سعة الطاقة المتاحة (${round2(mpptPowerCapacity)}W) كافية لطاقة المصفوفة الإجمالية (${round2(totalPanelPower)}W).`,
        requirement: `≤ ${round2(mpptPowerCapacity)}W`,
        actual: `${round2(totalPanelPower)}W`,
      });
    }
  }

  return buildResult(issues);
}

// ---------------------------------------------------------------------------
// 2. Inverter ↔ Battery compatibility
// ---------------------------------------------------------------------------

/**
 * Checks whether a battery is compatible with an inverter's battery
 * subsystem (voltage, type, communication, BMS brand, charge/discharge
 * current limits).
 *
 * @param inverter  Inverter database entry
 * @param battery   Battery database entry
 * @returns CompatibilityResult with score 0-100
 */
export function checkInverterBatteryCompatibility(
  inverter: InverterDatabaseEntry,
  battery: BatteryDatabaseEntry,
): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];

  const batteryCompat = inverter.batteryCompatibility;

  // ---- Supported voltage ----

  if (
    !batteryCompat.supportedVoltage.includes(battery.specs.nominalVoltage)
  ) {
    pushIssue(issues, {
      type: 'error',
      category: 'battery',
      message: `Battery nominal voltage (${battery.specs.nominalVoltage}V) is not in the inverter's supported battery voltages (${batteryCompat.supportedVoltage.join(', ')}V).`,
      messageAr: `الجهد الاسمو للبطارية (${battery.specs.nominalVoltage}V) غير موجود في جهود البطارية المدعومة للعاكس (${batteryCompat.supportedVoltage.join(', ')}V).`,
      requirement: `[${batteryCompat.supportedVoltage.join(', ')}]V`,
      actual: `${battery.specs.nominalVoltage}V`,
    });
  }

  // ---- Battery type ----

  if (!batteryCompat.batteryType.includes(battery.type)) {
    pushIssue(issues, {
      type: 'error',
      category: 'battery',
      message: `Battery type ("${battery.type}") is not supported by the inverter. Supported types: ${batteryCompat.batteryType.join(', ')}.`,
      messageAr: `نوع البطارية ("${battery.type}") غير مدعوم من العكس. الأنواع المدعومة: ${batteryCompat.batteryType.join(', ')}.`,
      requirement: `[${batteryCompat.batteryType.join(', ')}]`,
      actual: `"${battery.type}"`,
    });
  }

  // ---- Communication protocol ----

  const inverterProtocolTypes = batteryCompat.communicationProtocols.map(cp => cp.type);
  const sharedProtocols = battery.communication.protocols.filter((p) =>
    inverterProtocolTypes.includes(p),
  );

  if (sharedProtocols.length === 0) {
    pushIssue(issues, {
      type: 'error',
      category: 'protocol',
      message: `No shared communication protocol between battery (${battery.communication.protocols.join(', ')}) and inverter (${batteryCompat.communicationProtocols.join(', ')}). BMS communication will not work.`,
      messageAr: `لا يوجد بروتوكول اتصال مشترك بين البطارية (${battery.communication.protocols.join(', ')}) والعاكس (${batteryCompat.communicationProtocols.join(', ')}). لن يعمل اتصال BMS.`,
      requirement: batteryCompat.communicationProtocols.join(', '),
      actual: battery.communication.protocols.join(', '),
    });
  }

  // ---- Compatible BMS brand ----

  const isGenericCanSupported = batteryCompat.communicationProtocols.some(
    (p) => p.type === 'CAN',
  );

  const brandListed =
    batteryCompat.compatibleBatteryBrands.length === 0 ||
    batteryCompat.compatibleBatteryBrands.includes(battery.brand);

  if (!brandListed && !isGenericCanSupported) {
    pushIssue(issues, {
      type: 'warning',
      category: 'battery',
      message: `Battery brand "${battery.brand}" is not in the inverter's compatible brand list (${batteryCompat.compatibleBatteryBrands.join(', ') || 'none specified'}) and the inverter does not support generic CAN. Communication may require manual configuration.`,
      messageAr: `ماركة البطارية "${battery.brand}" غير موجودة في قائمة الماركات المدعومة للعاكس (${batteryCompat.compatibleBatteryBrands.join(', ') || 'غير محدد'}) والعاكس لا يدعم CAN العامة. قد يتطلب الاتصال ضبطًا يدويًا.`,
      requirement:
        batteryCompat.compatibleBatteryBrands.join(', ') || 'Any (with generic CAN)',
      actual: `"${battery.brand}"`,
    });
  }

  // ---- Charge current ----

  if (battery.chargingLimits) {
    if (
      battery.chargingLimits.maxChargeCurrent >
      batteryCompat.maxChargeCurrent
    ) {
      pushIssue(issues, {
        type: 'error',
        category: 'current',
        message: `Battery max charge current (${battery.chargingLimits.maxChargeCurrent}A) exceeds the inverter's maximum charge current (${batteryCompat.maxChargeCurrent}A). This could damage the battery or inverter.`,
        messageAr: `أقصى تيار شحن للبطارية (${battery.chargingLimits.maxChargeCurrent}A) يتجاوز أقصى تيار شحن للعاكس (${batteryCompat.maxChargeCurrent}A). قد يسبب هذا تلف البطارية أو العكس.`,
        requirement: `≤ ${batteryCompat.maxChargeCurrent}A`,
        actual: `${battery.chargingLimits.maxChargeCurrent}A`,
      });
    }

    // ---- Discharge current ----

    if (
      battery.chargingLimits.maxDischargeCurrent >
      batteryCompat.maxDischargeCurrent
    ) {
      pushIssue(issues, {
        type: 'error',
        category: 'current',
        message: `Battery max discharge current (${battery.chargingLimits.maxDischargeCurrent}A) exceeds the inverter's maximum discharge current (${batteryCompat.maxDischargeCurrent}A). Load may not be fully supported.`,
        messageAr: `أقصى تيار تفريغ للبطارية (${battery.chargingLimits.maxDischargeCurrent}A) يتجاوز أقصى تيار تفريغ للعاكس (${batteryCompat.maxDischargeCurrent}A). قد لا تُدعم الحمل بالكامل.`,
        requirement: `≤ ${batteryCompat.maxDischargeCurrent}A`,
        actual: `${battery.chargingLimits.maxDischargeCurrent}A`,
      });
    }
  }

  return buildResult(issues);
}

// ---------------------------------------------------------------------------
// 3. Battery string sizing
// ---------------------------------------------------------------------------

/**
 * Verifies that batteries can be configured in series and parallel to meet
 * the required system voltage and capacity.
 *
 * @param batteries            Array of identical battery database entries
 * @param totalRequiredVoltage Required system DC bus voltage
 * @param totalRequiredCapacity Required system capacity in Ah
 * @returns CompatibilityResult with score 0-100
 */
export function checkBatteryStringCompatibility(
  batteries: BatteryDatabaseEntry[],
  totalRequiredVoltage: number,
  totalRequiredCapacity: number,
): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];

  if (batteries.length === 0) {
    pushIssue(issues, {
      type: 'error',
      category: 'battery',
      message: 'No batteries provided for compatibility check.',
      messageAr: 'لم يتم توفير بطاريات لفحص التوافق.',
      requirement: '≥ 1 battery',
      actual: '0',
    });
    return buildResult(issues);
  }

  // Use the first battery as the reference (assumes homogeneous bank)
  const battery = batteries[0];

  // ---- Series configuration ----

  const seriesUnitsRequired = Math.ceil(
    totalRequiredVoltage / battery.specs.nominalVoltage,
  );

  if (seriesUnitsRequired > battery.seriesSupport) {
    pushIssue(issues, {
      type: 'error',
      category: 'voltage',
      message: `Reaching ${totalRequiredVoltage}V requires ${seriesUnitsRequired} batteries in series (${totalRequiredVoltage}V ÷ ${battery.specs.nominalVoltage}V per unit), but this battery model supports a maximum of ${battery.seriesSupport} in series.`,
      messageAr: `للوصول إلى ${totalRequiredVoltage}V يلزم ${seriesUnitsRequired} بطارية على التوالي (${totalRequiredVoltage}V ÷ ${battery.specs.nominalVoltage}V للوحدة)، لكن هذا الطراز يدعم ${battery.seriesSupport} كحد أقصى.`,
      requirement: `≤ ${battery.seriesSupport} in series`,
      actual: `${seriesUnitsRequired} required`,
    });
  }

  // Actual achievable voltage (may be higher than required)
  const actualVoltage = seriesUnitsRequired * battery.specs.nominalVoltage;

  // ---- Parallel configuration ----

  const parallelUnitsRequired = Math.ceil(
    totalRequiredCapacity / battery.specs.capacity,
  );

  if (parallelUnitsRequired > battery.parallelSupport) {
    pushIssue(issues, {
      type: 'error',
      category: 'battery',
      message: `Reaching ${totalRequiredCapacity}Ah requires ${parallelUnitsRequired} parallel strings (${totalRequiredCapacity}Ah ÷ ${battery.specs.capacity}Ah per unit), but this battery model supports a maximum of ${battery.parallelSupport} in parallel.`,
      messageAr: `للوصول إلى ${totalRequiredCapacity}Ah يلزم ${parallelUnitsRequired} سلسلة متوازية (${totalRequiredCapacity}Ah ÷ ${battery.specs.capacity}Ah للوحدة)، لكن هذا الطراز يدعم ${battery.parallelSupport} كحد أقصى.`,
      requirement: `≤ ${battery.parallelSupport} in parallel`,
      actual: `${parallelUnitsRequired} required`,
    });
  }

  // Actual achievable capacity
  const actualCapacity = parallelUnitsRequired * battery.specs.capacity;

  // ---- Verify actual vs required ----

  if (actualCapacity < totalRequiredCapacity) {
    pushIssue(issues, {
      type: 'warning',
      category: 'battery',
      message: `Actual bank capacity (${actualCapacity}Ah) is below the required ${totalRequiredCapacity}Ah due to integer unit rounding.`,
      messageAr: `السعة الفعلية للمصرف (${actualCapacity}Ah) أقل من المطلوب ${totalRequiredCapacity}Ah بسبب تقريب الوحدات.`,
      requirement: `≥ ${totalRequiredCapacity}Ah`,
      actual: `${actualCapacity}Ah`,
    });
  }

  // ---- Total units used vs batteries provided ----

  const totalUnitsNeeded = seriesUnitsRequired * parallelUnitsRequired;

  if (batteries.length < totalUnitsNeeded) {
    pushIssue(issues, {
      type: 'error',
      category: 'battery',
      message: `The bank requires ${totalUnitsNeeded} battery units (${seriesUnitsRequired}S × ${parallelUnitsRequired}P) but only ${batteries.length} unit(s) were provided.`,
      messageAr: `يتطلب المصرف ${totalUnitsNeeded} وحدة بطارية (${seriesUnitsRequired}S × ${parallelUnitsRequired}P) لكن تم توفير ${batteries.length} وحدة فقط.`,
      requirement: `≥ ${totalUnitsNeeded} units`,
      actual: `${batteries.length} units`,
    });
  }

  // ---- Voltage difference warning ----

  const voltageDiff = Math.abs(actualVoltage - totalRequiredVoltage);
  const voltagePercent = (voltageDiff / totalRequiredVoltage) * 100;
  if (voltagePercent > 10) {
    pushIssue(issues, {
      type: 'warning',
      category: 'voltage',
      message: `Achievable voltage (${actualVoltage}V) is ${round2(voltagePercent)}% different from the required ${totalRequiredVoltage}V. Verify that the inverter's battery charger can handle this voltage level.`,
      messageAr: `الجهد القابل للتحقيق (${actualVoltage}V) يختلف بنسبة ${round2(voltagePercent)}% عن المطلوب ${totalRequiredVoltage}V. تحقق من أن شاحن البطارية في العكس يمكنه التعامل مع هذا المستوى من الجهد.`,
      requirement: `${totalRequiredVoltage}V`,
      actual: `${actualVoltage}V`,
    });
  }

  return buildResult(issues);
}

// ---------------------------------------------------------------------------
// 4. String sizing calculator
// ---------------------------------------------------------------------------

/**
 * Calculates the valid range of panels per string for a given panel and
 * inverter combination.
 *
 * @param panel                 Panel database entry
 * @param inverter              Inverter database entry
 * @param numberOfPanelsInString Current number of panels per string
 * @returns Min/max panels and any issues found
 */
export function checkStringSizing(
  panel: PanelDatabaseEntry,
  inverter: InverterDatabaseEntry,
  numberOfPanelsInString: number,
): StringSizingResult {
  const issues: CompatibilityIssue[] = [];

  // Minimum panels – Vmp at STC must reach MPPT min voltage
  const minPanelsByVmp = Math.ceil(
    inverter.mppt.mpptVoltageRange.min / panel.vmp,
  );

  // Maximum panels by Vmp – must not exceed MPPT max voltage
  const maxPanelsByVmp = Math.floor(
    inverter.mppt.mpptVoltageRange.max / panel.vmp,
  );

  // Maximum panels by Voc at coldest temperature – must not exceed max DC input voltage
  const vocColdPerPanel = calcVocAtTemp(
    panel.voc,
    panel.tempCoeffVoc,
    VOC_TEMP_LOW,
  );
  const maxPanelsByVoc = Math.floor(
    inverter.maxDcInputVoltage / vocColdPerPanel,
  );

  const minPanels = Math.max(minPanelsByVmp, 1);
  const maxPanels = Math.min(maxPanelsByVmp, maxPanelsByVoc);

  const valid = minPanels <= maxPanels;

  if (!valid) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: `No valid string configuration exists. Minimum panels required by voltage (${minPanels}) exceeds the maximum allowed (${maxPanels}). This panel is not electrically compatible with this inverter.`,
      messageAr: `لا يوجد تكوين سلسلة صالح. الحد الأدنى المطلوب من الألواح (${minPanels}) يتجاوز الحد الأقصى المسموح (${maxPanels}). هذه اللوحة غير متوافقة كهربائيًا مع هذا العكس.`,
      requirement: `${minPanels}–${maxPanels} panels`,
      actual: `No valid range`,
    });
  } else if (numberOfPanelsInString < minPanels) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: `Current string size (${numberOfPanelsInString} panels) is below the minimum (${minPanels}). Vmp will be too low for the MPPT tracker.`,
      messageAr: `حجم السلسلة الحالي (${numberOfPanelsInString} لوحة) أقل من الحد الأدنى (${minPanels}). سيكون Vmp أقل من اللازم لمتتبع MPPT.`,
      requirement: `≥ ${minPanels} panels`,
      actual: `${numberOfPanelsInString} panels`,
    });
  } else if (numberOfPanelsInString > maxPanels) {
    pushIssue(issues, {
      type: 'error',
      category: 'voltage',
      message: `Current string size (${numberOfPanelsInString} panels) exceeds the maximum (${maxPanels}). Voltage will exceed safe limits at cold temperatures.`,
      messageAr: `حجم السلسلة الحالي (${numberOfPanelsInString} لوحة) يتجاوز الحد الأقصى (${maxPanels}). سيفوق الجهد حدود السلامة عند درجات الحرارة المنخفضة.`,
      requirement: `≤ ${maxPanels} panels`,
      actual: `${numberOfPanelsInString} panels`,
    });
  }

  // Info about limits
  if (valid) {
    pushIssue(issues, {
      type: 'info',
      category: 'mppt',
      message: `Valid range: ${minPanels}–${maxPanels} panels per string (Vmp min: ${minPanelsByVmp}, Vmp max: ${maxPanelsByVmp}, Voc cold max: ${maxPanelsByVoc}).`,
      messageAr: `النطاق الصالح: ${minPanels}–${maxPanels} لوحة لكل سلسلة (الحد الأدنى Vmp: ${minPanelsByVmp}، الحد الأقصى Vmp: ${maxPanelsByVmp}، الحد الأقصى Voc بارد: ${maxPanelsByVoc}).`,
      requirement: `${minPanels}–${maxPanels}`,
      actual: `${numberOfPanelsInString}`,
    });
  }

  return {
    valid,
    minPanels,
    maxPanels,
    issues,
  };
}

// ---------------------------------------------------------------------------
// 5. Full system compatibility verification (main entry point)
// ---------------------------------------------------------------------------

interface DesignParams {
  numberOfPanelsInString: number;
  numberOfStrings: number;
  requiredBatteryVoltage: number;
  requiredBatteryCapacity: number;
  ambientTempMin: number;
  ambientTempMax: number;
}

/**
 * Main entry point – runs every compatibility check and returns a single
 * combined result covering panel ↔ inverter, inverter ↔ battery, battery
 * string sizing, and overall system health.
 *
 * @param panels       Array of panel database entries (first element used as
 *                     representative; all panels in a string should be identical)
 * @param inverter     Inverter database entry
 * @param battery      Battery database entry (representative of the bank)
 * @param designParams System design parameters
 * @returns Combined CompatibilityResult with score 0-100
 */
export function verifyFullSystemCompatibility(
  panels: PanelDatabaseEntry[],
  inverter: InverterDatabaseEntry,
  battery: BatteryDatabaseEntry,
  designParams: DesignParams,
): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];

  if (panels.length === 0) {
    pushIssue(issues, {
      type: 'error',
      category: 'mppt',
      message: 'No panels provided for system verification.',
      messageAr: 'لم يتم توفير ألوحة للتحقق من النظام.',
      requirement: '≥ 1 panel',
      actual: '0',
    });
    return buildResult(issues);
  }

  const panel = panels[0];

  // ---- 1. Panel ↔ Inverter ----

  const panelInverterResult = checkPanelInverterCompatibility(
    panel,
    inverter,
    designParams.numberOfPanelsInString,
    designParams.numberOfStrings,
  );
  issues.push(...panelInverterResult.issues);

  // ---- 2. Inverter ↔ Battery ----

  const inverterBatteryResult = checkInverterBatteryCompatibility(
    inverter,
    battery,
  );
  issues.push(...inverterBatteryResult.issues);

  // ---- 3. Battery string sizing ----

  const batteryStringResult = checkBatteryStringCompatibility(
    [battery],
    designParams.requiredBatteryVoltage,
    designParams.requiredBatteryCapacity,
  );
  issues.push(...batteryStringResult.issues);

  // ---- 4. Temperature cross-checks using design ambient temps ----

  // Override defaults with design parameters where provided
  const ambientMin = designParams.ambientTempMin;
  const ambientMax = designParams.ambientTempMax;

  // Cell temperature at peak summer conditions (1000 W/m² irradiance)
  const peakCellTemp = cellTemperature(ambientMax, panel.noct, 1000);

  if (peakCellTemp > 85) {
    pushIssue(issues, {
      type: 'warning',
      category: 'temperature',
      message: `Peak cell temperature (${round2(peakCellTemp)}°C) exceeds the typical rated maximum (85°C) at ambient ${ambientMax}°C. Long-term reliability may be affected.`,
      messageAr: `درجة حرارة الخلية الذروية (${round2(peakCellTemp)}°C) تتجاوز الحد الأقصى المصنف النموذجي (85°C) عند جو ${ambientMax}°C. قد تتأثر الموثوقية طويلة الأجل.`,
      requirement: `≤ 85°C`,
      actual: `${round2(peakCellTemp)}°C`,
    });
  }

  // Voc at the coldest design ambient temperature
  const vocDesignCold = calcVocAtTemp(
    panel.voc,
    panel.tempCoeffVoc,
    ambientMin,
  ) * designParams.numberOfPanelsInString;

  if (vocDesignCold > inverter.maxDcInputVoltage) {
    pushIssue(issues, {
      type: 'error',
      category: 'voltage',
      message: `String Voc at design minimum ambient (${ambientMin}°C) is ${round2(vocDesignCold)}V, exceeding the inverter's max DC input (${inverter.maxDcInputVoltage}V).`,
      messageAr: `جهد Voc للسلسلة عند الحد الأدنى المصمم (${ambientMin}°C) هو ${round2(vocDesignCold)}V، يتجاوز أقصى DC للعاكس (${inverter.maxDcInputVoltage}V).`,
      requirement: `≤ ${inverter.maxDcInputVoltage}V`,
      actual: `${round2(vocDesignCold)}V`,
    });
  }

  // Temperature delta warning for inverter derating
  const tempDelta = ambientMax - ambientMin;
  if (tempDelta > 50) {
    pushIssue(issues, {
      type: 'info',
      category: 'temperature',
      message: `Wide ambient temperature range (${ambientMin}°C to ${ambientMax}°C, Δ${tempDelta}°C) may cause inverter derating at peak temperatures. Ensure the inverter is rated for ${ambientMax}°C operation.`,
      messageAr: `نطاق درجة حرارة واسع (${ambientMin}°C إلى ${ambientMax}°C، Δ${tempDelta}°C) قد يسبب خفض أداء العكس عند درجات الحرارة القصوى. تأكد من أن العكس مصنف للعمل عند ${ambientMax}°C.`,
      requirement: `≤ ${ambientMax}°C rated`,
      actual: `${tempDelta}°C range`,
    });
  }

  // ---- 5. DC cable / safety considerations ----

  const totalCurrent = panel.imp * designParams.numberOfStrings;
  const maxRecommendedDcCurrent = 60; // Typical rooftop safety limit
  if (totalCurrent > maxRecommendedDcCurrent) {
    pushIssue(issues, {
      type: 'warning',
      category: 'safety',
      message: `Total string current (${round2(totalCurrent)}A) exceeds common rooftop DC safety limit (${maxRecommendedDcCurrent}A). Ensure proper DC cable sizing, fusing, and disconnect ratings.`,
      messageAr: `تيار السلسلة الإجمالي (${round2(totalCurrent)}A) يتجاوز حد السلامة الشائع للrooftop DC (${maxRecommendedDcCurrent}A). تأكد من حجم الكابل الصحيح وال fusible والفصل.`,
      requirement: `≤ ${maxRecommendedDcCurrent}A (typical rooftop)`,
      actual: `${round2(totalCurrent)}A`,
    });
  }

  // ---- Build final result ----

  return buildResult(issues);
}
