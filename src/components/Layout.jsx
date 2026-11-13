import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Webhook } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, accent, setAccent, currentAccent } = useContext(ThemeContext);

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const accents = [
    { value: 'blue', color: 'bg-blue-600' },
    { value: 'orange', color: 'bg-orange-600' },
    { value: 'emerald', color: 'bg-emerald-600' },
    { value: 'violet', color: 'bg-violet-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Top Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center md:hidden">
        <Webhook />
        <span className={`font-bold text-lg ${currentAccent.text}`}>Esmart<span className='text-black dark:text-white'>HR</span></span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-600 dark:text-gray-300 focus:outline-none"
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
  fixed inset-y-0 left-0 z-50 w-64 h-screen sticky top-0 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col justify-between border-r border-slate-800 overflow-y-auto
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
        <div>
          <div className="px-5 py-4 border-b border-slate-800 grid grid-cols-[32px_1fr] items-center gap-x-3">
            {/* First Column */}
            <div className="row-span-2 flex items-center justify-center">
              <div className="relative inline-flex items-center justify-center flame-icon">
                <Webhook
                  size={30}
                  strokeWidth={2.5}
                  className={`${currentAccent.text} relative z-10 animate-spin`}
                />
              </div>
            </div>

            {/* Second Column - First Row */}
            <span className={`font-bold text-lg tracking-wider leading-tight ${currentAccent.text}`}>
              Esmart<span className="text-white">HR</span>
            </span>

            {/* Second Column - Second Row */}
            <span className="text-md text-slate-400 font-normal leading-tight">
              HR Operations
            </span>
          </div>

          <nav className="p-4 space-y-2">        
            {/* Employee Portal / Dashboard Link */}
            <Link 
              to="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/dashboard') ? currentAccent.primary : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>

            {/* Payslips Link */}
            <Link 
              to="/payslips" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/payslips') ? currentAccent.primary : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              My Payslips
            </Link>

            {/* Profile Link */}
            <Link 
              to="/profile" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/profile') ? currentAccent.primary : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
             Update Profile
            </Link>




            {/* NEW: Attendance Exception Requests Link - Visible to Admins & Managers */}
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <Link 
                to="/admin/attendance-requests" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                  isActive('/admin/attendance-requests') ? currentAccent.primary : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
               Requests
              </Link>
            )}

            {/* Employees Link - Visible to Admins Only */}
{user?.role === 'Admin' && (
  <Link 
    to="/employees" 
    onClick={() => setMobileMenuOpen(false)}
    className={`block px-4 py-2.5 rounded-lg font-medium transition ${
      isActive('/employees') || isActive('/employees/new') ? currentAccent.primary : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    Employees
  </Link>
)}


            {user?.role === 'Admin' && (
            <Link 
              to="/payroll" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/payroll') ? currentAccent.primary : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Payroll Engine
            </Link>
            )}



          </nav>
        </div>

        {/* Sidebar Footer / Theme Switcher & Logout Section */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          
          {/* Theme & Accent Controls */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Appearance</span>
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition text-[11px]"
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Accent</span>
              <div className="flex gap-1.5">
                {accents.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setAccent(item.value)}
                    className={`w-4 h-4 rounded-full ${item.color} ${
                      accent === item.value ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                    } transition-all`}
                  />
                ))}
              </div>
            </div>
          </div>

          {user && (
            <div className="px-1 text-xs text-slate-400 truncate">
              Signed in as: <span className="font-semibold text-slate-200">{user.name || user.email}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg font-medium transition text-sm border border-rose-500/20"
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
        {/* Dynamic Page Content Container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}