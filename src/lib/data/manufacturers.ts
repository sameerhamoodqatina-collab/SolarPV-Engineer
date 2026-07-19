import type { Manufacturer } from '@/lib/types';

export const manufacturers: Manufacturer[] = [
  // Inverter Manufacturers
  {
    id: 'huawei',
    name: 'Huawei',
    nameAr: 'الهواوي',
    country: 'China',
    logo: '/logos/manufacturers/huawei.svg',
    type: 'inverter',
    website: 'https://solar.huawei.com'
  },
  {
    id: 'sungrow',
    name: 'Sungrow',
    nameAr: 'سونغرو',
    country: 'China',
    logo: '/logos/manufacturers/sungrow.svg',
    type: 'inverter',
    website: 'https://www.sungrowpower.com'
  },
  {
    id: 'sma',
    name: 'SMA',
    nameAr: 'إس إم أي',
    country: 'Germany',
    logo: '/logos/manufacturers/sma.svg',
    type: 'inverter',
    website: 'https://www.sma.de'
  },
  {
    id: 'deye',
    name: 'Deye',
    nameAr: 'ديي',
    country: 'China',
    logo: '/logos/manufacturers/deye.svg',
    type: 'inverter',
    website: 'https://www.deye.com'
  },
  {
    id: 'victron',
    name: 'Victron Energy',
    nameAr: 'فيكترون',
    country: 'Netherlands',
    logo: '/logos/manufacturers/victron.svg',
    type: 'inverter',
    website: 'https://www.victronenergy.com'
  },
  {
    id: 'growatt',
    name: 'Growatt',
    nameAr: 'غروتت',
    country: 'China',
    logo: '/logos/manufacturers/growatt.svg',
    type: 'inverter',
    website: 'https://www.growatt.com'
  },
  {
    id: 'goodwe',
    name: 'GoodWe',
    nameAr: 'غود وي',
    country: 'China',
    logo: '/logos/manufacturers/goodwe.svg',
    type: 'inverter',
    website: 'https://www.goodwe.com'
  },
  {
    id: 'fronius',
    name: 'Fronius',
    nameAr: 'فرونيوس',
    country: 'Austria',
    logo: '/logos/manufacturers/fronius.svg',
    type: 'inverter',
    website: 'https://www.fronius.com'
  },
  // Panel Manufacturers
  {
    id: 'jinko',
    name: 'Jinko Solar',
    nameAr: 'جينكو',
    country: 'China',
    logo: '/logos/manufacturers/jinko.svg',
    type: 'panel',
    website: 'https://www.jinkosolar.com'
  },
  {
    id: 'longi',
    name: 'LONGi',
    nameAr: 'لونجي',
    country: 'China',
    logo: '/logos/manufacturers/longi.svg',
    type: 'panel',
    website: 'https://www.longi.com'
  },
  {
    id: 'trina',
    name: 'Trina Solar',
    nameAr: 'تراينا',
    country: 'China',
    logo: '/logos/manufacturers/trina.svg',
    type: 'panel',
    website: 'https://www.trinasolar.com'
  },
  {
    id: 'canadian',
    name: 'Canadian Solar',
    nameAr: 'كندايان',
    country: 'China/Canada',
    logo: '/logos/manufacturers/canadian.svg',
    type: 'panel',
    website: 'https://www.canadiansolar.com'
  },
  {
    id: 'ja',
    name: 'JA Solar',
    nameAr: 'جي إيه',
    country: 'China',
    logo: '/logos/manufacturers/ja.svg',
    type: 'panel',
    website: 'https://www.jasolar.com'
  },
  // Battery Manufacturers
  {
    id: 'pylontech',
    name: 'Pylontech',
    nameAr: 'بايلون',
    country: 'China',
    logo: '/logos/manufacturers/pylontech.svg',
    type: 'battery',
    website: 'https://www.pylontech.com'
  },
  {
    id: 'dyness',
    name: 'Dyness',
    nameAr: 'ديناس',
    country: 'China',
    logo: '/logos/manufacturers/dyness.svg',
    type: 'battery',
    website: 'https://www.dyness.com'
  },
  {
    id: 'byd',
    name: 'BYD',
    nameAr: 'بي و دي',
    country: 'China',
    logo: '/logos/manufacturers/byd.svg',
    type: 'battery',
    website: 'https://www.byd.com'
  },
  {
    id: 'catl',
    name: 'CATL',
    nameAr: 'سي إيه تي إل',
    country: 'China',
    logo: '/logos/manufacturers/catl.svg',
    type: 'battery',
    website: 'https://www.catl.com'
  },
  {
    id: 'eve',
    name: 'EVE',
    nameAr: 'إي في إي',
    country: 'China',
    logo: '/logos/manufacturers/eve.svg',
    type: 'battery',
    website: 'https://www.evebattery.com'
  }
];

export function getManufacturerById(id: string): Manufacturer | undefined {
  return manufacturers.find(m => m.id === id);
}

export function getManufacturersByType(type: Manufacturer['type']): Manufacturer[] {
  return manufacturers.filter(m => m.type === type);
}

export function searchManufacturers(query: string): Manufacturer[] {
  const q = query.toLowerCase();
  return manufacturers.filter(
    m =>
      m.name.toLowerCase().includes(q) ||
      m.nameAr.includes(query) ||
      m.country.toLowerCase().includes(q)
  );
}
