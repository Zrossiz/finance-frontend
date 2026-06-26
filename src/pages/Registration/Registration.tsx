import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Typography,
} from "antd";

import { registrationUserQuery } from "../../api/User";
import { AxiosError } from "axios";

const { Title, Text } = Typography;

type RegistrationForm = {
  username: string;
  password: string;
};

const userAlreadyExistError = "Пользователь с таким именем уже существует"

export const LoginPage = () => {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegistrationForm) => {
    setErr("");
    setLoading(true);

    try {
      await registrationUserQuery(values.username, values.password);
      window.location.replace("/")
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status == 409) {
        setErr(userAlreadyExistError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#141414",
      }}
    >
      <Card
        style={{ width: 420 }}
      >
        <Title level={2} style={{ marginBottom: 8 }}>
          Добро пожаловать
        </Title>

        <Text type="secondary">
          Регистрация
        </Text>

        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          style={{ marginTop: 24 }}
        >
          {err && (
            <Alert
              type="error"
              message={err}
              showIcon
              style={{ marginBottom: 20 }}
            />
          )}

          <Form.Item
            label="Имя пользователя"
            name="username"
            rules={[
              {
                required: true,
                message: "Введите имя пользователя",
              },
              {
                min: 3,
                message: "Минимум 3 символа",
              },
              {
                max: 16,
                message: "Максимум 16 символов",
              },
            ]}
          >
            <Input
              placeholder="Введите username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              {
                required: true,
                message: "Введите пароль",
              },
              {
                min: 4,
                message: "Минимум 4 символа",
              },
            ]}
          >
            <Input.Password
              placeholder="Введите пароль"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Регистрация
          </Button>
        </Form>
      </Card>
    </div>
  );
};