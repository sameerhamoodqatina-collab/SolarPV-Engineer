'use client';

import { useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Sun, Mountain, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { countries, getCitiesByCountry, getCityData, type CountryData } from '@/lib/data/countries';
import type { SolarResource, LossBreakdown } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ChartTooltip, Legend, Filler);

interface SolarResourceStepProps {
  data: SolarResource;
  onUpdate: (data: Partial<SolarResource>) => void;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const lossFields: { key: keyof LossBreakdown; max: number }[] = [
  { key: 'shading', max: 20 },
  { key: 'dust', max: 15 },
  { key: 'cableLoss', max: 5 },
  { key: 'mismatchLoss', max: 5 },
  { key: 'soiling', max: 10 },
  { key: 'temperatureLoss', max: 20 },
  { key: 'systemLoss', max: 5 },
];

const inputClass = `
  w-full rounded-xl border border-slate-700/60 bg-slate-900/60 
  px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500
  backdrop-blur-sm transition-all duration-200
  focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:outline-none
  hover:border-slate-500
`;
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase';
const tableInput =
  'w-full bg-transparent text-xs text-slate-200 text-center py-1.5 px-1 focus:outline-none focus:bg-slate-800/80 rounded';

export default function SolarResourceStep({ data, onUpdate }: SolarResourceStepProps) {
  const { t, isRTL } = useLanguage();

  const cityList = useMemo(
    () => (data.country ? getCitiesByCountry(data.country) : []),
    [data.country],
  );

  const handleCountryChange = useCallback(
    (code: string) => {
      const city = getCitiesByCountry(code)[0];
      if (city) {
        onUpdate({
          country: code,
          city: city.name,
          peakSunHours: city.peakSunHours,
          averageIrradiance: city.averageIrradiance,
          monthlyIrradiance: [...city.monthlyIrradiance],
          ambientTemperature: [...city.ambientTemperature],
        });
      } else {
        onUpdate({ country: code, city: '' });
      }
    },
    [onUpdate],
  );

  const handleCityChange = useCallback(
    (cityName: string) => {
      const cityData = getCityData(data.country, cityName);
      if (cityData) {
        onUpdate({
          city: cityName,
          peakSunHours: cityData.peakSunHours,
          averageIrradiance: cityData.averageIrradiance,
          monthlyIrradiance: [...cityData.monthlyIrradiance],
          ambientTemperature: [...cityData.ambientTemperature],
        });
      } else {
        onUpdate({ city: cityName });
      }
    },
    [data.country, onUpdate],
  );

  const totalLoss = useMemo(
    () =>
      lossFields.reduce(
        (sum, { key }) => sum + (data.losses?.[key] ?? 0),
        0,
      ),
    [data.losses],
  );
  const netEfficiency = useMemo(
    () => Math.max(0, 100 - totalLoss),
    [totalLoss],
  );

  const updateLoss = useCallback(
    (key: keyof LossBreakdown, value: number) => {
      onUpdate({
        losses: { ...data.losses, [key]: Math.min(Math.max(value, 0), 100) },
      });
    },
    [data.losses, onUpdate],
  );

  const updateMonthly = useCallback(
    (field: 'monthlyIrradiance' | 'ambientTemperature', idx: number, value: number) => {
      const arr = [...data[field]];
      arr[idx] = value;
      onUpdate({ [field]: arr });
    },
    [data, onUpdate],
  );

  /* ─── Charts ──────────────────────────────────────── */
  const irrChartData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label: t('solar.monthlyIrradiance'),
          data: data.monthlyIrradiance,
          backgroundColor: 'rgba(251,191,36,0.45)',
          borderColor: 'rgba(251,191,36,0.9)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }),
    [data.monthlyIrradiance, t],
  );

