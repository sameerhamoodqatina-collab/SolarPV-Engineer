'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Layers,
  Zap,
  Leaf,
  Shield,
  Globe,
  Database,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold tabular-nums">
      {formatNumber(count)}
      {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
    </span>
  );
}

export default function StatsSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const stats: StatItem[] = [
    {
      icon: Layers,
      value: 2400,
      suffix: '+',
      label: t('home.stats.systemsDesigned'),
      color: 'text-amber-400',
    },
    {
      icon: Zap,
      value: 180,
      suffix: 'MWh',
      label: t('home.stats.totalCapacity'),
      color: 'text-yellow-400',
    },
    {
      icon: Globe,
      value: 47,
      suffix: '+',
      label: t('home.stats.countriesServed'),
      color: 'text-emerald-400',
    },
    {
      icon: Leaf,
      value: 95,
      suffix: 'K',
      label: t('home.stats.energyGenerated'),
      color: 'text-teal-400',
    },
    {
      icon: Shield,
      value: 12,
      suffix: '',
      label: 'Standards Compliant',
      color: 'text-blue-400',
    },
    {
      icon: Database,
      value: 5000,
      suffix: '+',
      label: 'Components in Database',
      color: 'text-violet-400',
    },
  ];

  return (
    <section className="relative py-24 bg-gray-950/50">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group"
              >
                <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 text-center hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] mb-4 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`mb-2 ${stat.color}`}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
