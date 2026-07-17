import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

const { Content } = AntLayout;

export const Layout = () => {
  return (
    <AntLayout
      style={{
        minHeight: '100vh',
        background: '#141414',
      }}
    >
      <Header />

      <Content
        style={{
          flex: 1,
          background: '#141414',
        }}
      >
        <Outlet />
      </Content>

      <Footer />
    </AntLayout>
  );
};
