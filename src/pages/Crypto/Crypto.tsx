import { useEffect, useState } from 'react';
import { Alert, Card, Typography } from 'antd';

import {
  deleteCryptoPosition,
  getUserCryptoPositions,
  normalizeApiError,
  updateCryptoPosition,
} from '@/api';
import { toCamelCase } from '@/helpers/toCamelCase';

import type { GetUserCryptoPositionsRes } from '@/types';
import { CryptoChart, CryptoTable } from '@/components';

const { Title, Text } = Typography;

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

  const handleUpdatePosition = async (
    positionId: string,
    amount: string,
    avgPriceUsdCents: number | null,
  ) => {
    await updateCryptoPosition(positionId, amount, avgPriceUsdCents);

    await getData();
  };

  const handleDeletePosition = async (positionId: string) => {
    await deleteCryptoPosition(positionId);
    await getData();
  };

  useEffect(() => {
    const loadData = async () => {
      await getData();
    };

    void loadData();
  }, []);

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

            <CryptoChart positions={cryptoPositions.positions} />

            <CryptoTable
              positions={cryptoPositions.positions}
              loading={loading}
              onUpdatePosition={handleUpdatePosition}
              onDeletePosition={handleDeletePosition}
            />
          </Card>
        </div>
      ) : (
        <div>loading...</div>
      )}
    </>
  );
};
