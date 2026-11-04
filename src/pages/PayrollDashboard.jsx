import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function PayrollDashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employee list for dropdown on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get('/api/employees');
        if (res.data.success) {
          setEmployees(res.data.employees);
        }
      } catch (err) {
        console.error("Failed to load employee list:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        month: Number(month),
        year: Number(year),
        employeeId: selectedEmployee
      };

      const response = await API.post('/api/payroll/calculate', payload);
      setPayrollData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate payroll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payroll Calculation Engine</h1>
        <p className="text-sm text-gray-500">Compute monthly salaries based on attendance, late arrivals, and 3-late-days deduction rules</p>
      </div>

      <form onSubmit={handleCalculatePayroll} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Month (1-12)</label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Employee Filter</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Employees (Batch Calculation)</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md disabled:opacity-55"
        >
          {loading ? 'Calculating...' : 'Run Payroll'}
        </button>
      </form>

      {error && <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200">{error}</div>}

      {payrollData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">Payroll Summary for {payrollData.month}</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              Total Staff: {payrollData.count}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Basic Salary</th>
                  <th className="p-4 font-semibold">Present Days</th>
                  <th className="p-4 font-semibold">Late Days</th>
                  <th className="p-4 font-semibold">Deduction (Days)</th>
                  <th className="p-4 font-semibold">Deduction (₹)</th>
                  <th className="p-4 font-semibold text-emerald-700">Net Payout (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {payrollData.payrollSummaries.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{item.employeeName}</p>
                      <p className="text-xs text-gray-500">{item.employeeEmail}</p>
                    </td>
                    <td className="p-4 font-medium">₹{item.basicSalary.toLocaleString()}</td>
                    <td className="p-4">{item.totalPresentDays}</td>
                    <td className="p-4 text-amber-600 font-medium">{item.totalLateDays}</td>
                    <td className="p-4 text-rose-600 font-medium">{item.deductionDaysApplied} days</td>
                    <td className="p-4 text-rose-600">₹{item.totalDeductionAmount}</td>
                    <td className="p-4 font-bold text-emerald-600">₹{item.netSalary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}