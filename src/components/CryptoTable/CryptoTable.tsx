import { useState } from 'react';
import { Button, InputNumber, message, Popconfirm, Space, Table, Tooltip, Typography } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import type { CryptoPosition } from '@/types';

import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

type CryptoTableProps = {
  positions: CryptoPosition[];
  loading?: boolean;

  onUpdatePosition: (
    positionId: string,
    amount: string,
    avgPriceUsdCents: number | null,
  ) => Promise<void>;

  onDeletePosition: (positionId: string) => Promise<void>;
};

export const CryptoTable = ({
  positions,
  loading = false,
  onUpdatePosition,
  onDeletePosition,
}: CryptoTableProps) => {
  const [editedAmounts, setEditedAmounts] = useState<Record<string, string>>({});
  const [editedAvgPrices, setEditedAvgPrices] = useState<Record<string, string>>({});

  const [savingPositionId, setSavingPositionId] = useState<string | null>(null);
  const [deletingPositionId, setDeletingPositionId] = useState<string | null>(null);

  const getAmount = (position: CryptoPosition): string => {
    return editedAmounts[position.id] ?? position.amount;
  };

  const getAvgPriceUsd = (position: CryptoPosition): string => {
    if (editedAvgPrices[position.id] !== undefined) {
      return editedAvgPrices[position.id];
    }

    if (position.avgPriceUsdCents === null) {
      return '';
    }

    return String(position.avgPriceUsdCents / 100);
  };

  const handleAmountChange = (positionId: string, value: string | null) => {
    setEditedAmounts((current) => ({
      ...current,
      [positionId]: value ?? '',
    }));
  };

  const handleAvgPriceChange = (positionId: string, value: string | null) => {
    setEditedAvgPrices((current) => ({
      ...current,
      [positionId]: value ?? '',
    }));
  };

  const clearEditedPosition = (positionId: string) => {
    setEditedAmounts((current) => {
      const updated = { ...current };
      delete updated[positionId];

      return updated;
    });

    setEditedAvgPrices((current) => {
      const updated = { ...current };
      delete updated[positionId];

      return updated;
    });
  };

  const handleSave = async (position: CryptoPosition) => {
    const amount = getAmount(position);
    const avgPriceUsd = getAvgPriceUsd(position);

    const numericAmount = Number(amount);

    if (amount.trim() === '' || !Number.isFinite(numericAmount)) {
      void message.error('Enter a valid amount');
      return;
    }

    if (numericAmount < 0) {
      void message.error('Amount cannot be negative');
      return;
    }

    let avgPriceUsdCents: number | null = null;

    if (avgPriceUsd.trim() !== '') {
      const numericAvgPriceUsd = Number(avgPriceUsd);

      if (!Number.isFinite(numericAvgPriceUsd)) {
        void message.error('Enter a valid average price');
        return;
      }

      if (numericAvgPriceUsd < 0) {
        void message.error('Average price cannot be negative');
        return;
      }

      avgPriceUsdCents = Math.round(numericAvgPriceUsd * 100);
    }

    try {
      setSavingPositionId(position.id);

      await onUpdatePosition(position.id, amount, avgPriceUsdCents);

      clearEditedPosition(position.id);

      void message.success(`${position.ticker.toUpperCase()} position updated`);
    } catch {
      void message.error('Failed to update position');
    } finally {
      setSavingPositionId(null);
    }
  };

  const handleCancel = (positionId: string) => {
    clearEditedPosition(positionId);
  };

  const handleDelete = async (position: CryptoPosition) => {
    try {
      setDeletingPositionId(position.id);

      await onDeletePosition(position.id);

      clearEditedPosition(position.id);

      void message.success(`${position.ticker.toUpperCase()} position deleted`);
    } catch {
      void message.error('Failed to delete position');
    } finally {
      setDeletingPositionId(null);
    }
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
        const isSaving = savingPositionId === position.id;
        const isDeleting = deletingPositionId === position.id;

        return (
          <InputNumber<string>
            stringMode
            min="0"
            step="0.0001"
            value={getAmount(position)}
            disabled={isSaving || isDeleting}
            onChange={(value) => handleAmountChange(position.id, value)}
            style={{ width: 140 }}
          />
        );
      },
    },
    {
      title: 'Average price',
      key: 'avgPriceUsdCents',
      render: (_, position) => {
        const isSaving = savingPositionId === position.id;
        const isDeleting = deletingPositionId === position.id;

        return (
          <InputNumber<string>
            stringMode
            min="0"
            step="0.01"
            precision={2}
            prefix="$"
            placeholder="0.00"
            value={getAvgPriceUsd(position)}
            disabled={isSaving || isDeleting}
            onChange={(value) => handleAvgPriceChange(position.id, value)}
            style={{ width: 140 }}
          />
        );
      },
    },
    {
      title: 'Position value',
      dataIndex: 'totalPriceUsd',
      key: 'totalPriceUsd',
      defaultSortOrder: 'descend',
      sorter: (a, b) => Number(a.totalPriceUsd) - Number(b.totalPriceUsd),
      render: (value: string) =>
        `$${Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, position) => {
        const amountChanged =
          editedAmounts[position.id] !== undefined &&
          editedAmounts[position.id] !== position.amount;

        const originalAvgPriceUsd =
          position.avgPriceUsdCents === null ? '' : String(position.avgPriceUsdCents / 100);

        const avgPriceChanged =
          editedAvgPrices[position.id] !== undefined &&
          editedAvgPrices[position.id] !== originalAvgPriceUsd;

        const hasChanges = amountChanged || avgPriceChanged;

        const isSaving = savingPositionId === position.id;
        const isDeleting = deletingPositionId === position.id;

        return (
          <Space>
            {hasChanges && (
              <>
                {' '}
                <Tooltip title="Save changes">
                  {' '}
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CheckOutlined />}
                    loading={isSaving}
                    disabled={isDeleting}
                    onClick={() => void handleSave(position)}
                  />{' '}
                </Tooltip>{' '}
                <Tooltip title="Cancel changes">
                  {' '}
                  <Button
                    shape="circle"
                    icon={<CloseOutlined />}
                    disabled={isSaving || isDeleting}
                    onClick={() => handleCancel(position.id)}
                  />{' '}
                </Tooltip>{' '}
              </>
            )}

            <Popconfirm
              title="Delete crypto position?"
              description={`Are you sure you want to delete ${position.ticker.toUpperCase()}?`}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: isDeleting }}
              disabled={isSaving || isDeleting}
              onConfirm={() => void handleDelete(position)}
            >
              {' '}
              <Tooltip title="Delete position">
                {' '}
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                  disabled={isSaving}
                />{' '}
              </Tooltip>{' '}
            </Popconfirm>
          </Space>
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
