'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';

interface Standard {
  code: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
}

export default function StandardsSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const standards: Standard[] = [
    {
      code: 'IEC 60364',
      title: 'Low-Voltage Electrical Installations',
      description: t('home.standards.iec'),
      color: 'text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/40',
    },
    {
      code: 'IEC 62548',
      title: 'PV Array Design Requirements',
      description: t('home.standards.iec'),
      color: 'text-yellow-400',
      borderColor: 'border-yellow-500/20 hover:border-yellow-500/40',
    },
    {
      code: 'NEC 2023',
      title: 'National Electrical Code',
      description: t('home.standards.nec'),
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    },
    {
      code: 'IEEE 1547',
      title: 'Grid Interconnection Standard',
      description: t('home.standards.ieee'),
      color: 'text-blue-400',
      borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    },
    {
      code: 'UL 1741',
      title: 'Inverter Safety Certification',
      description: t('home.standards.ul'),
      color: 'text-violet-400',
      borderColor: 'border-violet-500/20 hover:border-violet-500/40',
    },
    {
      code: 'NFPA 70',
      title: 'National Electrical Code (NFPA)',
      description: t('home.standards.nfpa'),
      color: 'text-rose-400',
      borderColor: 'border-rose-500/20 hover:border-rose-500/40',
    },
  ];

  return (
    <section className="relative py-24 bg-gray-950/80">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('home.standards.title')}
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('home.standards.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {standards.map((standard, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative rounded-2xl border ${standard.borderColor} bg-white/[0.02] backdrop-blur-sm p-6 hover:bg-white/[0.04] transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl border ${standard.borderColor} bg-white/[0.03] flex items-center justify-center font-bold text-xs leading-tight text-center ${standard.color} px-1`}>
                  {standard.code}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white mb-1 group-hover:text-amber-300 transition-colors duration-300">
                    {standard.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {standard.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
