import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardHeader } from '../ui/Card';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartCardProps {
  title: string;
  data: number[];
  colors: string[];
  legend?: React.ReactNode;
  height?: number;
}

export function DonutChartCard({
  title,
  data,
  colors,
  legend,
  height = 145,
}: DonutChartCardProps) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className="chart-wrap-sm" style={{ height }}>
        <Doughnut
          data={{
            labels: [],
            datasets: [{ data, backgroundColor: colors, borderWidth: 0 }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { legend: { display: false } },
          }}
        />
      </div>
      {legend}
    </Card>
  );
}
