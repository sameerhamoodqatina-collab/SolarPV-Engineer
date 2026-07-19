export interface Standard {
  code: string;
  title: string;
  titleAr: string;
  scope: string;
  scopeAr: string;
  category: string;
}

export const standards: Standard[] = [
  {
    code: 'IEC 60364',
    title: 'Low-voltage electrical installations',
    titleAr: 'التركيبات الكهربائية منخفضة الجهد',
    scope: 'Provides requirements for the design, erection, and verification of electrical installations in buildings and structures. Covers protection against electric shock, thermal effects, overcurrent, fault currents, and overvoltage.',
    scopeAr: 'يقدم المتطلبات للتصميم والتركيب والتحقق من التركيبات الكهربائية في المباني والهياكل. يشمل الحماية من الصدمة الكهربائية والتأثيرات الحرارية والتيار الزائد والتيارات العطلية والجهد الزائد.',
    category: 'Installation'
  },
  {
    code: 'IEC 62548',
    title: 'Design requirements for photovoltaic (PV) arrays',
    titleAr: 'متطلبات تصميم مصفوفات الطاقة الشمسية الفوتوفولتائية',
    scope: 'Specifies the design requirements for ground-mounted, building-integrated, and building-mounted photovoltaic (PV) arrays. Includes requirements for PV module mechanical design, PV array electrical design, and PV array marking and documentation.',
    scopeAr: 'يحدد متطلبات التصميم لمصفوفات الطاقة الشمسية الفوتوفولتائية المثبتة على الأرض والمتكاملة في المباني والمثبتة عليها. يتضمن متطلبات التصميم الميكانيكي للوحات الشمسية والتصميم الكهربائي للمصفوفة والتوثيق.',
    category: 'PV System Design'
  },
  {
    code: 'IEC 61724',
    title: 'Photovoltaic system performance monitoring',
    titleAr: 'مراقبة أداء أنظمة الطاقة الشمسية الفوتوفولتائية',
    scope: 'Provides guidelines for monitoring the performance of photovoltaic (PV) systems. Defines performance parameters, data acquisition methods, and analysis procedures for system performance evaluation.',
    scopeAr: 'يوفر إرشادات لمراقبة أداء أنظمة الطاقة الشمسية الفوتوفولتائية. يحدد معايير الأداء وطرق جمع البيانات وإجراءات التحليل لتقييم أداء النظام.',
    category: 'Performance Monitoring'
  },
  {
    code: 'IEC 61215',
    title: 'Design qualification and type approval for crystalline silicon PV modules',
    titleAr: 'التأهيل التصميمي والموافقة على الأنواع للوحات السيليكون البلورية الفوتوفولتائية',
    scope: 'Establishes design qualification and type approval requirements for crystalline silicon terrestrial photovoltaic (PV) modules. Defines test procedures for module durability, performance, and safety under simulated environmental conditions.',
    scopeAr: 'يؤسس متطلبات التأهيل التصميمي والموافقة على الأنواع للوحات السيليكون البلورية الفوتوفولتائية البرية. يحدد إجراءات الاختبار لمتانة الأداء وأمان الوحدات في ظروف بيئية محاكاة.',
    category: 'PV Module Testing'
  },
  {
    code: 'IEC 61730',
    title: 'Photovoltaic (PV) module safety qualification',
    titleAr: 'التأهيل الأمني للوحات الطاقة الشمسية الفوتوفولتائية',
    scope: 'Provides qualification and safety requirements for the design and manufacture of photovoltaic (PV) modules. Covers construction requirements, tests, and marking requirements to ensure safe operation throughout the module lifetime.',
    scopeAr: 'يوفر متطلبات التأهيل والأمان لتصنيع وتصنيع لوحات الطاقة الشمسية الفوتوفولتائية. يتضمن متطلبات البناء والاختبارات وال işaret للensure آمن طوال عمر الوحدة.',
    category: 'PV Module Safety'
  },
  {
    code: 'NEC 2023',
    title: 'National Electrical Code (NFPA 70) - 2023 Edition',
    titleAr: 'الكود الكهربائي الوطني (NFPA 70) - الإصدار 2023',
    scope: 'The benchmark for safe electrical design, installation, and inspection to protect people and property from electrical hazards. Article 690 specifically addresses solar photovoltaic systems, including wiring methods, conductor sizing, disconnecting means, and grounding.',
    scopeAr: 'المعيار لتصميم وتثبيت وفحص الكهرباء الآمنة لحماية الأشخاص والممتلكات من المخاطر الكهربائية. يتناول القسم 690 بشكل خاص أنظمة الطاقة الشمسية الفوتوفولتائية، بما في ذلك أساليب التوصيل وحجم الموصلات وطرق الفصل والتأريض.',
    category: 'Electrical Code'
  },
  {
    code: 'NFPA 70',
    title: 'National Electrical Code',
    titleAr: 'الكود الكهربائي الوطني',
    scope: 'Standard for safe electrical installation. Provides guidelines for electrical wiring and equipment installation in the United States, covering general provisions, wiring and protection, wiring methods, and special equipment including Article 690 for solar PV systems.',
    scopeAr: 'معيار التثبيت الكهربائي الآمن. يوفر إرشادات لتوصيل الأسلاك ومعدات التثبيت في الولايات المتحدة، بما في ذلك الأحكام العامة والحماية والتوصيل والمعدات الخاصة بما في ذلك القسم 690 لأنظمة الطاقة الشمسية.',
    category: 'Electrical Code'
  },
  {
    code: 'IEEE 1547',
    title: 'Standard for Interconnection and Interoperability of Distributed Energy Resources',
    titleAr: 'معيار الترابط والتوافق لمصادر الطاقة الموزعة',
    scope: 'Establishes technical specifications and design, operation, testing, safety, and maintenance requirements for interconnection and interoperability of distributed energy resources (DER) with the electric power system. Applicable to all DER technologies including solar PV.',
    scopeAr: 'يؤسس المواصفات الفنية والتصميم والتشغيل والاختبار والصيانة للترابط والتوافق لمصادر الطاقة الموزعة مع نظام الطاقة الكهربائية. ينطبق على جميع تقنيات الطاقة الموزعة بما في ذلك الطاقة الشمسية.',
    category: 'Grid Interconnection'
  },
  {
    code: 'IEEE 1584',
    title: 'Guide for Performing Arc-Flash Hazard Calculations',
    titleAr: 'دليل إجراء حسابات مخاطر الوميض القوسي',
    scope: 'Provides a systematic approach to perform arc-flash hazard calculations for low (120V-1000V AC) and medium (1kV-15kV AC) voltage systems. Essential for designing protection systems in solar PV installations.',
    scopeAr: 'يوفر منهجية منظمة لإجراء حسابات مخاطر الوميض القوسي للأنظمة منخفضة ومتوسطة الجهد. ضروري لتصميم أنظمة الحماية في تركيبات الطاقة الشمسية.',
    category: 'Safety Calculations'
  },
  {
    code: 'UL 1741',
    title: 'Standard for Inverters, Converters, Controllers, and Interconnection System Equipment for Use with Distributed Energy Resources',
    titleAr: 'معيار للinverters والمحولات والcontrol devices ومعدات أنظمة الربط مع مصادر الطاقة الموزعة',
    scope: 'Addresses requirements for inverters, converters, controllers, and interconnection system equipment intended for use in conjunction with distributed energy resources. Includes safety and performance requirements for grid-tied and off-grid applications.',
    scopeAr: 'يتناول متطلبات الinverters والمحولات والcontrol devices ومعدات أنظمة الربط المخصصة للاستخدام مع مصادر الطاقة الموزعة. يتضمن متطلبات الأمان والأداء للتطبيقات المرتبطة بالشبكة وغير المرتبطة.',
    category: 'Equipment Certification'
  },
  {
    code: 'UL 2703',
    title: 'Standard for Mounting Systems, Module-Level Electronics, and Racking Systems for Use with Photovoltaic Modules',
    titleAr: 'معيار لأنظمة التثبيت وال electronics على مستوى الوحدة وأنظمة التخزين للاستخدام مع لوحات الطاقة الشمسية',
    scope: 'Addresses mounting systems, module-level electronics, and racking systems used with photovoltaic modules. Covers mechanical integrity, electrical continuity, and bonding requirements for module mounting hardware.',
    scopeAr: 'يتناول أنظمة التثبيت وال electronics على مستوى الوحدة وأنظمة التخزين المستخدمة مع لوحات الطاقة الشمسية. يتضمن السلامة الميكانيكية والاستمرارية الكهربائية ومتطلبات التوصيل لمعدات تثبيت الوحدات.',
    category: 'Mounting Systems'
  },
  {
    code: 'ASHRAE 90.1',
    title: 'Energy Standard for Buildings Except Low-Rise Residential Buildings',
    titleAr: 'معيار الطاقة للمباني ما عدا المباني السكنية منخفضة الارتفاع',
    scope: 'Provides minimum requirements for energy-efficient design of buildings. Includes provisions for building envelope, lighting, and mechanical systems that affect solar PV system integration and building energy performance.',
    scopeAr: 'يوفر الحد الأدنى من المتطلبات لتصميم الموفر للطاقة في المباني. يتضمن أحكام الغلاف الإضاءة والأنظمة الميكانيكية التي تؤثر على تكامل أنظمة الطاقة الشمسية وأداء الطاقة في المباني.',
    category: 'Energy Efficiency'
  },
  {
    code: 'ASHRAE 93',
    title: 'Methods of Testing to Determine the Thermal Performance of Solar Collectors',
    titleAr: 'طرق الاختبار لتحديد الأداء الحراري لجمعيات الطاقة الشمسية',
    scope: 'Defines test methods for determining the thermal performance of solar collectors. Provides standardized procedures for rating solar collector performance under specified conditions.',
    scopeAr: 'يحدد طرق الاختبار لتحديد الأداء الحراري لجمعيات الطاقة الشمسية. يوفر إجراءات موحدة لتقييم أداء جامع الطاقة الشمسية في ظروف محددة.',
    category: 'Thermal Performance'
  },
  {
    code: 'IEC 62446',
    title: 'Grid-connected photovoltaic systems — Minimum requirements for system documentation, commissioning tests, and inspection',
    titleAr: 'أنظمة الطاقة الشمسية المتصلة بالشبكة — الحد الأدنى من متطلبات توثيق النظام واختبارات التسليم والفحص',
    scope: 'Provides minimum requirements for documentation, commissioning tests, and inspection of grid-connected photovoltaic systems. Defines required documentation and inspection procedures for system handover.',
    scopeAr: 'يوفر الحد الأدنى من متطلبات التوثيق واختبارات التسليم والفحص لأنظمة الطاقة الشمسية المتصلة بالشبكة. يحدد التوثيق المطلوب وإجراءات الفحص لتسليم النظام.',
    category: 'Commissioning'
  },
  {
    code: 'IEC 60529',
    title: 'Degrees of protection provided by enclosures (IP Code)',
    titleAr: 'درجات الحماية المقدمة من الحافظات (كود IP)',
    scope: 'Classifies the degrees of protection provided by enclosures of electrical equipment against the entry of solid objects, water, and mechanical impact. Essential for specifying outdoor PV system equipment protection ratings.',
    scopeAr: 'يصنف درجات الحماية المقدمة من حافظات المعدات الكهربائية ضد دخول الأجسام الصلبة والميكانيك. ضروري لتحديد تقييمات حماية معدات أنظمة الطاقة الشمسية الخارجية.',
    category: 'Equipment Protection'
  }
];

export function getStandardByCode(code: string): Standard | undefined {
  return standards.find(s => s.code === code);
}

export function getStandardsByCategory(category: string): Standard[] {
  return standards.filter(s => s.category === category);
}

export function searchStandards(query: string): Standard[] {
  const q = query.toLowerCase();
  return standards.filter(
    s =>
      s.code.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.titleAr.includes(query) ||
      s.category.toLowerCase().includes(q)
  );
}

export function getStandardCategories(): string[] {
  return [...new Set(standards.map(s => s.category))];
}
