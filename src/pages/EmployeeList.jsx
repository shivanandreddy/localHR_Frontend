// src/components/EmployeeList.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      const response = await API.get('/api/employees');
      setEmployees(response.data.employees);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleResetDevice = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reset the bound device for ${name}?`)) return;

    try {
      const response = await API.patch(`/api/employees/${id}/reset-device`);
      setMessage(response.data.message);
      fetchEmployees(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset device binding.');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading employees...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Directory</h1>
          <p className="text-sm text-gray-500">Manage staff profiles and device binding security locks</p>
        </div>
        <button
          onClick={() => window.location.href = '/employees/new'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors"
        >
          + Add Employee
        </button>
      </div>

      {message && <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200">{message}</div>}
      {error && <div className="p-3 bg-rose-50 text-rose-800 text-sm rounded-xl border border-rose-200">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Shift</th>
              <th className="p-4">Device Bound</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{emp.name}</td>
                <td className="p-4 text-gray-600">{emp.role}</td>
                <td className="p-4 text-gray-600">{emp.shiftStart} - {emp.shiftEnd}</td>
                <td className="p-4">
                  {emp.boundDeviceId ? (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Bound</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">Unbound</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleResetDevice(emp._id, emp.name)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Reset Device
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}