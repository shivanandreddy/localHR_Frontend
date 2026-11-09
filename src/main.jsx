import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Initialize mobile console debugging tool
import eruda from 'eruda';
// eruda.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);