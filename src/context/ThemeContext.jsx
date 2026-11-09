import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Load saved theme and accent from localStorage or use defaults
  const [theme, setTheme] = useState(() => localStorage.getItem('localhr_theme') || 'light');
  const [accent, setAccent] = useState(() => localStorage.getItem('localhr_accent') || 'blue');

  useEffect(() => {
    localStorage.setItem('localhr_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('localhr_accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Helper dictionary for accent color classes across components
  const accentClasses = {
    blue: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      ring: 'focus:ring-blue-500',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    orange: {
      primary: 'bg-orange-600 hover:bg-orange-700 text-white',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500',
      ring: 'focus:ring-orange-500',
      badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    },
    emerald: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500',
      ring: 'focus:ring-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    violet: {
      primary: 'bg-violet-600 hover:bg-violet-700 text-white',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500',
      ring: 'focus:ring-violet-500',
      badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent, currentAccent: accentClasses[accent] || accentClasses.blue }}>
      {children}
    </ThemeContext.Provider>
  );
}