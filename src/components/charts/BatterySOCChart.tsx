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

interface BatterySOCChartProps {
  socData: number[];
}

export default function BatterySOCChart({ socData }: BatterySOCChartProps) {
  const { t } = useLanguage();

  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const backgroundColors = socData.map((val) => {
    if (val <= 20) return 'rgba(239, 68, 68, 0.0)';
    if (val <= 50) return 'rgba(249, 115, 22, 0.0)';
    return 'rgba(34, 197, 94, 0.0)';
  });

  const segmentColors = socData.map((val) => {
    if (val <= 20) return 'rgba(239, 68, 68, 1)';
    if (val <= 50) return 'rgba(249, 115, 22, 1)';
    return 'rgba(34, 197, 94, 1)';
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: t('charts.legend.soc'),
        data: socData,
        borderColor: segmentColors,
        segment: {
          borderColor: (ctx: { p0: { parsed: { y: number | null } }; p1: { parsed: { y: number | null } } }) => {
            const y0 = ctx.p0.parsed.y ?? 50;
            const y1 = ctx.p1.parsed.y ?? 50;
            const avg = (y0 + y1) / 2;
            if (avg <= 20) return 'rgba(239, 68, 68, 1)';
            if (avg <= 50) return 'rgba(249, 115, 22, 1)';
            return 'rgba(34, 197, 94, 1)';
          },
        },
        backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(34, 197, 94, 0.1)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.25)');
          gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.15)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: segmentColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
      {
        label: '80% SOC (Upper Limit)',
        data: new Array(24).fill(80),
        borderColor: 'rgba(34, 197, 94, 0.4)',
        borderWidth: 1.5,
        borderDash: [8, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
      {
        label: '20% SOC (Lower Limit)',
        data: new Array(24).fill(20),
        borderColor: 'rgba(239, 68, 68, 0.4)',
        borderWidth: 1.5,
        borderDash: [8, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
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
          filter: (item: { text: string }) => !item.text.includes('Limit'),
        },
      },
      title: {
        display: true,
        text: t('charts.batterySoc'),
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
        filter: (item: { dataset: { label?: string } }) => !item.dataset.label?.includes('Limit'),
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `${t('charts.yAxis.percentage')}: ${(ctx.parsed.y ?? 0).toFixed(1)}%`,
        },
      },
      annotation: undefined,
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
          text: t('charts.yAxis.percentage'),
          color: 'var(--text-secondary)',
          font: { size: 12 },
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 10 },
          callback: (value: string | number) => `${value}%`,
        },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        min: 0,
        max: 100,
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
