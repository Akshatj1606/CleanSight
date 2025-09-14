import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultRouteForRole } from '@/lib/routes';

const PublicRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to their appropriate dashboard
  if (user && userRole) {
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
  }

  // If not logged in, show the public route
  return children;
};

export default PublicRoute;
