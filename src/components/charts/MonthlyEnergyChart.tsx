'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useLanguage } from '@/lib/i18n/context';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface MonthlyEnergyChartProps {
  production: number[];
  consumption: number[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyEnergyChart({ production, consumption }: MonthlyEnergyChartProps) {
  const { t } = useLanguage();

  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        label: t('charts.legend.solar'),
        data: production,
        backgroundColor: 'rgba(249, 115, 22, 0.75)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: t('charts.legend.load'),
        data: consumption,
        backgroundColor: 'rgba(14, 165, 233, 0.65)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'var(--text-primary)',
          font: { size: 12, weight: 500 as const },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      title: {
        display: true,
        text: t('charts.productionVsConsumption'),
        color: 'var(--text-primary)',
        font: { size: 14, weight: 600 as const },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(14, 165, 233, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const label = ctx.dataset.label ?? '';
            return `${label}: ${(ctx.parsed.y ?? 0).toFixed(0)} kWh`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t('charts.xAxis.months'),
          color: 'var(--text-secondary)',
          font: { size: 12 },
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 11 },
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: t('charts.yAxis.energy'),
          color: 'var(--text-secondary)',
          font: { size: 12 },
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 10 },
        },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="relative h-[350px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
