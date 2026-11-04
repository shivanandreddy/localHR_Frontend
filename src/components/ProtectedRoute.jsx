import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  // Display a loader while AuthContext initializes from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if allowedRoles are specified
  const userRole = user.role || localStorage.getItem('employeeRole');
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <Layout>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 shadow-sm">
          <h2 className="text-lg font-bold">Access Denied</h2>
          <p className="text-sm mt-1">You do not have the required permissions to view this page.</p>
        </div>
      </Layout>
    );
  }

  // Render children wrapped inside the dashboard Layout
  return <Layout>{children}</Layout>;
}