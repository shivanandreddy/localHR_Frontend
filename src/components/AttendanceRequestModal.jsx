import React, { useState, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { Send, X } from 'lucide-react';

export default function AttendanceRequestModal({ dateStr, initialRecord, onClose, onSuccess }) {
  const { currentAccent } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    requestType: initialRecord?.exceptionRequest?.requestType || 'Late Arrival',
    date: dateStr || new Date().toISOString().split('T')[0],
    reason: initialRecord?.exceptionRequest?.reason || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await API.post('/api/attendance/request', formData);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Request for Exception
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Date: {formData.date}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
              Request Type
            </label>
            <select
              value={formData.requestType}
              onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="Late Arrival">Late Arrival</option>
              <option value="Early Departure">Early Departure</option>
              <option value="Half-Day">Half-Day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">
              Reason / Comment
            </label>
            <textarea
              rows="3"
              placeholder="Explain why you need this approval..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className={`px-6 py-2.5 ${currentAccent.primary} text-white text-sm font-semibold rounded-xl shadow-md flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition`}
            >
              <Send size={14} />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}