import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { currentAccent } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shiftStart: '',
    shiftEnd: '',
    password: '',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/api/employees/profile');
      const emp = res.data.employee || res.data.data || res.data;
      
      setFormData({
        name: emp.name || '',
        email: emp.email || '',
        shiftStart: emp.shiftStart || '09:30',
        shiftEnd: emp.shiftEnd || '18:30',
        password: '', // Keep password field empty on load
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback to AuthContext user object if API request encounters an issue
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          shiftStart: user.shiftStart || '09:30',
          shiftEnd: user.shiftEnd || '18:30',
          password: '',
        });
      } else {
        setError(err.response?.data?.message || 'Could not load your profile details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const payload = { ...formData };
      // Omit empty password field if user didn't enter a new one
      if (!payload.password) {
        delete payload.password;
      }

      const res = await API.put('/api/employees/profile', payload);
      const updatedEmployee = res.data.employee || res.data.data || payload;

      // Instantly update global AuthContext & localStorage so UI (sidebar name, etc.) reflects changes
      if (updateUser) {
        updateUser({
          name: updatedEmployee.name,
          email: updatedEmployee.email,
          shiftStart: updatedEmployee.shiftStart,
          shiftEnd: updatedEmployee.shiftEnd,
        });
      }

      setSuccessMessage(res.data.message || 'Profile updated successfully!');
      setFormData((prev) => ({ ...prev, password: '' })); // clear password input after update
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 dark:text-slate-500 text-sm">
        Loading profile configuration...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${currentAccent.badge}`}>
          Account Settings
        </span>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your personal details, shift timings, and security credentials.
        </p>
      </div>

      {/* Status Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm rounded-2xl font-medium">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-2xl font-medium">
          {error}
        </div>
      )}

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-colors">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Shift Start */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
              Shift Start Time
            </label>
            <input
              type="time"
              name="shiftStart"
              value={formData.shiftStart}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Shift End */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
              Shift End Time
            </label>
            <input
              type="time"
              name="shiftEnd"
              value={formData.shiftEnd}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

        </div>

        {/* New Password Section */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
            New Password <span className="text-gray-400 font-normal lowercase">(leave blank to keep current)</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={updating}
            className={`py-3 px-6 ${currentAccent.primary} disabled:opacity-50 font-semibold rounded-2xl shadow-md transition-all text-sm flex items-center space-x-2 text-white`}
          >
            {updating ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}