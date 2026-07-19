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
import { Line } from 'react-chartjs-2';
import { useLanguage } from '@/lib/i18n/context';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface SolarProductionChartProps {
  solarData: number[];
  loadData: number[];
}

export default function SolarProductionChart({ solarData, loadData }: SolarProductionChartProps) {
  const { t } = useLanguage();

  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const chartData = {
    labels,
    datasets: [
      {
        label: t('charts.legend.solar'),
        data: solarData,
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
      {
        label: t('charts.legend.load'),
        data: loadData,
        borderColor: 'rgba(14, 165, 233, 1)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(14, 165, 233, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
        borderDash: [6, 3],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
        text: t('charts.hourlySolar'),
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
            return `${label}: ${(ctx.parsed.y ?? 0).toFixed(2)} kW`;
          },
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
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
