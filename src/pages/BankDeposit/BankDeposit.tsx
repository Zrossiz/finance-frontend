import { useEffect, useState } from 'react';
import { Alert, Button, Card, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { createBankDeposit, deleteBankDeposit, getBankDeposits, normalizeApiError } from '@/api';

import { BankDepositTable, CreateBankDepositForm } from '@/components';

import { toCamelCase } from '@/helpers/toCamelCase';

import type { BankDeposit, CreateBankDeposit } from '@/types';

const { Title, Text } = Typography;

export const BankDepositPage = () => {
  const [deposits, setDeposits] = useState<BankDeposit[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getData = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getBankDeposits();

      if (res.status === 200 && Array.isArray(res.data)) {
        setDeposits(toCamelCase(res.data));
      }
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async (body: CreateBankDeposit) => {
    await createBankDeposit(body);

    await getData();

    setIsCreateModalOpen(false);
  };

  const handleDeleteDeposit = async (depositId: string) => {
    await deleteBankDeposit(depositId);
    await getData();
  };

  useEffect(() => {
    void getData();
  }, []);

  let total: number = 0;
  if (deposits.length > 0) {
    total = deposits.reduce((sum, deposit) => sum + deposit.amountCents, 0);
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
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
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Bank deposits
          </Title>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Add deposit
          </Button>
        </div>

        <div
          style={{
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          <Text type="secondary">
            Total amount:{' '}
            <Text strong>
              {(total / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Text>
        </div>

        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 24 }} />}

        <BankDepositTable
          deposits={deposits}
          loading={loading}
          onDeleteDeposit={handleDeleteDeposit}
        />

        <Modal
          title="Add bank deposit"
          open={isCreateModalOpen}
          footer={null}
          destroyOnHidden
          onCancel={() => setIsCreateModalOpen(false)}
        >
          <CreateBankDepositForm onCreateDeposit={handleCreateDeposit} />
        </Modal>
      </Card>
    </div>
  );
};
