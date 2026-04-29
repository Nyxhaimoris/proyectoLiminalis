import AdminRoute from '../components/guards/AdminRoute';
import AdminDashboard from '../pages/Admin/AdminDashboard';

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
];