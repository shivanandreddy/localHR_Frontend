import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center md:hidden">
        <span className="font-bold text-lg text-blue-600">LocalHR</span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-600 focus:outline-none"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col justify-between
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          <div className="p-5 text-xl font-bold tracking-wider text-blue-400 border-b border-slate-800">
            LocalHR <span className="text-xs text-slate-400 block">HR Operations</span>
          </div>
          <nav className="p-4 space-y-2">
            
            {/* Employee Portal / Dashboard Link */}
            <Link 
              to="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Employee Dashboard
            </Link>

            {/* <Link 
              to="/clock-in" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/clock-in') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Biometric Clock-In
            </Link> */}

            <Link 
              to="/employees" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/employees') || isActive('/employees/new') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Employees
            </Link>

            <Link 
              to="/payroll" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/payroll') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Payroll Engine
            </Link>

          </nav>
        </div>

        {/* Sidebar Footer / Logout Section */}
        <div className="p-4 border-t border-slate-800">
          {user && (
            <div className="mb-3 px-2 text-xs text-slate-400 truncate">
              Signed in as: <span className="font-semibold text-slate-200">{user.name || user.email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg font-medium transition text-sm border border-rose-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 px-8 items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {user ? `Welcome Back, ${user.name || 'User'}` : 'Welcome Back'}
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 capitalize">{user?.role || 'User Role'}</span>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}