'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LayoutGrid,
  BatteryFull,
  Plug,
  Cable,
  ShieldCheck,
  BarChart3,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  glow: string;
}

export default function FeaturesSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features: Feature[] = [
    {
      icon: LayoutGrid,
      title: t('home.features.automatedDesign.title'),
      description: t('home.features.automatedDesign.description'),
      gradient: 'from-amber-500/20 to-yellow-500/20',
      glow: 'group-hover:shadow-amber-500/10',
    },
    {
      icon: BatteryFull,
      title: t('home.features.batterySizing.title'),
      description: t('home.features.batterySizing.description'),
      gradient: 'from-emerald-500/20 to-teal-500/20',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    {
      icon: Plug,
      title: t('home.features.loadAnalysis.title'),
      description: t('home.features.loadAnalysis.description'),
      gradient: 'from-blue-500/20 to-cyan-500/20',
      glow: 'group-hover:shadow-blue-500/10',
    },
    {
      icon: Cable,
      title: t('home.features.cableSizing.title'),
      description: t('home.features.cableSizing.description'),
      gradient: 'from-violet-500/20 to-purple-500/20',
      glow: 'group-hover:shadow-violet-500/10',
    },
    {
      icon: ShieldCheck,
      title: t('home.features.protection.title'),
      description: t('home.features.protection.description'),
      gradient: 'from-red-500/20 to-orange-500/20',
      glow: 'group-hover:shadow-red-500/10',
    },
    {
      icon: BarChart3,
      title: t('home.features.financialAnalysis.title'),
      description: t('home.features.financialAnalysis.description'),
      gradient: 'from-pink-500/20 to-rose-500/20',
      glow: 'group-hover:shadow-pink-500/10',
    },
    {
      icon: FileSpreadsheet,
      title: t('home.features.bom.title'),
      description: t('home.features.bom.description'),
      gradient: 'from-cyan-500/20 to-sky-500/20',
      glow: 'group-hover:shadow-cyan-500/10',
    },
    {
      icon: FileText,
      title: t('home.features.reports.title'),
      description: t('home.features.reports.description'),
      gradient: 'from-indigo-500/20 to-blue-500/20',
      glow: 'group-hover:shadow-indigo-500/10',
    },
  ];

  return (
    <section className="relative py-24 bg-gray-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('home.features.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 cursor-pointer hover:scale-[1.03] hover:border-white/[0.12] hover:shadow-xl ${feature.glow} transition-all duration-300`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.06] mb-4 group-hover:bg-white/[0.1] transition-colors duration-300">
                    <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
