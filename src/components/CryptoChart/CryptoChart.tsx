import type { CryptoPosition } from '@/types';
import { Typography } from 'antd';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const { Title } = Typography;

type CryptoChartProps = {
  positions: CryptoPosition[];
};

const CHART_COLORS = [
  '#5B8FF9',
  '#61DDAA',
  '#F6BD16',
  '#E8684A',
  '#9270CA',
  '#6DC8EC',
  '#FF99C3',
  '#8DDE6A',
];

export const CryptoChart = ({ positions }: CryptoChartProps) => {
  const chartData =
    positions
      .map((position) => ({
        name: position.ticker.toUpperCase(),
        value: Number(position.totalPriceUsd),
      }))
      .filter((position) => position.value > 0) ?? [];

  return (
    <div
      style={{
        width: '100%',
        height: 360,
        marginTop: 32,
      }}
    >
      <Title level={4}>Portfolio allocation</Title>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
          >
            {chartData.map((item, index) => (
              <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [
              `$${Number(value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              'Position value',
            ]}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
