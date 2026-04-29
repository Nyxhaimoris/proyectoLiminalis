// src/components/guards/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const AdminRoute = ({ children }) => {
  const role = getUserRole();

  if (role !== 1) {
    return <Navigate to="/permissiondenied" replace />;
  }

  return children;
};

export default AdminRoute;