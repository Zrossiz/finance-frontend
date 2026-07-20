import { useState } from 'react';
import { Button, message, Popconfirm, Space, Table, Tooltip, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import type { ColumnsType } from 'antd/es/table';
import type { BankDeposit } from '@/types';

const { Text } = Typography;

type BankDepositTableProps = {
  deposits: BankDeposit[];
  loading?: boolean;
  onDeleteDeposit: (depositId: string) => Promise<void>;
};

const formatMoney = (amountCents: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
};

const formatDate = (date: string | null) => {
  if (date === null) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const BankDepositTable = ({
  deposits,
  loading = false,
  onDeleteDeposit,
}: BankDepositTableProps) => {
  const [deletingDepositId, setDeletingDepositId] = useState<string | null>(null);

  const handleDelete = async (deposit: BankDeposit) => {
    try {
      setDeletingDepositId(deposit.id);

      await onDeleteDeposit(deposit.id);

      void message.success(`${deposit.name} deleted`);
    } catch {
      void message.error('Failed to delete bank deposit');
    } finally {
      setDeletingDepositId(null);
    }
  };

  const columns: ColumnsType<BankDeposit> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'amountCents',
      key: 'amountCents',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.amountCents - b.amountCents,
      render: (amountCents: number, deposit) => (
        <Text>{formatMoney(amountCents, deposit.currency)}</Text>
      ),
    },
    {
      title: 'Total income',
      dataIndex: 'totalIncomeCents',
      key: 'totalIncomeCents',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalIncomeCents - b.totalIncomeCents,
      render: (amountCents: number, deposit) => (
        <Text>{formatMoney(amountCents, deposit.currency)}</Text>
      ),
    },
    {
      title: 'Interest rate',
      dataIndex: 'interestRate',
      key: 'interestRate',
      sorter: (a, b) => Number(a.interestRate) - Number(b.interestRate),
      render: (interestRate: string) => (
        <Text
          style={{
            color: '#52c41a',
            fontWeight: 600,
          }}
        >
          {Number(interestRate).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
          %
        </Text>
      ),
    },
    {
      title: 'Opened',
      dataIndex: 'openedAt',
      key: 'openedAt',
      sorter: (a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime(),
      render: (openedAt: string) => formatDate(openedAt),
    },
    {
      title: 'Period months',
      dataIndex: 'periodMonths',
      key: 'periodMonths',
      sorter: (a, b) => a.periodMonths - b.periodMonths,
      render: (months: number) => {
        return `${months} ${months === 1 ? 'month' : 'months'}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, deposit) => {
        const isDeleting = deletingDepositId === deposit.id;

        return (
          <Space>
            <Popconfirm
              title="Delete bank deposit?"
              description={`Are you sure you want to delete ${deposit.name}?`}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
                loading: isDeleting,
              }}
              disabled={isDeleting}
              onConfirm={() => void handleDelete(deposit)}
            >
              <Tooltip title="Delete deposit">
                <Button danger shape="circle" icon={<DeleteOutlined />} loading={isDeleting} />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Table<BankDeposit>
      rowKey="id"
      dataSource={deposits}
      columns={columns}
      loading={loading}
      pagination={false}
      locale={{
        emptyText: 'No bank deposits yet',
      }}
      scroll={{
        x: 850,
      }}
    />
  );
};
