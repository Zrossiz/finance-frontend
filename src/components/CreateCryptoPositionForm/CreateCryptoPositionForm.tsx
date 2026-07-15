import { useState } from 'react';
import { Button, Form, Input, InputNumber, message, Space } from 'antd';

type CreateCryptoPositionFormValues = {
  ticker: string;
  amount: string;
  avgPriceUsd?: string;
};

type CreateCryptoPositionFormProps = {
  onCreatePosition: (ticker: string, amount: string, avgPriceUsdCents?: number) => Promise<void>;
};

export const CreateCryptoPositionForm = ({ onCreatePosition }: CreateCryptoPositionFormProps) => {
  const [form] = Form.useForm<CreateCryptoPositionFormValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateCryptoPositionFormValues) => {
    const ticker = values.ticker.trim().toLowerCase();
    const amount = values.amount;
    const avgPriceUsd = values.avgPriceUsd;

    let avgPriceUsdCents: number | undefined;

    if (avgPriceUsd !== undefined && avgPriceUsd !== '') {
      const numericAvgPriceUsd = Number(avgPriceUsd);

      if (!Number.isFinite(numericAvgPriceUsd)) {
        void message.error('Enter a valid average price');
        return;
      }

      avgPriceUsdCents = Math.round(numericAvgPriceUsd * 100);
    }

    try {
      setLoading(true);

      await onCreatePosition(ticker, amount, avgPriceUsdCents);

      form.resetFields();

      void message.success(`${ticker.toUpperCase()} position created`);
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
      <Space align="start" size="middle" wrap style={{ width: '100%' }}>
        <Form.Item
          label="Ticker"
          name="ticker"
          rules={[
            {
              required: true,
              message: 'Enter crypto ticker',
            },
            {
              pattern: /^[a-zA-Z0-9-]+$/,
              message: 'Ticker contains invalid characters',
            },
          ]}
        >
          <Input placeholder="bitcoin" disabled={loading} style={{ width: 180 }} />
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
              validator: async (_, value: string | undefined) => {
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
              validator: async (_, value: string | undefined) => {
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Add position
          </Button>
        </Form.Item>
      </Space>
    </Form>
  );
};
