'use client';

import { useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Lightbulb, Fan, Tv, Monitor, Droplets, Flame } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type { LoadItem, LoadProfile } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

interface LoadProfileStepProps {
  data: LoadProfile;
  onUpdate: (data: Partial<LoadProfile>) => void;
}

interface LoadTemplate {
  name: string;
  power: number;
  powerFactor: number;
  efficiency: number;
  startingCurrent: number;
  workingHours: number;
  startTime: number;
  endTime: number;
  scheduleType: LoadItem['scheduleType'];
  icon: React.ElementType;
}

const loadTemplates: LoadTemplate[] = [
  { name: 'Lighting', power: 100, powerFactor: 0.9, efficiency: 90, startingCurrent: 1, workingHours: 8, startTime: 18, endTime: 22, scheduleType: 'night', icon: Lightbulb },
  { name: 'Air Conditioner', power: 2000, powerFactor: 0.85, efficiency: 85, startingCurrent: 15, workingHours: 10, startTime: 10, endTime: 20, scheduleType: 'day', icon: Fan },
  { name: 'Refrigerator', power: 200, powerFactor: 0.6, efficiency: 75, startingCurrent: 8, workingHours: 24, startTime: 0, endTime: 23, scheduleType: 'always', icon: Droplets },
  { name: 'TV', power: 150, powerFactor: 0.95, efficiency: 88, startingCurrent: 1.5, workingHours: 6, startTime: 18, endTime: 23, scheduleType: 'night', icon: Tv },
  { name: 'Computer', power: 300, powerFactor: 0.9, efficiency: 85, startingCurrent: 3, workingHours: 8, startTime: 9, endTime: 17, scheduleType: 'day', icon: Monitor },
  { name: 'Pump', power: 1500, powerFactor: 0.8, efficiency: 70, startingCurrent: 20, workingHours: 4, startTime: 6, endTime: 10, scheduleType: 'day', icon: Droplets },
  { name: 'Water Heater', power: 3000, powerFactor: 1, efficiency: 95, startingCurrent: 15, workingHours: 3, startTime: 5, endTime: 8, scheduleType: 'day', icon: Flame },
  { name: 'Washing Machine', power: 2000, powerFactor: 0.85, efficiency: 80, startingCurrent: 12, workingHours: 2, startTime: 9, endTime: 11, scheduleType: 'day', icon: Droplets },
  { name: 'Oven', power: 2500, powerFactor: 1, efficiency: 85, startingCurrent: 12, workingHours: 1.5, startTime: 17, endTime: 19, scheduleType: 'night', icon: Flame },
];

let nextId = 1;
function uid(): string {
  return `load-${Date.now()}-${nextId++}`;
}

function templateToLoad(tpl: LoadTemplate): LoadItem {
  return {
    id: uid(),
    name: tpl.name,
    power: tpl.power,
    quantity: 1,
    powerFactor: tpl.powerFactor,
    efficiency: tpl.efficiency,
    startingCurrent: tpl.startingCurrent,
    workingHours: tpl.workingHours,
    startTime: tpl.startTime,
    endTime: tpl.endTime,
    scheduleType: tpl.scheduleType,
    loadType: 'critical',
    peakHours: false,
  };
}

function calcHourlyLoad(loads: LoadItem[]): number[] {
  const hourly = new Array(24).fill(0) as number[];
  for (const load of loads) {
    const activePower = (load.power * load.powerFactor * load.quantity) / 1000;
    for (let h = 0; h < 24; h++) {
      let active = false;
      if (load.scheduleType === 'always') active = true;
      else if (load.scheduleType === 'day') active = h >= 6 && h < 18;
      else active = h >= 18 || h < 6;

      if (active && h >= load.startTime && h <= load.endTime) {
        hourly[h] += activePower * (load.efficiency / 100);
      }
    }
  }
  return hourly;
}

function buildSummary(loads: LoadItem[]) {
  const hourly = calcHourlyLoad(loads);
  const totalConnected = loads.reduce(
    (s, l) => s + (l.power * l.quantity) / 1000,
    0,
  );
  const dailyEnergy = hourly.reduce((s, v) => s + v, 0);
  const dayEnergy = hourly.slice(6, 18).reduce((s, v) => s + v, 0);
  const nightEnergy =
    hourly.slice(0, 6).reduce((s, v) => s + v, 0) +
    hourly.slice(18, 24).reduce((s, v) => s + v, 0);
  const peak = Math.max(...hourly, 0);
  const avg = dailyEnergy / 24;

  return { hourly, totalConnected, dailyEnergy, dayEnergy, nightEnergy, peak, avg };
}

const tableInput =
  'w-full bg-transparent text-xs text-slate-200 text-center py-1.5 px-1 focus:outline-none focus:bg-slate-800/80 rounded';
const tableSelect =
  'w-full bg-transparent text-xs text-slate-200 text-center py-1.5 px-0 focus:outline-none appearance-none cursor-pointer';

