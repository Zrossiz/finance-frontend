import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/Home/Home.tsx';
import { LoginPage } from '@/pages/Login/Login.tsx';
import { RegistrationPage } from '@/pages/Registration/Registration.tsx';
import { CryptoPage } from '@/pages/Crypto/Crypto.tsx';
import 'antd/dist/reset.css';
import { ConfigProvider, theme } from 'antd';

const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
    children: [
      {
        path: '/crypto',
        Component: CryptoPage,
      },
    ],
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/registration',
    Component: RegistrationPage,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#7c3aed',
          borderRadius: 12,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
);