  const tempChartData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label: t('solar.ambientTemperature'),
          data: data.ambientTemperature,
          borderColor: 'rgba(248,113,113,0.9)',
          backgroundColor: 'rgba(248,113,113,0.12)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(248,113,113,1)',
        },
      ],
    }),
    [data.ambientTemperature, t],
  );

  const chartOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: 'rgba(100,116,139,0.15)' },
          ticks: { color: '#94a3b8', font: { size: 10 } },
        },
        y: {
          grid: { color: 'rgba(100,116,139,0.15)' },
          ticks: { color: '#94a3b8', font: { size: 10 } },
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
          {t('solar.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{t('solar.subtitle')}</p>
      </div>

      {/* Location Selector */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {t('project.location')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('project.country')}</label>
            <select
              value={data.country}
              className={inputClass}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              <option value="">{t('project.countryPlaceholder')}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {isRTL ? c.nameAr : c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('project.city')}</label>
            <select
              value={data.city}
              className={inputClass}
              disabled={!data.country}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="">{t('project.cityPlaceholder')}</option>
              {cityList.map((c) => (
                <option key={c.name} value={c.name}>
                  {isRTL ? c.nameAr : c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Solar Parameters */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Solar Parameters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>{t('solar.peakSunHours')}</label>
            <input
              type="number"
              step={0.1}
              value={data.peakSunHours}
              className={inputClass}
              onChange={(e) => onUpdate({ peakSunHours: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass}>{t('solar.averageIrradiance')}</label>
            <input
              type="number"
              step={0.1}
              value={data.averageIrradiance}
              className={inputClass}
              onChange={(e) => onUpdate({ averageIrradiance: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass}>{t('solar.panelTemperature')}</label>
            <input
              type="number"
              value={data.panelTemperature}
              className={inputClass}
              onChange={(e) => onUpdate({ panelTemperature: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass}>{t('solar.altitude')} (m)</label>
            <input
              type="number"
              value={data.altitude}
              className={inputClass}
              onChange={(e) => onUpdate({ altitude: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Monthly Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Irradiance Table */}
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-4 overflow-x-auto">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('solar.monthlyIrradiance')} (kWh/m²/day)
          </h4>
          <div className="grid grid-cols-6 gap-2">
            {months.map((m, i) => (
              <div key={m} className="text-center">
                <span className="text-[10px] text-slate-500 block mb-1">{m}</span>
                <input
                  type="number"
                  step={0.1}
                  value={data.monthlyIrradiance[i] ?? 0}
                  className={tableInput + ' border border-slate-700/40'}
                  onChange={(e) =>
                    updateMonthly('monthlyIrradiance', i, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Temperature Table */}
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-4 overflow-x-auto">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('solar.ambientTemperature')} (°C)
          </h4>
          <div className="grid grid-cols-6 gap-2">
            {months.map((m, i) => (
              <div key={m} className="text-center">
                <span className="text-[10px] text-slate-500 block mb-1">{m}</span>
                <input
                  type="number"
                  step={0.5}
                  value={data.ambientTemperature[i] ?? 0}
                  className={tableInput + ' border border-slate-700/40'}
                  onChange={(e) =>
                    updateMonthly('ambientTemperature', i, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('solar.monthlyIrradiance')}
          </h4>
          <div className="h-48">
            <Bar data={irrChartData} options={chartOpts} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('solar.ambientTemperature')}
          </h4>
          <div className="h-48">
            <Line data={tempChartData} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* Losses */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Mountain className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {t('solar.losses')}
          </span>
        </div>

        <div className="space-y-4">
          {lossFields.map(({ key, max }) => {
            const val = data.losses?.[key] ?? 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">
                    {t(`solar.${key === 'cableLoss' ? 'cableLoss' : key === 'mismatchLoss' ? 'mismatchLoss' : key}`)}
                  </label>
                  <span className="text-xs font-mono text-amber-400">
                    {val.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={max}
                    step={0.5}
                    value={val}
                    className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-400
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 
                      [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                    onChange={(e) => updateLoss(key, Number(e.target.value))}
                  />
                  <input
                    type="number"
                    min={0}
                    max={max}
                    step={0.5}
                    value={val}
                    className="w-16 bg-transparent text-xs text-slate-200 text-right border border-slate-700/40 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400/60"
                    onChange={(e) => updateLoss(key, Number(e.target.value))}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Loss & Efficiency */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
          <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-red-400/80 mb-1">
              {t('solar.totalLosses')}
            </span>
            <span className="text-lg font-bold text-red-400">
              {totalLoss.toFixed(1)}%
            </span>
          </div>
          <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 text-center">
            <span className="block text-[10px] uppercase tracking-wider text-emerald-400/80 mb-1">
              {t('solar.netEfficiency')}
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {netEfficiency.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
