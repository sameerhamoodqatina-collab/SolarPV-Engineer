export interface CityData {
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  peakSunHours: number;
  averageIrradiance: number;
  monthlyIrradiance: number[];
  ambientTemperature: number[];
}

export interface CountryData {
  code: string;
  name: string;
  nameAr: string;
  cities: CityData[];
}

export const countries: CountryData[] = [
  {
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    cities: [
      {
        name: 'Riyadh',
        nameAr: 'الرياض',
        latitude: 24.7136,
        longitude: 46.6753,
        peakSunHours: 6.8,
        averageIrradiance: 5.8,
        monthlyIrradiance: [4.1, 4.8, 5.9, 6.8, 7.2, 7.5, 7.1, 6.8, 6.5, 5.6, 4.3, 3.9],
        ambientTemperature: [14, 17, 22, 28, 33, 36, 37, 36, 33, 28, 21, 15]
      },
      {
        name: 'Jeddah',
        nameAr: 'جدة',
        latitude: 21.5433,
        longitude: 39.1728,
        peakSunHours: 7.2,
        averageIrradiance: 6.1,
        monthlyIrradiance: [4.5, 5.1, 6.2, 7.0, 7.5, 7.8, 7.4, 7.1, 6.8, 5.9, 4.8, 4.2],
        ambientTemperature: [22, 23, 26, 30, 33, 35, 36, 35, 33, 30, 27, 23]
      }
    ]
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    cities: [
      {
        name: 'Dubai',
        nameAr: 'دبي',
        latitude: 25.2048,
        longitude: 55.2708,
        peakSunHours: 7.0,
        averageIrradiance: 5.9,
        monthlyIrradiance: [4.2, 4.9, 6.0, 6.9, 7.3, 7.6, 7.2, 6.9, 6.6, 5.7, 4.5, 4.0],
        ambientTemperature: [19, 21, 25, 30, 34, 37, 39, 38, 35, 31, 26, 21]
      },
      {
        name: 'Abu Dhabi',
        nameAr: 'أبو ظبي',
        latitude: 24.4539,
        longitude: 54.3773,
        peakSunHours: 7.1,
        averageIrradiance: 6.0,
        monthlyIrradiance: [4.3, 5.0, 6.1, 7.0, 7.4, 7.7, 7.3, 7.0, 6.7, 5.8, 4.6, 4.1],
        ambientTemperature: [18, 20, 24, 29, 33, 36, 38, 37, 34, 30, 25, 20]
      }
    ]
  },
  {
    code: 'EG',
    name: 'Egypt',
    nameAr: 'مصر',
    cities: [
      {
        name: 'Cairo',
        nameAr: 'القاهرة',
        latitude: 30.0444,
        longitude: 31.2357,
        peakSunHours: 6.5,
        averageIrradiance: 5.5,
        monthlyIrradiance: [3.8, 4.5, 5.6, 6.5, 7.0, 7.3, 7.0, 6.6, 6.2, 5.3, 4.2, 3.6],
        ambientTemperature: [13, 15, 19, 24, 28, 31, 32, 31, 28, 25, 20, 14]
      },
      {
        name: 'Alexandria',
        nameAr: 'الإسكندرية',
        latitude: 31.2001,
        longitude: 29.9187,
        peakSunHours: 6.3,
        averageIrradiance: 5.3,
        monthlyIrradiance: [3.6, 4.2, 5.3, 6.2, 6.8, 7.1, 6.9, 6.5, 6.0, 5.1, 4.0, 3.4],
        ambientTemperature: [13, 14, 17, 21, 25, 28, 29, 28, 26, 24, 20, 15]
      }
    ]
  },
  {
    code: 'JO',
    name: 'Jordan',
    nameAr: 'الأردن',
    cities: [
      {
        name: 'Amman',
        nameAr: 'عمّان',
        latitude: 31.9454,
        longitude: 35.9284,
        peakSunHours: 6.6,
        averageIrradiance: 5.6,
        monthlyIrradiance: [3.9, 4.6, 5.7, 6.6, 7.1, 7.4, 7.1, 6.7, 6.3, 5.4, 4.3, 3.7],
        ambientTemperature: [8, 10, 14, 19, 24, 27, 29, 28, 25, 21, 15, 9]
      },
      {
        name: 'Aqaba',
        nameAr: 'العقبة',
        latitude: 29.5267,
        longitude: 35.0078,
        peakSunHours: 7.3,
        averageIrradiance: 6.2,
        monthlyIrradiance: [4.6, 5.2, 6.3, 7.1, 7.6, 7.9, 7.5, 7.2, 6.9, 6.0, 4.9, 4.3],
        ambientTemperature: [14, 16, 20, 25, 29, 32, 34, 33, 30, 26, 20, 15]
      }
    ]
  },
  {
    code: 'IQ',
    name: 'Iraq',
    nameAr: 'العراق',
    cities: [
      {
        name: 'Baghdad',
        nameAr: 'بغداد',
        latitude: 33.3152,
        longitude: 44.3661,
        peakSunHours: 6.7,
        averageIrradiance: 5.7,
        monthlyIrradiance: [3.9, 4.6, 5.8, 6.7, 7.2, 7.5, 7.2, 6.8, 6.4, 5.5, 4.3, 3.7],
        ambientTemperature: [10, 13, 18, 25, 32, 36, 38, 37, 33, 27, 19, 12]
      },
      {
        name: 'Basra',
        nameAr: 'البصرة',
        latitude: 30.5085,
        longitude: 47.7804,
        peakSunHours: 7.0,
        averageIrradiance: 5.9,
        monthlyIrradiance: [4.1, 4.8, 5.9, 6.8, 7.3, 7.6, 7.3, 7.0, 6.6, 5.7, 4.5, 3.9],
        ambientTemperature: [12, 15, 20, 28, 35, 39, 41, 40, 36, 30, 22, 14]
      }
    ]
  },
  {
    code: 'KW',
    name: 'Kuwait',
    nameAr: 'الكويت',
    cities: [
      {
        name: 'Kuwait City',
        nameAr: 'مدينة الكويت',
        latitude: 29.3759,
        longitude: 47.9774,
        peakSunHours: 6.9,
        averageIrradiance: 5.9,
        monthlyIrradiance: [4.2, 4.9, 6.0, 6.9, 7.3, 7.6, 7.3, 7.0, 6.7, 5.8, 4.6, 4.0],
        ambientTemperature: [13, 16, 21, 28, 34, 38, 40, 39, 36, 30, 22, 15]
      }
    ]
  },
  {
    code: 'QA',
    name: 'Qatar',
    nameAr: 'قطر',
    cities: [
      {
        name: 'Doha',
        nameAr: 'الدوحة',
        latitude: 25.2854,
        longitude: 51.5310,
        peakSunHours: 7.0,
        averageIrradiance: 5.9,
        monthlyIrradiance: [4.2, 4.9, 6.0, 6.9, 7.3, 7.6, 7.2, 6.9, 6.6, 5.7, 4.5, 4.0],
        ambientTemperature: [18, 20, 24, 30, 35, 38, 39, 38, 35, 31, 25, 20]
      }
    ]
  },
  {
    code: 'BH',
    name: 'Bahrain',
    nameAr: 'البحرين',
    cities: [
      {
        name: 'Manama',
        nameAr: 'المنامة',
        latitude: 26.2285,
        longitude: 50.5860,
        peakSunHours: 6.9,
        averageIrradiance: 5.8,
        monthlyIrradiance: [4.1, 4.8, 5.9, 6.8, 7.2, 7.5, 7.2, 6.9, 6.6, 5.7, 4.5, 4.0],
        ambientTemperature: [18, 20, 24, 30, 35, 38, 39, 38, 35, 31, 25, 20]
      }
    ]
  },
  {
    code: 'OM',
    name: 'Oman',
    nameAr: 'عمّان',
    cities: [
      {
        name: 'Muscat',
        nameAr: 'مسقط',
        latitude: 23.5859,
        longitude: 58.4059,
        peakSunHours: 7.1,
        averageIrradiance: 6.0,
        monthlyIrradiance: [4.4, 5.1, 6.2, 7.0, 7.5, 7.8, 7.4, 7.1, 6.8, 5.9, 4.8, 4.2],
        ambientTemperature: [20, 22, 26, 31, 35, 37, 36, 34, 32, 28, 24, 21]
      }
    ]
  },
  {
    code: 'MA',
    name: 'Morocco',
    nameAr: 'المغرب',
    cities: [
      {
        name: 'Casablanca',
        nameAr: 'الدار البيضاء',
        latitude: 33.5731,
        longitude: -7.5898,
        peakSunHours: 5.8,
        averageIrradiance: 5.0,
        monthlyIrradiance: [3.3, 3.9, 5.0, 5.8, 6.3, 6.7, 6.5, 6.1, 5.5, 4.5, 3.5, 3.0],
        ambientTemperature: [12, 13, 15, 17, 20, 23, 25, 25, 23, 20, 16, 13]
      },
      {
        name: 'Marrakech',
        nameAr: 'مراكش',
        latitude: 31.6295,
        longitude: -7.9811,
        peakSunHours: 6.5,
        averageIrradiance: 5.5,
        monthlyIrradiance: [3.8, 4.5, 5.6, 6.4, 6.9, 7.2, 6.9, 6.5, 6.0, 5.0, 4.0, 3.4],
        ambientTemperature: [10, 12, 15, 18, 22, 26, 30, 30, 26, 21, 15, 11]
      }
    ]
  },
  {
    code: 'TN',
    name: 'Tunisia',
    nameAr: 'تونس',
    cities: [
      {
        name: 'Tunis',
        nameAr: 'تونس',
        latitude: 36.8065,
        longitude: 10.1815,
        peakSunHours: 5.7,
        averageIrradiance: 4.9,
        monthlyIrradiance: [3.2, 3.8, 4.9, 5.7, 6.2, 6.6, 6.8, 6.2, 5.4, 4.4, 3.4, 2.9],
        ambientTemperature: [10, 11, 13, 16, 20, 25, 28, 28, 25, 21, 15, 11]
      }
    ]
  },
  {
    code: 'LY',
    name: 'Libya',
    nameAr: 'ليبيا',
    cities: [
      {
        name: 'Tripoli',
        nameAr: 'طرابلس',
        latitude: 32.8872,
        longitude: 13.1913,
        peakSunHours: 6.2,
        averageIrradiance: 5.3,
        monthlyIrradiance: [3.5, 4.1, 5.2, 6.1, 6.6, 7.0, 7.2, 6.6, 5.8, 4.8, 3.7, 3.1],
        ambientTemperature: [12, 13, 15, 18, 22, 26, 28, 28, 26, 23, 18, 13]
      }
    ]
  },
  {
    code: 'TR',
    name: 'Turkey',
    nameAr: 'تركيا',
    cities: [
      {
        name: 'Istanbul',
        nameAr: 'إسطنبول',
        latitude: 41.0082,
        longitude: 28.9784,
        peakSunHours: 4.8,
        averageIrradiance: 4.1,
        monthlyIrradiance: [2.2, 2.9, 3.9, 4.8, 5.7, 6.3, 6.6, 6.0, 5.0, 3.8, 2.6, 2.0],
        ambientTemperature: [5, 6, 10, 15, 20, 25, 27, 27, 23, 18, 12, 7]
      },
      {
        name: 'Ankara',
        nameAr: 'أنقرة',
        latitude: 39.9334,
        longitude: 32.8597,
        peakSunHours: 5.5,
        averageIrradiance: 4.7,
        monthlyIrradiance: [2.8, 3.5, 4.6, 5.5, 6.3, 6.8, 7.0, 6.5, 5.5, 4.2, 3.0, 2.4],
        ambientTemperature: [1, 3, 8, 13, 18, 23, 26, 25, 21, 15, 8, 3]
      }
    ]
  },
  {
    code: 'IR',
    name: 'Iran',
    nameAr: 'إيران',
    cities: [
      {
        name: 'Tehran',
        nameAr: 'طهران',
        latitude: 35.6892,
        longitude: 51.3890,
        peakSunHours: 5.8,
        averageIrradiance: 5.0,
        monthlyIrradiance: [3.2, 3.9, 5.0, 5.8, 6.4, 6.9, 7.0, 6.5, 5.7, 4.5, 3.3, 2.7],
        ambientTemperature: [3, 6, 12, 18, 24, 30, 33, 31, 26, 19, 11, 5]
      },
      {
        name: 'Isfahan',
        nameAr: 'أصفهان',
        latitude: 32.6539,
        longitude: 51.6660,
        peakSunHours: 6.3,
        averageIrradiance: 5.4,
        monthlyIrradiance: [3.7, 4.4, 5.5, 6.3, 6.9, 7.2, 7.3, 6.9, 6.2, 5.2, 4.0, 3.3],
        ambientTemperature: [2, 6, 13, 19, 25, 31, 34, 32, 27, 20, 11, 4]
      }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    nameAr: 'الهند',
    cities: [
      {
        name: 'Delhi',
        nameAr: 'نيودلهي',
        latitude: 28.7041,
        longitude: 77.1025,
        peakSunHours: 5.5,
        averageIrradiance: 4.7,
        monthlyIrradiance: [3.3, 4.0, 5.2, 6.0, 6.2, 5.8, 4.8, 4.5, 5.2, 5.0, 3.8, 3.1],
        ambientTemperature: [14, 18, 25, 33, 38, 38, 34, 32, 32, 29, 22, 15]
      },
      {
        name: 'Jaipur',
        nameAr: 'جايبور',
        latitude: 26.9124,
        longitude: 75.7873,
        peakSunHours: 6.0,
        averageIrradiance: 5.1,
        monthlyIrradiance: [3.8, 4.5, 5.6, 6.4, 6.6, 6.2, 5.0, 4.8, 5.5, 5.4, 4.2, 3.6],
        ambientTemperature: [14, 18, 25, 32, 37, 37, 33, 30, 31, 29, 22, 15]
      }
    ]
  },
  {
    code: 'PK',
    name: 'Pakistan',
    nameAr: 'باكستان',
    cities: [
      {
        name: 'Islamabad',
        nameAr: 'إسلام آباد',
        latitude: 33.6844,
        longitude: 73.0479,
        peakSunHours: 5.8,
        averageIrradiance: 5.0,
        monthlyIrradiance: [3.5, 4.2, 5.3, 6.1, 6.5, 6.8, 5.8, 5.2, 5.8, 5.3, 4.1, 3.3],
        ambientTemperature: [10, 13, 19, 26, 32, 35, 32, 30, 30, 26, 19, 12]
      },
      {
        name: 'Karachi',
        nameAr: 'كاراتشي',
        latitude: 24.8607,
        longitude: 67.0011,
        peakSunHours: 6.2,
        averageIrradiance: 5.3,
        monthlyIrradiance: [4.0, 4.7, 5.8, 6.4, 6.6, 6.2, 5.4, 5.2, 5.8, 5.8, 4.6, 3.9],
        ambientTemperature: [18, 21, 26, 30, 32, 32, 30, 29, 30, 30, 26, 20]
      }
    ]
  },
  {
    code: 'CN',
    name: 'China',
    nameAr: 'الصين',
    cities: [
      {
        name: 'Beijing',
        nameAr: 'بكين',
        latitude: 39.9042,
        longitude: 116.4074,
        peakSunHours: 4.8,
        averageIrradiance: 4.1,
        monthlyIrradiance: [2.8, 3.5, 4.6, 5.5, 6.1, 5.8, 4.8, 4.5, 5.2, 4.2, 3.0, 2.4],
        ambientTemperature: [-2, 2, 9, 18, 24, 28, 30, 28, 23, 15, 6, 0]
      },
      {
        name: 'Shanghai',
        nameAr: 'شنغهاي',
        latitude: 31.2304,
        longitude: 121.4737,
        peakSunHours: 4.2,
        averageIrradiance: 3.6,
        monthlyIrradiance: [2.5, 3.0, 3.8, 4.5, 5.0, 4.8, 5.2, 5.5, 4.8, 3.8, 2.8, 2.3],
        ambientTemperature: [4, 6, 11, 17, 23, 27, 30, 29, 25, 19, 12, 6]
      }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    nameAr: 'ألمانيا',
    cities: [
      {
        name: 'Berlin',
        nameAr: 'برلين',
        latitude: 52.5200,
        longitude: 13.4050,
        peakSunHours: 3.2,
        averageIrradiance: 2.8,
        monthlyIrradiance: [1.2, 1.8, 2.8, 3.8, 4.5, 4.6, 4.3, 3.8, 3.2, 2.2, 1.3, 1.0],
        ambientTemperature: [0, 1, 5, 10, 15, 18, 20, 19, 15, 10, 5, 1]
      },
      {
        name: 'Munich',
        nameAr: 'ميونخ',
        latitude: 48.1351,
        longitude: 11.5820,
        peakSunHours: 3.5,
        averageIrradiance: 3.0,
        monthlyIrradiance: [1.3, 2.0, 3.1, 4.0, 4.8, 5.0, 4.8, 4.2, 3.5, 2.4, 1.4, 1.1],
        ambientTemperature: [-1, 1, 6, 11, 16, 19, 21, 20, 16, 11, 5, 1]
      }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    nameAr: 'الولايات المتحدة',
    cities: [
      {
        name: 'Los Angeles',
        nameAr: 'لوس أنجلوس',
        latitude: 34.0522,
        longitude: -118.2437,
        peakSunHours: 5.8,
        averageIrradiance: 5.0,
        monthlyIrradiance: [3.5, 4.2, 5.2, 6.0, 6.5, 7.0, 7.5, 6.8, 5.8, 4.5, 3.5, 3.2],
        ambientTemperature: [14, 15, 16, 18, 20, 22, 25, 25, 24, 21, 17, 14]
      },
      {
        name: 'Phoenix',
        nameAr: 'فينيكس',
        latitude: 33.4484,
        longitude: -112.0740,
        peakSunHours: 6.8,
        averageIrradiance: 5.8,
        monthlyIrradiance: [4.5, 5.2, 6.2, 7.0, 7.5, 7.8, 6.5, 6.0, 6.2, 5.8, 4.8, 4.2],
        ambientTemperature: [13, 16, 20, 25, 30, 35, 36, 35, 33, 27, 19, 13]
      }
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    nameAr: 'إسبانيا',
    cities: [
      {
        name: 'Madrid',
        nameAr: 'مدريد',
        latitude: 40.4168,
        longitude: -3.7038,
        peakSunHours: 5.2,
        averageIrradiance: 4.5,
        monthlyIrradiance: [2.8, 3.5, 4.6, 5.4, 6.0, 6.5, 7.0, 6.2, 5.2, 4.0, 2.8, 2.3],
        ambientTemperature: [5, 7, 11, 14, 18, 24, 28, 27, 22, 15, 9, 6]
      },
      {
        name: 'Seville',
        nameAr: 'إشبيلية',
        latitude: 37.3891,
        longitude: -5.9845,
        peakSunHours: 6.0,
        averageIrradiance: 5.2,
        monthlyIrradiance: [3.3, 4.0, 5.2, 6.0, 6.5, 7.0, 7.5, 6.8, 5.8, 4.5, 3.3, 2.8],
        ambientTemperature: [10, 12, 15, 18, 22, 28, 32, 31, 27, 21, 15, 11]
      }
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    nameAr: 'إيطاليا',
    cities: [
      {
        name: 'Rome',
        nameAr: 'روما',
        latitude: 41.9028,
        longitude: 12.4964,
        peakSunHours: 5.0,
        averageIrradiance: 4.3,
        monthlyIrradiance: [2.8, 3.4, 4.4, 5.2, 5.8, 6.3, 6.8, 6.0, 5.2, 4.0, 2.8, 2.3],
        ambientTemperature: [8, 9, 12, 15, 20, 24, 27, 27, 23, 18, 13, 9]
      },
      {
        name: 'Milan',
        nameAr: 'ميلانو',
        latitude: 45.4642,
        longitude: 9.1900,
        peakSunHours: 3.8,
        averageIrradiance: 3.3,
        monthlyIrradiance: [1.8, 2.5, 3.5, 4.4, 5.0, 5.5, 5.8, 5.0, 4.2, 3.0, 1.8, 1.4],
        ambientTemperature: [2, 4, 9, 13, 18, 22, 24, 23, 19, 13, 7, 3]
      }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    nameAr: 'أستراليا',
    cities: [
      {
        name: 'Sydney',
        nameAr: 'سيدني',
        latitude: -33.8688,
        longitude: 151.2093,
        peakSunHours: 5.0,
        averageIrradiance: 4.3,
        monthlyIrradiance: [5.8, 5.2, 4.6, 3.8, 3.2, 2.8, 3.0, 3.8, 4.5, 5.0, 5.5, 5.8],
        ambientTemperature: [23, 23, 21, 18, 14, 12, 11, 12, 15, 18, 20, 22]
      },
      {
        name: 'Perth',
        nameAr: 'برث',
        latitude: -31.9505,
        longitude: 115.8605,
        peakSunHours: 6.0,
        averageIrradiance: 5.2,
        monthlyIrradiance: [7.0, 6.5, 5.5, 4.2, 3.2, 2.8, 3.0, 3.8, 4.8, 5.5, 6.2, 6.8],
        ambientTemperature: [25, 25, 23, 19, 16, 13, 12, 13, 15, 18, 21, 24]
      }
    ]
  },
  {
    code: 'ZA',
    name: 'South Africa',
    nameAr: 'جنوب أفريقيا',
    cities: [
      {
        name: 'Johannesburg',
        nameAr: 'جوهانسبرغ',
        latitude: -26.2041,
        longitude: 28.0473,
        peakSunHours: 5.8,
        averageIrradiance: 5.0,
        monthlyIrradiance: [6.2, 5.8, 5.2, 4.5, 3.8, 3.2, 3.5, 4.2, 5.0, 5.5, 6.0, 6.2],
        ambientTemperature: [20, 20, 18, 14, 11, 8, 8, 10, 14, 17, 18, 20]
      },
      {
        name: 'Cape Town',
        nameAr: 'كيب تاون',
        latitude: -33.9249,
        longitude: 18.4241,
        peakSunHours: 5.5,
        averageIrradiance: 4.7,
        monthlyIrradiance: [6.5, 5.8, 5.0, 3.8, 2.8, 2.5, 2.8, 3.5, 4.2, 5.0, 5.8, 6.2],
        ambientTemperature: [21, 21, 19, 16, 13, 11, 10, 11, 13, 16, 18, 20]
      }
    ]
  },
  {
    code: 'NG',
    name: 'Nigeria',
    nameAr: 'نيجيريا',
    cities: [
      {
        name: 'Lagos',
        nameAr: 'لاغوس',
        latitude: 6.5244,
        longitude: 3.3792,
        peakSunHours: 4.8,
        averageIrradiance: 4.1,
        monthlyIrradiance: [4.2, 4.5, 4.8, 4.8, 4.5, 3.8, 3.2, 3.0, 3.5, 4.0, 4.2, 4.2],
        ambientTemperature: [27, 28, 28, 28, 27, 26, 25, 25, 26, 27, 27, 27]
      },
      {
        name: 'Abuja',
        nameAr: 'أبوجا',
        latitude: 9.0579,
        longitude: 7.4951,
        peakSunHours: 5.5,
        averageIrradiance: 4.7,
        monthlyIrradiance: [4.8, 5.2, 5.5, 5.2, 4.8, 4.2, 3.5, 3.2, 3.8, 4.5, 4.8, 4.8],
        ambientTemperature: [25, 28, 32, 32, 30, 27, 25, 24, 26, 28, 27, 25]
      }
    ]
  },
  {
    code: 'YE',
    name: 'Yemen',
    nameAr: 'اليمن',
    cities: [
      { name: 'Sana\'a', nameAr: 'صنعاء', latitude: 15.3694, longitude: 44.191, peakSunHours: 6.5, averageIrradiance: 5.5, monthlyIrradiance: [4.0, 4.6, 5.6, 6.5, 6.8, 7.0, 6.7, 6.5, 6.2, 5.3, 4.2, 3.8], ambientTemperature: [12, 14, 18, 22, 24, 26, 26, 25, 23, 19, 16, 13] },
      { name: 'Aden', nameAr: 'عدن', latitude: 12.7855, longitude: 45.0187, peakSunHours: 7.2, averageIrradiance: 6.1, monthlyIrradiance: [4.8, 5.3, 6.3, 7.0, 7.3, 7.5, 7.2, 7.0, 6.7, 5.8, 5.0, 4.5], ambientTemperature: [24, 25, 27, 30, 32, 33, 33, 32, 31, 29, 27, 25] },
      { name: 'Taiz', nameAr: 'تعز', latitude: 13.5789, longitude: 44.0219, peakSunHours: 6.8, averageIrradiance: 5.7, monthlyIrradiance: [4.2, 4.8, 5.8, 6.7, 7.0, 7.2, 6.9, 6.7, 6.4, 5.5, 4.4, 4.0], ambientTemperature: [16, 18, 21, 24, 26, 28, 28, 27, 26, 23, 20, 17] },
      { name: 'Al Hudaydah', nameAr: 'الحديدة', latitude: 14.7979, longitude: 42.9521, peakSunHours: 7.0, averageIrradiance: 5.9, monthlyIrradiance: [4.5, 5.0, 6.0, 6.8, 7.1, 7.3, 7.0, 6.8, 6.5, 5.6, 4.6, 4.2], ambientTemperature: [22, 23, 26, 29, 31, 33, 34, 33, 32, 29, 26, 23] },
      { name: 'Ibb', nameAr: 'إب', latitude: 13.9667, longitude: 44.1667, peakSunHours: 6.3, averageIrradiance: 5.3, monthlyIrradiance: [3.8, 4.4, 5.4, 6.3, 6.6, 6.8, 6.5, 6.3, 6.0, 5.1, 4.0, 3.6], ambientTemperature: [14, 16, 19, 22, 24, 26, 26, 25, 24, 21, 18, 15] },
      { name: 'Marib', nameAr: 'مأرب', latitude: 15.4703, longitude: 45.3261, peakSunHours: 6.8, averageIrradiance: 5.8, monthlyIrradiance: [4.2, 4.8, 5.9, 6.8, 7.1, 7.3, 7.0, 6.8, 6.5, 5.6, 4.3, 3.9], ambientTemperature: [13, 15, 20, 25, 28, 31, 32, 31, 28, 23, 18, 14] },
      { name: 'Hadramaut', nameAr: 'حضرموت', latitude: 15.9500, longitude: 48.7833, peakSunHours: 7.1, averageIrradiance: 6.0, monthlyIrradiance: [4.5, 5.1, 6.1, 6.9, 7.2, 7.4, 7.1, 6.9, 6.6, 5.7, 4.5, 4.1], ambientTemperature: [18, 20, 24, 28, 31, 33, 34, 33, 30, 26, 22, 19] },
      { name: 'Seiyun', nameAr: 'سيئون', latitude: 15.9430, longitude: 48.7873, peakSunHours: 7.0, averageIrradiance: 5.9, monthlyIrradiance: [4.4, 5.0, 6.0, 6.8, 7.1, 7.3, 7.0, 6.8, 6.5, 5.6, 4.4, 4.0], ambientTemperature: [17, 19, 23, 27, 30, 32, 33, 32, 29, 25, 21, 18] },
      { name: 'Al Mukalla', nameAr: 'المكلا', latitude: 14.5425, longitude: 49.1244, peakSunHours: 7.3, averageIrradiance: 6.2, monthlyIrradiance: [4.9, 5.4, 6.4, 7.1, 7.4, 7.6, 7.3, 7.1, 6.8, 5.9, 5.1, 4.6], ambientTemperature: [23, 24, 27, 30, 32, 34, 35, 34, 32, 30, 27, 24] },
      { name: 'Dhamar', nameAr: 'ذمار', latitude: 14.5427, longitude: 44.4050, peakSunHours: 6.4, averageIrradiance: 5.4, monthlyIrradiance: [3.9, 4.5, 5.5, 6.4, 6.7, 6.9, 6.6, 6.4, 6.1, 5.2, 4.1, 3.7], ambientTemperature: [10, 12, 16, 20, 22, 24, 24, 23, 21, 17, 14, 11] },
      { name: 'Amran', nameAr: 'عمران', latitude: 15.6594, longitude: 43.9439, peakSunHours: 6.5, averageIrradiance: 5.5, monthlyIrradiance: [4.0, 4.6, 5.6, 6.5, 6.8, 7.0, 6.7, 6.5, 6.2, 5.3, 4.2, 3.8], ambientTemperature: [11, 13, 17, 21, 23, 25, 25, 24, 22, 18, 15, 12] },
      { name: 'Hodeidah', nameAr: 'الحديدة', latitude: 14.7979, longitude: 42.9521, peakSunHours: 7.0, averageIrradiance: 5.9, monthlyIrradiance: [4.5, 5.0, 6.0, 6.8, 7.1, 7.3, 7.0, 6.8, 6.5, 5.6, 4.6, 4.2], ambientTemperature: [22, 23, 26, 29, 31, 33, 34, 33, 32, 29, 26, 23] },
      { name: 'Lahij', nameAr: 'لحج', latitude: 13.0500, longitude: 44.8833, peakSunHours: 7.0, averageIrradiance: 5.9, monthlyIrradiance: [4.5, 5.0, 6.0, 6.8, 7.1, 7.3, 7.0, 6.8, 6.5, 5.6, 4.6, 4.2], ambientTemperature: [22, 23, 26, 29, 31, 33, 34, 33, 32, 29, 26, 23] },
      { name: 'Abyan', nameAr: 'أبين', latitude: 13.2000, longitude: 45.3333, peakSunHours: 7.1, averageIrradiance: 6.0, monthlyIrradiance: [4.6, 5.1, 6.1, 6.9, 7.2, 7.4, 7.1, 6.9, 6.6, 5.7, 4.7, 4.3], ambientTemperature: [23, 24, 27, 30, 32, 34, 35, 34, 32, 30, 27, 24] },
      { name: 'Shabwah', nameAr: 'شبوة', latitude: 14.5333, longitude: 46.8333, peakSunHours: 6.8, averageIrradiance: 5.7, monthlyIrradiance: [4.2, 4.8, 5.8, 6.6, 6.9, 7.1, 6.8, 6.6, 6.3, 5.4, 4.3, 3.9], ambientTemperature: [17, 19, 23, 27, 30, 32, 33, 32, 29, 25, 21, 18] },
      { name: 'Socotra', nameAr: 'سقطرى', latitude: 12.4634, longitude: 53.8237, peakSunHours: 7.0, averageIrradiance: 5.8, monthlyIrradiance: [4.3, 4.9, 5.9, 6.7, 7.0, 7.2, 6.9, 6.7, 6.4, 5.5, 4.5, 4.1], ambientTemperature: [24, 25, 27, 29, 30, 31, 31, 30, 29, 28, 26, 25] },
    ]
  }
];

export function getCountryByCode(code: string): CountryData | undefined {
  return countries.find(c => c.code === code);
}

export function searchCountries(query: string): CountryData[] {
  const q = query.toLowerCase();
  return countries.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(query) ||
      c.code.toLowerCase().includes(q)
  );
}

export function getCitiesByCountry(countryCode: string): CityData[] {
  const country = getCountryByCode(countryCode);
  return country ? country.cities : [];
}

export function getCityData(countryCode: string, cityName: string): CityData | undefined {
  const country = getCountryByCode(countryCode);
  return country?.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
}

export function getAllCities(): (CityData & { countryCode: string; countryName: string })[] {
  const result: (CityData & { countryCode: string; countryName: string })[] = [];
  for (const country of countries) {
    for (const city of country.cities) {
      result.push({
        ...city,
        countryCode: country.code,
        countryName: country.name
      });
    }
  }
  return result;
}
