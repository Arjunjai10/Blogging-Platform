import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateAdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  
  // If still loading, don't render anything yet
  if (loading) {
    return null;
  }
  
  // If not authenticated or not an admin, redirect to admin login
  if (!isAuthenticated || !user || !user.isAdmin) {
    return <Navigate to="/admin/login" />;
  }
  
  // If authenticated and is admin, render the protected component
  return children;
};

export default PrivateAdminRoute;
