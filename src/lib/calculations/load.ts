import type { LoadItem, LoadProfile } from '@/lib/types';

export function calculateHourlyLoad(loads: LoadItem[]): number[] {
  const hourlyLoad = new Array(24).fill(0);

  for (const load of loads) {
    const powerPerUnit = (load.power * load.quantity * load.powerFactor) / load.efficiency;

    if (load.scheduleType === 'always') {
      for (let h = 0; h < 24; h++) {
        hourlyLoad[h] += powerPerUnit;
      }
    } else {
      for (let h = 0; h < 24; h++) {
        let inSchedule = false;
        if (load.endTime > load.startTime) {
          inSchedule = h >= load.startTime && h < load.endTime;
        } else {
          inSchedule = h >= load.startTime || h < load.endTime;
        }
        if (inSchedule) {
          hourlyLoad[h] += powerPerUnit;
        }
      }
    }
  }

  return hourlyLoad;
}

export function calculateDailyEnergy(hourlyLoad: number[]): number {
  return hourlyLoad.reduce((sum, val) => sum + val, 0);
}

export function calculateNightEnergy(hourlyLoad: number[]): number {
  let energy = 0;
  for (let h = 0; h < 24; h++) {
    if (h < 6 || h >= 18) {
      energy += hourlyLoad[h];
    }
  }
  return energy;
}

export function calculateDayEnergy(hourlyLoad: number[]): number {
  let energy = 0;
  for (let h = 0; h < 24; h++) {
    if (h >= 6 && h < 18) {
      energy += hourlyLoad[h];
    }
  }
  return energy;
}

export function calculatePeakDemand(hourlyLoad: number[]): number {
  return Math.max(...hourlyLoad);
}

export function calculateAverageDemand(hourlyLoad: number[]): number {
  return calculateDailyEnergy(hourlyLoad) / 24;
}

export function calculateMaximumDemand(loads: LoadItem[]): number {
  const hourlyLoad = calculateHourlyLoad(loads);
  let maxDemand = 0;

  for (let h = 0; h < 24; h++) {
    let demandAtHour = 0;
    for (const load of loads) {
      const basePower =
        (load.power * load.quantity * load.powerFactor) / load.efficiency;
      let inSchedule = false;
      if (load.scheduleType === 'always') {
        inSchedule = true;
      } else if (load.endTime > load.startTime) {
        inSchedule = h >= load.startTime && h < load.endTime;
      } else {
        inSchedule = h >= load.startTime || h < load.endTime;
      }
      if (inSchedule) {
        demandAtHour += basePower * load.startingCurrent;
      }
    }
    maxDemand = Math.max(maxDemand, demandAtHour);
  }

  return maxDemand;
}

export function calculateLoadProfile(loads: LoadItem[]): LoadProfile {
  const hourlyLoad = calculateHourlyLoad(loads);
  const dailyEnergy = calculateDailyEnergy(hourlyLoad);
  const nightEnergy = calculateNightEnergy(hourlyLoad);
  const dayEnergy = calculateDayEnergy(hourlyLoad);
  const peakDemand = calculatePeakDemand(hourlyLoad);
  const averageDemand = calculateAverageDemand(hourlyLoad);
  const maximumDemand = calculateMaximumDemand(loads);

  return {
    loads,
    hourlyLoad,
    dailyEnergy,
    nightEnergy,
    dayEnergy,
    peakDemand,
    averageDemand,
    maximumDemand,
  };
}
