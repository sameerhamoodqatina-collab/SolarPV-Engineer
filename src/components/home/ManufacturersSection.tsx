'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';

const manufacturers = [
  { name: 'Huawei', category: 'Inverters' },
  { name: 'Sungrow', category: 'Inverters' },
  { name: 'SMA', category: 'Inverters' },
  { name: 'Deye', category: 'Inverters' },
  { name: 'Victron', category: 'Inverters' },
  { name: 'Growatt', category: 'Inverters' },
  { name: 'GoodWe', category: 'Inverters' },
  { name: 'Fronius', category: 'Inverters' },
  { name: 'Jinko', category: 'Solar Panels' },
  { name: 'LONGi', category: 'Solar Panels' },
  { name: 'Trina', category: 'Solar Panels' },
  { name: 'Canadian Solar', category: 'Solar Panels' },
  { name: 'JA Solar', category: 'Solar Panels' },
  { name: 'Pylontech', category: 'Batteries' },
  { name: 'BYD', category: 'Batteries' },
  { name: 'CATL', category: 'Batteries' },
];

export default function ManufacturersSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const duplicated = [...manufacturers, ...manufacturers];

  return (
    <section className="relative py-24 bg-gray-950 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('home.manufacturers.title')}
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('home.manufacturers.subtitle')}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative"
      >
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10" />

        <div className="flex animate-marquee">
          {duplicated.map((mfr, i) => (
            <div
              key={`${mfr.name}-${i}`}
              className="flex-shrink-0 mx-3"
            >
              <div className="group w-48 h-28 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col items-center justify-center gap-2 hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer">
                <div className="text-base font-bold text-gray-300 group-hover:text-white transition-colors duration-300 tracking-wide">
                  {mfr.name}
                </div>
                <div className="text-[11px] text-gray-600 group-hover:text-gray-400 transition-colors duration-300">
                  {mfr.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Inverter Brands', count: '8+', color: 'text-amber-400' },
            { label: 'Panel Brands', count: '6+', color: 'text-emerald-400' },
            { label: 'Battery Brands', count: '4+', color: 'text-blue-400' },
            { label: 'Total Components', count: '5000+', color: 'text-violet-400' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="text-center p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
            >
              <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.count}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
