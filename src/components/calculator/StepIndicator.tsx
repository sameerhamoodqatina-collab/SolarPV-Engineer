'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  BarChart3,
  Sun,
  LayoutGrid,
  BatteryCharging,
  Plug,
  Cable,
  Shield,
  Package,
  FileText,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

const steps = [
  { key: 'steps.projectInfo', icon: ClipboardList },
  { key: 'steps.loadProfile', icon: BarChart3 },
  { key: 'steps.solarResource', icon: Sun },
  { key: 'steps.pvArray', icon: LayoutGrid },
  { key: 'steps.battery', icon: BatteryCharging },
  { key: 'steps.inverter', icon: Plug },
  { key: 'steps.cable', icon: Cable },
  { key: 'steps.protection', icon: Shield },
  { key: 'steps.bom', icon: Package },
  { key: 'steps.report', icon: FileText },
];

export default function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  const { t, isRTL } = useLanguage();

  const orderedSteps = useMemo(
    () => (isRTL ? [...steps].reverse() : steps),
    [isRTL],
  );

  const originalIndex = (displayIdx: number) =>
    isRTL ? steps.length - 1 - displayIdx : displayIdx;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full overflow-x-auto pb-2 scrollbar-hide"
    >
      <div className="flex items-center min-w-max gap-0 px-2 py-3">
        {orderedSteps.map((step, idx) => {
          const realIdx = originalIndex(idx);
          const isActive = realIdx === currentStep;
          const isCompleted =
            completedSteps.includes(realIdx) || realIdx < currentStep;
          const Icon = step.icon;
          const label = t(step.key);

          return (
            <div key={realIdx} className="flex items-center">
              <button
                type="button"
                onClick={() => onStepClick(realIdx)}
                className={`
                  group relative flex flex-col items-center gap-1.5 
                  transition-all duration-300 focus:outline-none
                  ${isRTL ? 'ml-1' : 'mr-1'}
                `}
              >
                <motion.div
                  layout
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 lg:w-12 lg:h-12 rounded-full
                    border-2 transition-all duration-300 cursor-pointer
                    ${
                      isActive
                        ? 'border-amber-400 bg-amber-400/15 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                        : isCompleted
                          ? 'border-emerald-400 bg-emerald-400/15'
                          : 'border-slate-600 bg-slate-800/60 group-hover:border-slate-400'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? 'text-amber-400'
                          : isCompleted
                            ? 'text-emerald-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                  )}

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-amber-400/40"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>

                <span
                  className={`
                    text-[10px] lg:text-xs font-medium leading-tight text-center
                    max-w-[72px] lg:max-w-[80px] truncate
                    ${
                      isActive
                        ? 'text-amber-400'
                        : isCompleted
                          ? 'text-emerald-400/80'
                          : 'text-slate-500 group-hover:text-slate-300'
                    }
                  `}
                >
                  {label}
                </span>
              </button>

              {idx < orderedSteps.length - 1 && (
                <div className="flex items-center mx-1 lg:mx-2">
                  <div
                    className={`
                      h-0.5 w-6 lg:w-10 rounded-full transition-colors duration-300
                      ${
                        realIdx < currentStep || completedSteps.includes(realIdx + 1)
                          ? 'bg-emerald-400/60'
                          : realIdx === currentStep
                            ? 'bg-amber-400/50'
                            : 'bg-slate-700'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
