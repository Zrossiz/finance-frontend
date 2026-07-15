import { useState } from 'react';
import { Button, InputNumber, message, Space, Table, Typography } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import type { CryptoPosition } from '@/types';

const { Text } = Typography;

type CryptoPositionsTableProps = {
  positions: CryptoPosition[];
  loading?: boolean;
  onUpdatePosition: (positionId: string, amount: string) => Promise<void>;
};

export const CryptoPositionsTable = ({
  positions,
  loading = false,
  onUpdatePosition,
}: CryptoPositionsTableProps) => {
  const [editedAmounts, setEditedAmounts] = useState<Record<string, string>>({});
  const [savingPositionId, setSavingPositionId] = useState<string | null>(null);

  const getAmount = (position: CryptoPosition) => editedAmounts[position.id] ?? position.amount;

  const handleAmountChange = (positionId: string, value: string | null) => {
    setEditedAmounts((current) => ({
      ...current,
      [positionId]: value ?? '0',
    }));
  };

  const handleSave = async (position: CryptoPosition) => {
    const amount = getAmount(position);

    if (Number(amount) < 0) {
      void message.error('Amount cannot be negative');
      return;
    }

    try {
      setSavingPositionId(position.id);

      await onUpdatePosition(position.id, amount);

      setEditedAmounts((current) => {
        const updated = { ...current };
        delete updated[position.id];

        return updated;
      });

      void message.success(`${position.ticker.toUpperCase()} position updated`);
    } catch {
      void message.error('Failed to update position');
    } finally {
      setSavingPositionId(null);
    }
  };

  const handleCancel = (positionId: string) => {
    setEditedAmounts((current) => {
      const updated = { ...current };
      delete updated[positionId];

      return updated;
    });
  };

  const columns: ColumnsType<CryptoPosition> = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
      render: (ticker: string) => ticker.toUpperCase(),
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, position) => {
        const amount = getAmount(position);
        const hasChanges = amount !== position.amount;

        return (
          <Space>
            <InputNumber<string>
              stringMode
              min="0"
              step="0.0001"
              value={amount}
              onChange={(value) => handleAmountChange(position.id, value)}
              style={{ width: 150 }}
            />

            {hasChanges && (
              <>
                <Button
                  type="primary"
                  loading={savingPositionId === position.id}
                  onClick={() => void handleSave(position)}
                >
                  Save
                </Button>

                <Button
                  disabled={savingPositionId === position.id}
                  onClick={() => handleCancel(position.id)}
                >
                  Cancel
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Position value',
      dataIndex: 'totalPriceUsd',
      key: 'totalPriceUsd',
      render: (value: string) =>
        `$${Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
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
            {profit >= 0 ? '+' : '-'}$
            {Math.abs(profit).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
  ];

  return (
    <Table<CryptoPosition>
      rowKey="id"
      dataSource={positions}
      columns={columns}
      loading={loading}
      pagination={false}
    />
  );
};
