import { useEffect, useState } from 'react';
import { Alert, Button, Card, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import {
  createRealEstate,
  deleteRealEstate,
  getUserRealEstates,
  normalizeApiError,
  updateRealEstate,
} from '@/api';

import { CreateRealEstateForm, RealEstateTable } from '@/components';

import { toCamelCase } from '@/helpers/toCamelCase';

import type { CreateRealEstate, RealEstate, UpdateRealEstate } from '@/types';

const { Title, Text } = Typography;

export const RealEstatePage = () => {
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getData = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getUserRealEstates();

      if (res.status === 200) {
        setRealEstates(toCamelCase(res.data));
      }
    } catch (err) {
      const apiError = normalizeApiError(err);

      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRealEstate = async (body: CreateRealEstate) => {
    await createRealEstate(body);

    await getData();

    setIsCreateModalOpen(false);
  };

  const handleUpdateRealEstate = async (id: string, body: UpdateRealEstate) => {
    await updateRealEstate(id, body);

    await getData();
  };

  const handleDeleteRealEstate = async (id: string) => {
    await deleteRealEstate(id);

    await getData();
  };

  useEffect(() => {
    void getData();
  }, []);

  let totalPurchasePriceCents = 0;
  let totalMonthlyIncomeCents = 0;
  let totalYearlyIncomeCents = 0;

  if (realEstates && realEstates.length > 0) {
    totalPurchasePriceCents = realEstates.reduce(
      (sum, realEstate) => sum + (realEstate.purchasePriceCents ?? 0),
      0,
    );

    totalMonthlyIncomeCents = realEstates.reduce(
      (sum, realEstate) => sum + (realEstate.monthlyIncomeCents ?? 0),
      0,
    );

    totalYearlyIncomeCents = totalMonthlyIncomeCents * 12;
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 40,
        background: '#141414',
      }}
    >
      <Card style={{ width: 1100 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Real estate
          </Title>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Add property
          </Button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          <Text type="secondary">
            Total purchase value: <Text strong>{formatMoney(totalPurchasePriceCents, 'RUB')}</Text>
          </Text>

          <Text type="secondary">
            Monthly passive income:{' '}
            <Text
              strong
              style={{
                color: totalMonthlyIncomeCents > 0 ? '#52c41a' : undefined,
              }}
            >
              {formatMoney(totalMonthlyIncomeCents, 'RUB')}
            </Text>
          </Text>

          <Text type="secondary">
            Yearly passive income:{' '}
            <Text
              strong
              style={{
                color: totalYearlyIncomeCents > 0 ? '#52c41a' : undefined,
              }}
            >
              {formatMoney(totalYearlyIncomeCents, 'RUB')}
            </Text>
          </Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{
              marginBottom: 24,
            }}
          />
        )}

        <RealEstateTable
          realEstates={realEstates}
          loading={loading}
          onUpdateRealEstate={handleUpdateRealEstate}
          onDeleteRealEstate={handleDeleteRealEstate}
        />
      </Card>

      <Modal
        title="Add real estate"
        open={isCreateModalOpen}
        footer={null}
        destroyOnHidden
        onCancel={() => setIsCreateModalOpen(false)}
      >
        <CreateRealEstateForm onCreateRealEstate={handleCreateRealEstate} />
      </Modal>
    </div>
  );
};

const formatMoney = (amountCents: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
};
