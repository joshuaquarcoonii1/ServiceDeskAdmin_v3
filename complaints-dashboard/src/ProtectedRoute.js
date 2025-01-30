import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return element;
};

export default ProtectedRoute;
