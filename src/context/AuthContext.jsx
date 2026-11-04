import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Ensure employeeId key is also available for direct checks
        const empId = parsedUser._id || parsedUser.id;
        if (empId) {
          localStorage.setItem('employeeId', empId);
        }
      } catch (err) {
        console.error("Failed to parse stored user profile", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('employeeId');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await API.post('/api/employees/login', { email, password });
      const { token, employee } = response.data;

      // Save token and user details to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(employee));
      
      const empId = employee._id || employee.id;
      if (empId) {
        localStorage.setItem('employeeId', empId);
      }

      setUser(employee);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('employeeId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};