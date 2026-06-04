import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CHART_DATA, CHART_LABELS } from '../../data/chart';
import { Card, CardHeader } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface LineChartCardProps {
  title: string;
  color?: string;
  height?: number;
  action?: React.ReactNode;
}

export function LineChartCard({
  title,
  color = 'rgb(26,45,124)',
  height = 190,
  action,
}: LineChartCardProps) {
  const fill = color.replace('rgb', 'rgba').replace(')', ',0.07)');

  return (
    <Card>
      <CardHeader title={title} action={action} />
      <div className="chart-wrap" style={{ height }}>
        <Line
          data={{
            labels: CHART_LABELS,
            datasets: [
              {
                data: CHART_DATA,
                borderColor: color,
                backgroundColor: fill,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#8A92B0', font: { size: 10 }, maxTicksLimit: 7 },
              },
              y: {
                grid: { color: 'rgba(0,0,0,.04)' },
                ticks: { color: '#8A92B0', font: { size: 10 } },
              },
            },
          }}
        />
      </div>
    </Card>
  );
}
