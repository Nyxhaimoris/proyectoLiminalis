import React from 'react';
import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;