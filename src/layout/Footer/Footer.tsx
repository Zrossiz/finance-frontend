import { Layout, Space, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        padding: '24px 40px',
        background: '#141414',
        borderTop: '1px solid #303030',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <Space size={10}>
          <LineChartOutlined
            style={{
              fontSize: 20,
              color: '#1677ff',
            }}
          />

          <Text strong style={{ color: '#ffffff' }}>
            FIRE Tracker
          </Text>
        </Space>

        <Text type="secondary">© {currentYear} FIRE Tracker. Investment portfolio management.</Text>
      </div>
    </AntFooter>
  );
};
