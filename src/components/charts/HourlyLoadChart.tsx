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

interface HourlyLoadChartProps {
  data: number[];
}

export default function HourlyLoadChart({ data }: HourlyLoadChartProps) {
  const { t } = useLanguage();

  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const maxVal = Math.max(...data, 1);

  const backgroundColors = data.map((val) => {
    const ratio = val / maxVal;
    if (ratio < 0.33) return 'rgba(14, 165, 233, 0.8)';
    if (ratio < 0.66) return 'rgba(249, 115, 22, 0.7)';
    return 'rgba(239, 68, 68, 0.8)';
  });

  const borderColors = data.map((val) => {
    const ratio = val / maxVal;
    if (ratio < 0.33) return 'rgba(14, 165, 233, 1)';
    if (ratio < 0.66) return 'rgba(249, 115, 22, 1)';
    return 'rgba(239, 68, 68, 1)';
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: t('charts.hourlyLoad'),
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
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
        text: t('charts.hourlyLoad'),
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
          label: (ctx: { parsed: { y: number | null } }) => `${t('charts.yAxis.power')}: ${(ctx.parsed.y ?? 0).toFixed(2)} kW`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t('charts.xAxis.hours'),
          color: 'var(--text-secondary)',
          font: { size: 12 },
        },
        ticks: {
          color: 'var(--text-secondary)',
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
          font: { size: 10 },
        },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      y: {
        title: {
          display: true,
          text: t('charts.yAxis.power'),
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
