import type { FinancialAnalysis } from '@/lib/types';

export function calculatePaybackPeriod(
  totalCost: number,
  annualSavings: number,
  inflationRate: number,
): number {
  if (annualSavings === 0) return Infinity;
  const rate = inflationRate / 100;
  if (rate === 0) return totalCost / annualSavings;

  let cumulativeSavings = 0;
  let year = 0;

  while (cumulativeSavings < totalCost && year < 50) {
    year++;
    cumulativeSavings += annualSavings * Math.pow(1 + rate, year - 1);
  }

  if (cumulativeSavings >= totalCost) {
    const prevCumulative = cumulativeSavings - annualSavings * Math.pow(1 + rate, year - 1);
    const remaining = totalCost - prevCumulative;
    const yearlySavings = annualSavings * Math.pow(1 + rate, year - 1);
    return year - 1 + remaining / yearlySavings;
  }

  return year;
}

export function calculateROI(
  totalCost: number,
  annualSavings: number,
  lifetime: number,
): number {
  if (totalCost === 0) return 0;
  const totalSavings = annualSavings * lifetime;
  return ((totalSavings - totalCost) / totalCost) * 100;
}

export function calculateLCOE(
  totalCost: number,
  annualEnergy: number,
  lifetime: number,
  degradation: number,
  discountRate: number,
): number {
  if (annualEnergy === 0) return 0;

  const dr = discountRate / 100;
  const deg = degradation / 100;

  let totalDiscountedEnergy = 0;
  let totalDiscountedCost = totalCost;

  for (let y = 1; y <= lifetime; y++) {
    const discountedEnergy = annualEnergy * Math.pow(1 - deg, y - 1) / Math.pow(1 + dr, y);
    totalDiscountedEnergy += discountedEnergy;
  }

  if (totalDiscountedEnergy === 0) return 0;
  return totalDiscountedCost / totalDiscountedEnergy;
}

export function calculateCO2Reduction(
  annualEnergy: number,
  gridEmissionFactor: number,
): number {
  return annualEnergy * gridEmissionFactor;
}

export function calculateCashFlow(
  totalCost: number,
  annualEnergy: number,
  electricityPrice: number,
  inflation: number,
  degradation: number,
  lifetime: number,
): { yearly: number[]; cumulative: number[] } {
  const yearly: number[] = [];
  const cumulative: number[] = [];
  let cumCashFlow = -totalCost;

  for (let y = 0; y <= lifetime; y++) {
    if (y === 0) {
      yearly.push(-totalCost);
      cumulative.push(cumCashFlow);
      continue;
    }

    const energyPrice = electricityPrice * Math.pow(1 + inflation / 100, y - 1);
    const energyProduction = annualEnergy * Math.pow(1 - degradation / 100, y - 1);
    const annualSavings = energyProduction * energyPrice;
    const annualCost = y === 1 ? 0 : totalCost * 0.01;
    const netCashFlow = annualSavings - annualCost;

    cumCashFlow += netCashFlow;
    yearly.push(netCashFlow);
    cumulative.push(cumCashFlow);
  }

  return { yearly, cumulative };
}

export function performFullFinancialAnalysis(projectData: any): FinancialAnalysis {
  const {
    totalSystemCost = 10000,
    annualEnergy = 12000,
    electricityPrice = 0.12,
    inflationRate = 2,
    degradation = 0.5,
    lifetime = 25,
    discountRate = 8,
    gridEmissionFactor = 0.5,
  } = projectData;

  const annualSavings = annualEnergy * electricityPrice;
  const paybackPeriod = calculatePaybackPeriod(totalSystemCost, annualSavings, inflationRate);
  const roi = calculateROI(totalSystemCost, annualSavings, lifetime);
  const lcoe = calculateLCOE(totalSystemCost, annualEnergy, lifetime, degradation, discountRate);
  const co2Reduction = calculateCO2Reduction(annualEnergy, gridEmissionFactor);
  const { yearly, cumulative } = calculateCashFlow(
    totalSystemCost,
    annualEnergy,
    electricityPrice,
    inflationRate,
    degradation,
    lifetime,
  );

  return {
    totalSystemCost,
    annualEnergy,
    annualSavings,
    paybackPeriod,
    roi,
    lcoe,
    co2Reduction,
    systemLifetime: lifetime,
    annualDegradation: degradation,
    electricityPrice,
    inflationRate,
    yearlyCashFlow: yearly,
    cumulativeCashFlow: cumulative,
  };
}
