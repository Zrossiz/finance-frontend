import { useEffect, useState } from 'react';
import { Alert, Card, Spin, Table, Typography } from 'antd';

import { getUserCryptoPositions, normalizeApiError } from '@/api';
import { toCamelCase } from '@/helpers/toCamelCase';

import type { CryptoPosition, GetUserCryptoPositionsRes } from '@/types';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const { Title, Text } = Typography;

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

export const CryptoPage = () => {
  const [cryptoPositions, setCryptoPositions] = useState<GetUserCryptoPositionsRes | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getUserCryptoPositions();

      if (res.status === 200) {
        setCryptoPositions(toCamelCase(res.data));
        console.log(toCamelCase(res.data));
      }
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await getData();
    };

    void loadData();
  }, []);

  const chartData =
    cryptoPositions?.positions
      .map((position) => ({
        name: position.ticker.toUpperCase(),
        value: Number(position.totalPriceUsd),
      }))
      .filter((position) => position.value > 0) ?? [];

  const columns = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Position value',
      dataIndex: 'totalPriceUsd',
      key: 'totalPriceUsd',
      render: (value: string) =>
        `$${Number(value).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: 'Average price',
      dataIndex: 'avgPriceUsdCents',
      key: 'avgPriceUsdCents',
      render: (value: number | null) =>
        value !== null
          ? `$${(value / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : '-',
    },
    {
      title: 'Profit',
      dataIndex: 'profitUsd',
      key: 'profitUsd',
      render: (value: string) => {
        const profit = Number(value);

        return (
          <Text
            style={{
              color: profit > 0 ? '#52c41a' : profit < 0 ? '#ff4d4f' : undefined,
              fontWeight: 600,
            }}
          >
            $
            {profit.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
  ];

  return (
    <>
      {cryptoPositions != null ? (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 40,
            background: '#141414',
          }}
        >
          <Card style={{ width: 900 }}>
            <Title level={2}>Crypto portfolio</Title>

            <div
              style={{
                display: 'flex',
                gap: 24,
                marginTop: 8,
              }}
            >
              <Text type="secondary">
                Total portfolio value:{' '}
                <Text strong>
                  $
                  {Number(cryptoPositions?.total ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </Text>

              <Text type="secondary">
                Total profit:{' '}
                <Text
                  strong
                  style={{
                    color:
                      +cryptoPositions.totalProfit > 0
                        ? '#52c41a'
                        : +cryptoPositions.totalProfit < 0
                          ? '#ff4d4f'
                          : undefined,
                  }}
                >
                  {+cryptoPositions.totalProfit >= 0 ? '+' : '-'}$
                  {Math.abs(+cryptoPositions.totalProfit).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </Text>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                showIcon
                style={{ marginTop: 20, marginBottom: 20 }}
              />
            )}

            {chartData.length > 0 && (
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
            )}

            <Spin spinning={loading}>
              <Table<CryptoPosition>
                style={{ marginTop: 56 }}
                rowKey="id"
                dataSource={cryptoPositions?.positions ?? []}
                columns={columns}
                pagination={false}
              />
            </Spin>
          </Card>
        </div>
      ) : (
        <div>loading...</div>
      )}
    </>
  );
};
