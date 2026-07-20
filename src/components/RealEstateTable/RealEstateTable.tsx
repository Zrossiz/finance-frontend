import { useState } from 'react';
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

import type { ColumnsType } from 'antd/es/table';
import type { RealEstate, UpdateRealEstate } from '@/types';

const { Text } = Typography;

type RealEstateTableProps = {
  realEstates: RealEstate[];
  loading?: boolean;

  onUpdateRealEstate: (id: string, body: UpdateRealEstate) => Promise<void>;

  onDeleteRealEstate: (id: string) => Promise<void>;
};

type EditedRealEstate = {
  name?: string;
  currency?: string;
  purchasePrice?: string;
  monthlyIncome?: string;
  purchased?: Dayjs | null;
};

const currencyOptions = [
  { label: 'RUB', value: 'RUB' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'CHF', value: 'CHF' },
];

const formatMoney = (amountCents: number | null, currency: string) => {
  if (amountCents === null) {
    return '—';
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
};

const formatDate = (value: string | null) => {
  if (value === null) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

export const RealEstateTable = ({
  realEstates,
  loading = false,
  onUpdateRealEstate,
  onDeleteRealEstate,
}: RealEstateTableProps) => {
  const [editedItems, setEditedItems] = useState<Record<string, EditedRealEstate>>({});

  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getEditedItem = (item: RealEstate) => {
    return editedItems[item.id] ?? {};
  };

  const updateEditedItem = (id: string, patch: EditedRealEstate) => {
    setEditedItems((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  };

  const clearEditedItem = (id: string) => {
    setEditedItems((current) => {
      const updated = { ...current };

      delete updated[id];

      return updated;
    });
  };

  const hasChanges = (item: RealEstate) => {
    const edited = editedItems[item.id];

    if (!edited) {
      return false;
    }

    const originalPurchasePrice =
      item.purchasePriceCents === null ? '' : String(item.purchasePriceCents / 100);

    const originalMonthlyIncome =
      item.monthlyIncomeCents === null ? '' : String(item.monthlyIncomeCents / 100);

    const originalPurchased = item.purchased ? dayjs(item.purchased).format('YYYY-MM-DD') : null;

    const editedPurchased =
      edited.purchased === undefined
        ? originalPurchased
        : (edited.purchased?.format('YYYY-MM-DD') ?? null);

    return (
      (edited.name !== undefined && edited.name !== item.name) ||
      (edited.currency !== undefined && edited.currency !== item.currency) ||
      (edited.purchasePrice !== undefined && edited.purchasePrice !== originalPurchasePrice) ||
      (edited.monthlyIncome !== undefined && edited.monthlyIncome !== originalMonthlyIncome) ||
      (edited.purchased !== undefined && editedPurchased !== originalPurchased)
    );
  };

  const handleSave = async (item: RealEstate) => {
    const edited = getEditedItem(item);

    const name = edited.name ?? item.name;
    const currency = edited.currency ?? item.currency;

    const purchasePrice =
      edited.purchasePrice ??
      (item.purchasePriceCents === null ? '' : String(item.purchasePriceCents / 100));

    const monthlyIncome =
      edited.monthlyIncome ??
      (item.monthlyIncomeCents === null ? '' : String(item.monthlyIncomeCents / 100));

    const purchased =
      edited.purchased !== undefined
        ? edited.purchased
        : item.purchased
          ? dayjs(item.purchased)
          : null;

    if (name.trim() === '') {
      void message.error('Enter a property name');
      return;
    }

    let purchasePriceCents: number | null = null;

    if (purchasePrice.trim() !== '') {
      const numericPurchasePrice = Number(purchasePrice);

      if (!Number.isFinite(numericPurchasePrice) || numericPurchasePrice < 0) {
        void message.error('Enter a valid purchase price');
        return;
      }

      purchasePriceCents = Math.round(numericPurchasePrice * 100);
    }

    let monthlyIncomeCents: number | null = null;

    if (monthlyIncome.trim() !== '') {
      const numericMonthlyIncome = Number(monthlyIncome);

      if (!Number.isFinite(numericMonthlyIncome) || numericMonthlyIncome < 0) {
        void message.error('Enter a valid monthly income');
        return;
      }

      monthlyIncomeCents = Math.round(numericMonthlyIncome * 100);
    }

    try {
      setSavingId(item.id);

      await onUpdateRealEstate(item.id, {
        name: name.trim(),
        currency,
        purchasePriceCents,
        monthlyIncomeCents,
        purchased: purchased?.toDate() ?? null,
      });

      clearEditedItem(item.id);

      void message.success(`${name} updated`);
    } catch {
      void message.error('Failed to update real estate');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (item: RealEstate) => {
    try {
      setDeletingId(item.id);

      await onDeleteRealEstate(item.id);

      clearEditedItem(item.id);

      void message.success(`${item.name} deleted`);
    } catch {
      void message.error('Failed to delete real estate');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<RealEstate> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, item) => {
        const edited = getEditedItem(item);
        const isDisabled = savingId === item.id || deletingId === item.id;

        return (
          <Input
            value={edited.name ?? item.name}
            disabled={isDisabled}
            onChange={(event) =>
              updateEditedItem(item.id, {
                name: event.target.value,
              })
            }
            style={{ minWidth: 160 }}
          />
        );
      },
    },
    {
      title: 'Currency',
      key: 'currency',
      render: (_, item) => {
        const edited = getEditedItem(item);
        const isDisabled = savingId === item.id || deletingId === item.id;

        return (
          <Select
            value={edited.currency ?? item.currency}
            options={currencyOptions}
            disabled={isDisabled}
            onChange={(value) =>
              updateEditedItem(item.id, {
                currency: value,
              })
            }
            style={{ width: 100 }}
          />
        );
      },
    },
    {
      title: 'Purchase price',
      key: 'purchasePriceCents',
      sorter: (a, b) => (a.purchasePriceCents ?? 0) - (b.purchasePriceCents ?? 0),
      render: (_, item) => {
        const edited = getEditedItem(item);
        const isDisabled = savingId === item.id || deletingId === item.id;

        const value =
          edited.purchasePrice ??
          (item.purchasePriceCents === null ? '' : String(item.purchasePriceCents / 100));

        return (
          <InputNumber<string>
            stringMode
            min="0"
            step="0.01"
            precision={2}
            value={value}
            disabled={isDisabled}
            onChange={(newValue) =>
              updateEditedItem(item.id, {
                purchasePrice: newValue ?? '',
              })
            }
            style={{ width: 150 }}
          />
        );
      },
    },
    {
      title: 'Monthly income',
      key: 'monthlyIncomeCents',
      sorter: (a, b) => (a.monthlyIncomeCents ?? 0) - (b.monthlyIncomeCents ?? 0),
      render: (_, item) => {
        const edited = getEditedItem(item);
        const isDisabled = savingId === item.id || deletingId === item.id;

        const value =
          edited.monthlyIncome ??
          (item.monthlyIncomeCents === null ? '' : String(item.monthlyIncomeCents / 100));

        return (
          <InputNumber<string>
            stringMode
            min="0"
            step="0.01"
            precision={2}
            value={value}
            disabled={isDisabled}
            onChange={(newValue) =>
              updateEditedItem(item.id, {
                monthlyIncome: newValue ?? '',
              })
            }
            style={{ width: 150 }}
          />
        );
      },
    },
    {
      title: 'Purchased',
      key: 'purchased',
      sorter: (a, b) => {
        if (!a.purchased && !b.purchased) {
          return 0;
        }

        if (!a.purchased) {
          return 1;
        }

        if (!b.purchased) {
          return -1;
        }

        return new Date(a.purchased).getTime() - new Date(b.purchased).getTime();
      },
      render: (_, item) => {
        const edited = getEditedItem(item);
        const isDisabled = savingId === item.id || deletingId === item.id;

        const value =
          edited.purchased !== undefined
            ? edited.purchased
            : item.purchased
              ? dayjs(item.purchased)
              : null;

        return (
          <DatePicker
            value={value}
            format="DD.MM.YYYY"
            disabled={isDisabled}
            allowClear
            onChange={(date) =>
              updateEditedItem(item.id, {
                purchased: date,
              })
            }
            style={{ width: 140 }}
          />
        );
      },
    },
    {
      title: 'Yield',
      key: 'yield',
      render: (_, item) => {
        if (!item.purchasePriceCents || !item.monthlyIncomeCents) {
          return '—';
        }

        const annualYield = (item.monthlyIncomeCents * 12 * 100) / item.purchasePriceCents;

        return (
          <Text
            strong
            style={{
              color: annualYield > 0 ? '#52c41a' : undefined,
            }}
          >
            {annualYield.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            %
          </Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, item) => {
        const changed = hasChanges(item);
        const isSaving = savingId === item.id;
        const isDeleting = deletingId === item.id;

        return (
          <Space>
            {changed && (
              <>
                <Tooltip title="Save changes">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CheckOutlined />}
                    loading={isSaving}
                    disabled={isDeleting}
                    onClick={() => void handleSave(item)}
                  />
                </Tooltip>

                <Tooltip title="Cancel changes">
                  <Button
                    shape="circle"
                    icon={<CloseOutlined />}
                    disabled={isSaving || isDeleting}
                    onClick={() => clearEditedItem(item.id)}
                  />
                </Tooltip>
              </>
            )}

            <Popconfirm
              title="Delete property?"
              description={`Are you sure you want to delete ${item.name}?`}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
                loading: isDeleting,
              }}
              disabled={isSaving || isDeleting}
              onConfirm={() => void handleDelete(item)}
            >
              <Tooltip title="Delete property">
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                  disabled={isSaving}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Table<RealEstate>
      rowKey="id"
      dataSource={realEstates}
      columns={columns}
      loading={loading}
      pagination={false}
      locale={{
        emptyText: 'No real estate yet',
      }}
      scroll={{
        x: 1100,
      }}
    />
  );
};
