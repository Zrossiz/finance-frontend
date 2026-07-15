import { useEffect, useState } from 'react';
import { Alert, Button, Card, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import {
  createCryptoPosition,
  deleteCryptoPosition,
  getUserCryptoPositions,
  normalizeApiError,
  updateCryptoPosition,
} from '@/api';
import { CreateCryptoPositionForm, CryptoChart, CryptoTable } from '@/components';
import { toCamelCase } from '@/helpers/toCamelCase';

import type { GetUserCryptoPositionsRes } from '@/types';

const { Title, Text } = Typography;

export const CryptoPage = () => {
  const [cryptoPositions, setCryptoPositions] = useState<GetUserCryptoPositionsRes | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getUserCryptoPositions();

      if (res.status === 200) {
        setCryptoPositions(toCamelCase(res.data));
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

  const handleCreatePosition = async (
    ticker: string,
    amount: string,
    avgPriceUsdCents?: number,
  ) => {
    await createCryptoPosition(ticker, amount, avgPriceUsdCents);

    await getData();

    setIsCreateModalOpen(false);
  };

  useEffect(() => {
    void getData();
  }, []);

  if (cryptoPositions === null) {
    return <div>Loading...</div>;
  }

  const totalProfit = Number(cryptoPositions.totalProfit);

  return (
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Crypto portfolio
          </Title>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Add position
          </Button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 16,
          }}
        >
          <Text type="secondary">
            Total portfolio value:{' '}
            <Text strong>
              $
              {Number(cryptoPositions.total).toLocaleString(undefined, {
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
                color: totalProfit > 0 ? '#52c41a' : totalProfit < 0 ? '#ff4d4f' : undefined,
              }}
            >
              {totalProfit >= 0 ? '+' : '-'}$
              {Math.abs(totalProfit).toLocaleString(undefined, {
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
            style={{
              marginTop: 20,
              marginBottom: 20,
            }}
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

      <Modal
        title="Add crypto position"
        open={isCreateModalOpen}
        footer={null}
        destroyOnHidden
        onCancel={() => setIsCreateModalOpen(false)}
      >
        <CreateCryptoPositionForm onCreatePosition={handleCreatePosition} />
      </Modal>
    </div>
  );
};
