'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

function generateParticles() {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));
}

const panelRows = [0, 1, 2];
const panelCols = [0, 1, 2, 3];

export default function HeroSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);

  useEffect(() => {
    setParticles(generateParticles());
  }, []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headingWords = t('home.hero.title').split(' ');

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
    >
      <motion.div
        style={{ y: bgY, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
      </motion.div>

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4" />
              Professional Engineering Tool
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              {headingWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.15 * i }}
                  className={
                    word.toLowerCase() === 'solar' ||
                    word.toLowerCase() === 'pv'
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent'
                      : 'text-white'
                  }
                >
                  {word}{' '}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg sm:text-xl text-gray-400 max-w-xl mb-4 leading-relaxed"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="text-base text-gray-500 max-w-xl mb-10 leading-relaxed"
            >
              {t('home.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/calculator"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-semibold text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                {t('home.hero.cta')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-gray-300 font-medium text-base hover:bg-white/5 hover:border-gray-600 transition-all duration-300"
              >
                {t('home.hero.secondaryCta')}
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative w-[420px] h-[320px]">
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 420 320" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a5f" />
                      <stop offset="50%" stopColor="#0f2744" />
                      <stop offset="100%" stopColor="#1a2d47" />
                    </linearGradient>
                    <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g transform="translate(30, 40) skewY(-2)">
                    {panelRows.map((row) =>
                      panelCols.map((col) => (
                        <g key={`${row}-${col}`}>
                          <rect
                            x={col * 90}
                            y={row * 80}
                            width={82}
                            height={72}
                            rx={2}
                            fill="url(#panelGrad)"
                            stroke="#334155"
                            strokeWidth={1}
                          />
                          {[0, 1, 2, 3].map((cr) =>
                            [0, 1, 2].map((cc) => (
                              <rect
                                key={`${cr}-${cc}`}
                                x={col * 90 + 6 + cr * 19}
                                y={row * 80 + 6 + cc * 22}
                                width={16}
                                height={19}
                                rx={1}
                                fill="url(#cellGrad)"
                                stroke="#3b82f6"
                                strokeWidth={0.3}
                                strokeOpacity={0.4}
                              />
                            ))
                          )}
                        </g>
                      ))
                    )}
                  </g>

                  <line
                    x1="30"
                    y1="290"
                    x2="390"
                    y2="290"
                    stroke="#475569"
                    strokeWidth={3}
                  />
                  <line x1="210" y1="282" x2="210" y2="295" stroke="#475569" strokeWidth={2} />

                  <circle cx="60" cy="28" r="12" fill="#fbbf24" opacity="0.9" filter="url(#glow)" />
                  <circle cx="60" cy="28" r="18" fill="#fbbf24" opacity="0.1" />
                </svg>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6 px-5 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="text-amber-400 text-2xl font-bold">98.5%</div>
                <div className="text-gray-400 text-xs">System Efficiency</div>
              </motion.div>

              <motion.div
                className="absolute -top-4 -left-4 px-5 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="text-emerald-400 text-2xl font-bold">12.4 kW</div>
                <div className="text-gray-400 text-xs">System Capacity</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [1, 0], y: [0, 12] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
