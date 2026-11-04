import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages & Components
import Login from './pages/Login';
import ClockIn from './components/ClockIn';
import EmployeeList from './pages/EmployeeList';
import PayrollDashboard from './pages/PayrollDashboard';
import EmployeeForm from './components/EmployeeForm';
import ProtectedRoute from './components/ProtectedRoute'; 
import PunchIn from './components/PunchIn';
import EmployeeDashboard from './pages/EmployeeDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No login required) */}
        <Route path="/login" element={<Login />} />
        <Route path="/punch-in" element={<PunchIn />} />

        {/* Redirect root directly to the public Punch-In kiosk */}
        <Route path="/" element={<Navigate to="/punch-in" replace />} />

        {/* Protected Employee Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }  allowedRoles={['Admin', 'Manager','Employee']}
        />

        {/* Protected Biometric Clock-In Route (Requires session token) */}
        <Route 
          path="/clock-in" 
          element={
            <ProtectedRoute>
              <ClockIn />
            </ProtectedRoute>
          } 
        />

        {/* Protected Employee Management Route (Admin & Manager Only) */}
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <EmployeeList />
            </ProtectedRoute>
          } 
        />

        {/* Protected Add New Employee Route (Admin & Manager Only) */}
        <Route 
          path="/employees/new" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <EmployeeForm />
            </ProtectedRoute>
          } 
        />

        {/* Protected Payroll Engine Route (Admin & Manager Only) */}
        <Route 
          path="/payroll" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <PayrollDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/punch-in" replace />} />

      </Routes>
    </Router>
  );
}