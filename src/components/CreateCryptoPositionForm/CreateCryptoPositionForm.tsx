import { useEffect, useState } from 'react';
import { Alert, Button, Form, InputNumber, message, Select, Space } from 'antd';

import { getCryptoCoins } from '@/api/CryptoCoins';

import type { CryptoCoin } from '@/types';
import { toCamelCase } from '@/helpers/toCamelCase';

type CreateCryptoPositionFormValues = {
  coinId: string;
  amount: string;
  avgPriceUsd?: string;
};

type CreateCryptoPositionFormProps = {
  onCreatePosition: (
    ticker: string,
    amount: string,
    coinId: string,
    avgPriceUsdCents?: number,
  ) => Promise<void>;
};

export const CreateCryptoPositionForm = ({ onCreatePosition }: CreateCryptoPositionFormProps) => {
  const [form] = Form.useForm<CreateCryptoPositionFormValues>();

  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [coinsError, setCoinsError] = useState('');

  const getCoins = async () => {
    setCoinsLoading(true);
    setCoinsError('');

    try {
      const res = await getCryptoCoins();

      if (res.status === 200) {
        setCoins(toCamelCase(res.data.coins));
        console.log(toCamelCase(res.data.coins));
      }
    } catch {
      setCoinsError('Failed to load cryptocurrencies');
    } finally {
      setCoinsLoading(false);
    }
  };

  useEffect(() => {
    void getCoins();
  }, []);

  const handleSubmit = async (values: CreateCryptoPositionFormValues) => {
    const selectedCoin = coins.find((coin) => coin.coinId === values.coinId);

    if (!selectedCoin) {
      void message.error('Select cryptocurrency');
      return;
    }

    const ticker = selectedCoin.symbol.trim().toLowerCase();
    const coinId = selectedCoin.coinId;
    const amount = values.amount;

    let avgPriceUsdCents: number | undefined;

    if (values.avgPriceUsd !== undefined && values.avgPriceUsd !== '') {
      const numericAvgPriceUsd = Number(values.avgPriceUsd);

      if (!Number.isFinite(numericAvgPriceUsd)) {
        void message.error('Enter a valid average price');
        return;
      }

      avgPriceUsdCents = Math.round(numericAvgPriceUsd * 100);
    }

    try {
      setLoading(true);

      await onCreatePosition(ticker, amount, coinId, avgPriceUsdCents);

      form.resetFields();

      void message.success(`${selectedCoin.symbol.toUpperCase()} position created`);
    } catch {
      void message.error('Failed to create crypto position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form<CreateCryptoPositionFormValues>
      form={form}
      layout="vertical"
      onFinish={(values) => void handleSubmit(values)}
      initialValues={{
        amount: '0',
      }}
    >
      {coinsError && (
        <Alert
          type="error"
          message={coinsError}
          showIcon
          action={
            <Button size="small" danger onClick={() => void getCoins()}>
              Retry
            </Button>
          }
          style={{ marginBottom: 20 }}
        />
      )}

      <Space align="start" size="middle" wrap style={{ width: '100%' }}>
        <Form.Item
          label="Cryptocurrency"
          name="coinId"
          rules={[
            {
              required: true,
              message: 'Select cryptocurrency',
            },
          ]}
        >
          <Select
            showSearch
            loading={coinsLoading}
            disabled={loading || coinsLoading}
            placeholder="Search BTC, ETH..."
            optionFilterProp="label"
            style={{ width: 240 }}
            options={coins.map((coin) => ({
              value: coin.coinId,
              label: `${coin.symbol.toUpperCase()} — ${coin.coinId}`,
            }))}
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            notFoundContent={coinsLoading ? 'Loading...' : 'No coins found'}
          />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            {
              required: true,
              message: 'Enter amount',
            },
            {
              validator: async (_, value?: string) => {
                if (value === undefined || value.trim() === '') {
                  throw new Error('Enter amount');
                }

                const amount = Number(value);

                if (!Number.isFinite(amount)) {
                  throw new Error('Enter a valid amount');
                }

                if (amount <= 0) {
                  throw new Error('Amount must be greater than zero');
                }
              },
            },
          ]}
        >
          <InputNumber<string>
            stringMode
            min="0"
            step="0.0001"
            placeholder="0.00"
            disabled={loading}
            style={{ width: 180 }}
          />
        </Form.Item>

        <Form.Item
          label="Average purchase price"
          name="avgPriceUsd"
          rules={[
            {
              validator: async (_, value?: string) => {
                if (value === undefined || value === '') {
                  return;
                }

                const price = Number(value);

                if (!Number.isFinite(price)) {
                  throw new Error('Enter a valid price');
                }

                if (price < 0) {
                  throw new Error('Price cannot be negative');
                }
              },
            },
          ]}
        >
          <InputNumber<string>
            stringMode
            min="0"
            step="0.01"
            precision={2}
            prefix="$"
            placeholder="Optional"
            disabled={loading}
            style={{ width: 200 }}
          />
        </Form.Item>

        <Form.Item label=" ">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={coinsLoading || coins.length === 0}
          >
            Add position
          </Button>
        </Form.Item>
      </Space>
    </Form>
  );
};