export default function LoadProfileStep({ data, onUpdate }: LoadProfileStepProps) {
  const { t, isRTL } = useLanguage();

  const summary = useMemo(() => buildSummary(data.loads), [data.loads]);

  const updateLoad = useCallback(
    (id: string, field: keyof LoadItem, value: string | number | boolean) => {
      const loads = data.loads.map((l) =>
        l.id === id ? { ...l, [field]: value } : l,
      );
      const summ = buildSummary(loads);
      onUpdate({ loads, ...summ });
    },
    [data.loads, onUpdate],
  );

  const addTemplate = useCallback(
    (tpl: LoadTemplate) => {
      const loads = [...data.loads, templateToLoad(tpl)];
      const summ = buildSummary(loads);
      onUpdate({ loads, ...summ });
    },
    [data.loads, onUpdate],
  );

  const removeLoad = useCallback(
    (id: string) => {
      const loads = data.loads.filter((l) => l.id !== id);
      const summ = buildSummary(loads);
      onUpdate({ loads, ...summ });
    },
    [data.loads, onUpdate],
  );

  const chartData = useMemo(
    () => ({
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: t('charts.yAxis.power'),
          data: summary.hourly,
          backgroundColor: summary.hourly.map((v) =>
            v >= summary.avg
              ? 'rgba(251,191,36,0.55)'
              : 'rgba(56,189,248,0.45)',
          ),
          borderColor: summary.hourly.map((v) =>
            v >= summary.avg ? 'rgba(251,191,36,0.9)' : 'rgba(56,189,248,0.8)',
          ),
          borderWidth: 1,
          borderRadius: 3,
        },
      ],
    }),
    [summary, t],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { parsed: { y: number | null } }) =>
              `${(ctx.parsed.y ?? 0).toFixed(2)} kW`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(100,116,139,0.15)' },
          ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
        },
        y: {
          grid: { color: 'rgba(100,116,139,0.15)' },
          ticks: { color: '#94a3b8', font: { size: 10 } },
          title: { display: true, text: 'kW', color: '#94a3b8' },
        },
      },
    }),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-100">
          {t('load.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{t('load.subtitle')}</p>
      </div>

      {/* Template Chips */}
      <div className="flex flex-wrap gap-2">
        {loadTemplates.map((tpl) => {
          const TplIcon = tpl.icon;
          return (
            <motion.button
              key={tpl.name}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => addTemplate(tpl)}
              className="flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-400/50 hover:text-amber-400 transition-all"
            >
              <Plus className="w-3 h-3" />
              <TplIcon className="w-3 h-3" />
              <span>{tpl.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Loads Table */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2.5 font-medium min-w-[120px]">{t('load.loadName')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[70px]">{t('load.power')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[60px]">{t('load.quantity')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[70px]">{t('load.powerFactor')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[70px]">{t('load.efficiency')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[80px]">{t('load.workingHours')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[80px]">{t('load.scheduleType')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[70px]">{t('load.loadType')}</th>
                <th className="px-2 py-2.5 font-medium text-center min-w-[60px]">{t('load.peakHours')}</th>
                <th className="px-2 py-2.5 font-medium text-center w-10"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {data.loads.map((load) => (
                  <motion.tr
                    key={load.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={load.name}
                        onChange={(e) => updateLoad(load.id, 'name', e.target.value)}
                        className={tableInput + ' text-left'}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={load.power}
                        min={0}
                        onChange={(e) => updateLoad(load.id, 'power', Number(e.target.value))}
                        className={tableInput}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={load.quantity}
                        min={1}
                        onChange={(e) => updateLoad(load.id, 'quantity', Math.max(1, Number(e.target.value)))}
                        className={tableInput}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={load.powerFactor}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={(e) => updateLoad(load.id, 'powerFactor', Number(e.target.value))}
                        className={tableInput}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={load.efficiency}
                        min={0}
                        max={100}
                        onChange={(e) => updateLoad(load.id, 'efficiency', Number(e.target.value))}
                        className={tableInput}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={load.workingHours}
                        min={0}
                        max={24}
                        step={0.5}
                        onChange={(e) => updateLoad(load.id, 'workingHours', Number(e.target.value))}
                        className={tableInput}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={load.scheduleType}
                        onChange={(e) => updateLoad(load.id, 'scheduleType', e.target.value)}
                        className={tableSelect}
                      >
                        <option value="day">{t('load.dayOnly')}</option>
                        <option value="night">{t('load.nightOnly')}</option>
                        <option value="always">{t('load.alwaysOn')}</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={load.loadType}
                        onChange={(e) => updateLoad(load.id, 'loadType', e.target.value)}
                        className={tableSelect}
                      >
                        <option value="critical">{t('load.critical')}</option>
                        <option value="optional">{t('load.optional')}</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={load.peakHours}
                        onChange={(e) => updateLoad(load.id, 'peakHours', e.target.checked)}
                        className="accent-amber-400 w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLoad(load.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {data.loads.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            {t('load.noLoads')}
          </div>
        )}
      </div>

      {/* Summary + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Summary Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            {t('load.loadSummary')}
          </h3>
          {[
            { label: t('load.totalPower'), value: `${summary.totalConnected.toFixed(2)} kW`, color: 'text-sky-400' },
            { label: t('load.dailyEnergy'), value: `${summary.dailyEnergy.toFixed(2)} kWh`, color: 'text-amber-400' },
            { label: t('load.peakDemand'), value: `${summary.peak.toFixed(2)} kW`, color: 'text-red-400' },
            { label: t('load.averageDemand'), value: `${summary.avg.toFixed(2)} kW`, color: 'text-emerald-400' },
            { label: t('load.dayEnergy'), value: `${summary.dayEnergy.toFixed(2)} kWh`, color: 'text-orange-400' },
            { label: t('load.nightEnergy'), value: `${summary.nightEnergy.toFixed(2)} kWh`, color: 'text-indigo-400' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-800/40 px-4 py-2.5"
            >
              <span className="text-xs text-slate-400">{item.label}</span>
              <span className={`text-sm font-bold ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            {t('load.hourlyProfile')}
          </h3>
          <div className="h-56 lg:h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
