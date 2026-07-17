import { Layout, Menu, Typography } from 'antd';
import {
  BankOutlined,
  BarChartOutlined,
  DollarOutlined,
  HomeOutlined,
  LineChartOutlined,
  StockOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link to="/">Главная</Link>,
  },
  {
    key: '/crypto',
    icon: <DollarOutlined />,
    label: <Link to="/crypto">Крипта</Link>,
  },
  {
    key: '/deposits',
    icon: <BankOutlined />,
    label: <Link to="/deposits">Вклады</Link>,
  },
  {
    key: '/securities',
    icon: <StockOutlined />,
    label: <Link to="/securities">Акции и облигации</Link>,
  },
  {
    key: '/real-estate',
    icon: <BarChartOutlined />,
    label: <Link to="/real-estate">Недвижимость</Link>,
  },
];

export const Header = () => {
  const location = useLocation();

  const selectedKey =
    menuItems.find(
      (item) =>
        location.pathname === item.key ||
        (item.key !== '/' && location.pathname.startsWith(item.key)),
    )?.key ?? '/';

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 72,
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 48,
        background: '#141414',
        borderBottom: '1px solid #303030',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <LineChartOutlined
          style={{
            fontSize: 26,
            color: '#1677ff',
          }}
        />

        <Title
          level={3}
          style={{
            margin: 0,
            color: '#ffffff',
            whiteSpace: 'nowrap',
          }}
        >
          FIRE Tracker
        </Title>
      </Link>

      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          borderBottom: 'none',
        }}
      />
    </AntHeader>
  );
};
