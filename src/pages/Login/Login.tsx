import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'

import { loginUserQuery } from '@/api/User';

const { Title, Text } = Typography;

type LoginForm = {
  username: string;
  password: string;
};

const loginError = 'Неверный логин или пароль';

export const LoginPage = () => {
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setErr('');
    setLoading(true);

    try {
      await loginUserQuery(values.username, values.password);
      window.location.replace('/');
    } catch {
      setErr(loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#141414',
      }}
    >
      <Card style={{ width: 420 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Добро пожаловать
        </Title>

        <Text type="secondary">Войдите в свой аккаунт</Text>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off" style={{ marginTop: 24 }}>
          {err && <Alert type="error" message={err} showIcon style={{ marginBottom: 20 }} />}

          <Form.Item
            label="Имя пользователя"
            name="username"
            rules={[
              {
                required: true,
                message: 'Введите имя пользователя',
              },
              {
                min: 3,
                message: 'Минимум 3 символа',
              },
              {
                max: 16,
                message: 'Максимум 16 символов',
              },
            ]}
          >
            <Input placeholder="Введите username" size="large" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              {
                required: true,
                message: 'Введите пароль',
              },
              {
                min: 4,
                message: 'Минимум 4 символа',
              },
            ]}
          >
            <Input.Password placeholder="Введите пароль" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
};
