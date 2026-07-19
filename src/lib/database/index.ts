export { yemenPanels, getPanelsByBrand, getPanelsByPowerRange, getCompatiblePanels, searchPanels, getPanelById } from './panels';
export type { PanelDatabaseEntry } from './panels';

export { yemenInverters, getInvertersByCategory, getInvertersByBrand, getCompatibleInverters, searchInverters, getInverterById } from './inverters';
export type { InverterDatabaseEntry, MPPTConfig, BatteryCompatibility, CommunicationProtocol } from './inverters';

export { yemenBatteries, getBatteriesByBrand, getBatteriesByType, getBatteriesByVoltage, getCompatibleBatteries, searchBatteries, getBatteryById } from './batteries';
export type { BatteryDatabaseEntry, BatterySpecs, BatteryCommunication, BatteryChargingLimits } from './batteries';

import { yemenPanels } from './panels';
import { yemenInverters } from './inverters';
import { yemenBatteries } from './batteries';

export function getEnabledPanels() {
  return yemenPanels.filter(p => p.enabled && p.availableInYemen);
}

export function getEnabledInverters(category?: 'hybrid' | 'offgrid' | 'ongrid') {
  const list = yemenInverters.filter(i => i.enabled && i.availableInYemen);
  return category ? list.filter(i => i.category === category) : list;
}

export function getEnabledBatteries(type?: 'lithium' | 'leadacid' | 'gel' | 'agm') {
  const list = yemenBatteries.filter(b => b.enabled && b.availableInYemen);
  return type ? list.filter(b => b.type === type) : list;
}

export function getUniquePanelBrands(): string[] {
  return [...new Set(getEnabledPanels().map(p => p.brand))];
}

export function getUniqueInverterBrands(category?: 'hybrid' | 'offgrid' | 'ongrid'): string[] {
  return [...new Set(getEnabledInverters(category).map(i => i.brand))];
}

export function getUniqueBatteryBrands(type?: 'lithium' | 'leadacid' | 'gel' | 'agm'): string[] {
  return [...new Set(getEnabledBatteries(type).map(b => b.brand))];
}

export function getDatabaseStats() {
  const panels = getEnabledPanels();
  const inverters = getEnabledInverters();
  const batteries = getEnabledBatteries();

  return {
    panels: {
      total: panels.length,
      brands: getUniquePanelBrands().length,
      powerRange: {
        min: Math.min(...panels.map(p => p.power)),
        max: Math.max(...panels.map(p => p.power)),
      },
    },
    inverters: {
      total: inverters.length,
      brands: getUniqueInverterBrands().length,
      hybrid: inverters.filter(i => i.category === 'hybrid').length,
      offgrid: inverters.filter(i => i.category === 'offgrid').length,
      ongrid: inverters.filter(i => i.category === 'ongrid').length,
      powerRange: {
        min: Math.min(...inverters.map(i => i.ratedPower)),
        max: Math.max(...inverters.map(i => i.ratedPower)),
      },
    },
    batteries: {
      total: batteries.length,
      brands: getUniqueBatteryBrands().length,
      lithium: batteries.filter(b => b.type === 'lithium').length,
      leadacid: batteries.filter(b => b.type === 'leadacid').length,
      gel: batteries.filter(b => b.type === 'gel').length,
      agm: batteries.filter(b => b.type === 'agm').length,
    },
  };
}
