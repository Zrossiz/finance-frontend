import { useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, message, Select, Space } from 'antd';

import type { Dayjs } from 'dayjs';
import type { CreateBankDeposit } from '@/types';

type CreateBankDepositFormValues = {
  name: string;
  currency: string;
  amount: string;
  interestRate: string;
  openedAt: Dayjs;
  periodMonths: number;
};

type CreateBankDepositFormProps = {
  onCreateDeposit: (deposit: CreateBankDeposit) => Promise<void>;
};

const currencyOptions = [
  {
    label: 'USD — US Dollar',
    value: 'USD',
  },
  {
    label: 'EUR — Euro',
    value: 'EUR',
  },
  {
    label: 'RUB — Russian Ruble',
    value: 'RUB',
  },
];

export const CreateBankDepositForm = ({ onCreateDeposit }: CreateBankDepositFormProps) => {
  const [form] = Form.useForm<CreateBankDepositFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: CreateBankDepositFormValues) => {
    const numericAmount = Number(values.amount);
    const numericInterestRate = Number(values.interestRate);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      void message.error('Enter a valid deposit amount');
      return;
    }

    if (!Number.isFinite(numericInterestRate) || numericInterestRate < 0) {
      void message.error('Enter a valid interest rate');
      return;
    }

    const amountCents = Math.round(numericAmount * 100);

    try {
      setSubmitting(true);

      await onCreateDeposit({
        name: values.name.trim(),
        currency: values.currency,
        amountCents,
        interestRate: values.interestRate,
        openedAt: values.openedAt.toDate(),
        periodMonths: values.periodMonths,
      });

      form.resetFields();

      void message.success('Bank deposit created');
    } catch {
      void message.error('Failed to create bank deposit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<CreateBankDepositFormValues>
      form={form}
      layout="vertical"
      initialValues={{
        currency: 'USD',
      }}
      onFinish={(values) => void handleFinish(values)}
    >
      <Form.Item
        label="Deposit name"
        name="name"
        rules={[
          {
            required: true,
            message: 'Enter a deposit name',
          },
          {
            whitespace: true,
            message: 'Deposit name cannot be empty',
          },
          {
            max: 100,
            message: 'Deposit name is too long',
          },
        ]}
      >
        <Input placeholder="For example: UBS savings account" />
      </Form.Item>

      <Form.Item
        label="Currency"
        name="currency"
        rules={[
          {
            required: true,
            message: 'Select a currency',
          },
        ]}
      >
        <Select
          showSearch
          options={currencyOptions}
          placeholder="Select currency"
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        label="Amount"
        name="amount"
        rules={[
          {
            required: true,
            message: 'Enter the deposit amount',
          },
        ]}
      >
        <InputNumber<string>
          stringMode
          min="0.01"
          step="0.01"
          precision={2}
          placeholder="0.00"
          style={{
            width: '100%',
          }}
        />
      </Form.Item>

      <Form.Item
        label="Interest rate"
        name="interestRate"
        rules={[
          {
            required: true,
            message: 'Enter the interest rate',
          },
        ]}
      >
        <InputNumber<string>
          stringMode
          min="0"
          max="100"
          step="0.01"
          precision={2}
          suffix="%"
          placeholder="0.00"
          style={{
            width: '100%',
          }}
        />
      </Form.Item>

      <Space
        align="start"
        size={16}
        style={{
          display: 'flex',
        }}
      >
        <Form.Item
          label="Opened at"
          name="openedAt"
          rules={[
            {
              required: true,
              message: 'Select the opening date',
            },
          ]}
          style={{
            flex: 1,
          }}
        >
          <DatePicker
            format="DD.MM.YYYY"
            placeholder="Opening date"
            style={{
              width: '100%',
            }}
          />
        </Form.Item>

        <Form.Item
          label="Period (months)"
          name="periodMonths"
          rules={[
            {
              required: true,
              message: 'Enter the deposit period',
            },
            {
              type: 'number',
              min: 1,
              message: 'Period must be at least 1 month',
            },
          ]}
        >
          <InputNumber
            min={1}
            max={600}
            placeholder="12"
            addonAfter="months"
            style={{
              width: '100%',
            }}
          />
        </Form.Item>
      </Space>

      <Button type="primary" htmlType="submit" loading={submitting} block>
        Create deposit
      </Button>
    </Form>
  );
};
