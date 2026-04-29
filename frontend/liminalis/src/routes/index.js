import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';

import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import { adminRoutes } from './adminRoutes';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import GuestRoute from '../components/guards/GuestRoute';

import NotFoundPage from '../pages/errors/404';
import PermissionDenied from '../pages/errors/PermissionDenied';
import BannedPage from '../pages/errors/BannedPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Public */}
        {publicRoutes.map((r) => (
          <Route key={r.path} {...r} />
        ))}

        {/* Private */}
        {privateRoutes.map((r) => (
          <Route key={r.path} {...r} />
        ))}

        {/* Admin */}
        {adminRoutes.map((r) => (
          <Route key={r.path} {...r} />
        ))}

        {/* Errors */}
        <Route path="/permissiondenied" element={<PermissionDenied />} />
        <Route path="/banned" element={<BannedPage />} />
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}