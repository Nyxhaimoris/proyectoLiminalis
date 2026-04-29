import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import Footer from './Footer';
import ChatSideBar from  './chats/ChatSideBar.jsx';
import './styles/Layout.css';
import AxiosConfig from '../config/AxiosConfig';
import { useEffect, useState } from 'react';

const Layout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const applyUserSettings = async () => {
      const token = localStorage.getItem('access_token');

      setIsAuthenticated(!!token);

      if (token) {
        try {
          const { data } = await AxiosConfig.get('/settings');

          if (data.status === 200 && data.data) {
            const theme = data.data.theme || 'light';
            document.documentElement.setAttribute('data-theme', theme);
          }
        } catch (err) {
          console.error("Error al cargar configuración global:", err);
        }
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    };

    applyUserSettings();

    window.addEventListener('auth-changed', applyUserSettings);
    return () => window.removeEventListener('auth-changed', applyUserSettings);
  }, []);

  return (
    <div className="app-layout">
      <Navbar />

      <div className="layout-body">
        <main className="main-content">
          <Outlet />
        </main>
        {isAuthenticated && <ChatSideBar />}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;