import { useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, message, Select } from 'antd';

import type { Dayjs } from 'dayjs';
import type { CreateRealEstate } from '@/types';

type CreateRealEstateFormValues = {
  name: string;
  currency: string;
  purchasePrice?: string;
  monthlyIncome?: string;
  purchased?: Dayjs;
};

type CreateRealEstateFormProps = {
  onCreateRealEstate: (body: CreateRealEstate) => Promise<void>;
};

const currencyOptions = [
  {
    label: 'RUB — Russian Ruble',
    value: 'RUB',
  },
  {
    label: 'USD — US Dollar',
    value: 'USD',
  },
  {
    label: 'EUR — Euro',
    value: 'EUR',
  },
  {
    label: 'CHF — Swiss Franc',
    value: 'CHF',
  },
];

export const CreateRealEstateForm = ({ onCreateRealEstate }: CreateRealEstateFormProps) => {
  const [form] = Form.useForm<CreateRealEstateFormValues>();

  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: CreateRealEstateFormValues) => {
    let purchasePriceCents: number | null = null;
    let monthlyIncomeCents: number | null = null;

    if (values.purchasePrice !== undefined && values.purchasePrice.trim() !== '') {
      const numericPurchasePrice = Number(values.purchasePrice);

      if (!Number.isFinite(numericPurchasePrice) || numericPurchasePrice < 0) {
        void message.error('Enter a valid purchase price');
        return;
      }

      purchasePriceCents = Math.round(numericPurchasePrice * 100);
    }

    if (values.monthlyIncome !== undefined && values.monthlyIncome.trim() !== '') {
      const numericMonthlyIncome = Number(values.monthlyIncome);

      if (!Number.isFinite(numericMonthlyIncome) || numericMonthlyIncome < 0) {
        void message.error('Enter a valid monthly income');
        return;
      }

      monthlyIncomeCents = Math.round(numericMonthlyIncome * 100);
    }

    try {
      setSubmitting(true);

      await onCreateRealEstate({
        name: values.name.trim(),
        currency: values.currency,
        purchasePriceCents,
        monthlyIncomeCents,
        purchased: values.purchased?.toDate() ?? null,
      });

      form.resetFields();

      void message.success('Real estate created');
    } catch {
      void message.error('Failed to create real estate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<CreateRealEstateFormValues>
      form={form}
      layout="vertical"
      initialValues={{
        currency: 'RUB',
      }}
      onFinish={(values) => void handleFinish(values)}
    >
      <Form.Item
        label="Property name"
        name="name"
        rules={[
          {
            required: true,
            message: 'Enter a property name',
          },
          {
            whitespace: true,
            message: 'Property name cannot be empty',
          },
          {
            max: 100,
            message: 'Property name is too long',
          },
        ]}
      >
        <Input placeholder="For example: Apartment in Moscow" />
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

      <Form.Item label="Purchase price" name="purchasePrice">
        <InputNumber<string>
          stringMode
          min="0"
          step="0.01"
          precision={2}
          placeholder="0.00"
          style={{
            width: '100%',
          }}
        />
      </Form.Item>

      <Form.Item label="Monthly passive income" name="monthlyIncome">
        <InputNumber<string>
          stringMode
          min="0"
          step="0.01"
          precision={2}
          placeholder="0.00"
          style={{
            width: '100%',
          }}
        />
      </Form.Item>

      <Form.Item label="Purchase date" name="purchased">
        <DatePicker
          format="DD.MM.YYYY"
          placeholder="Optional"
          style={{
            width: '100%',
          }}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={submitting} block>
        Create property
      </Button>
    </Form>
  );
};
