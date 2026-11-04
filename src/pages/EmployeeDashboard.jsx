import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ClockIn from '../components/ClockIn';

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [summary, setSummary] = useState({
    totalPresent: 0,
    totalLate: 0,
    totalEarly: 0,
    deductionDays: 0,
    estimatedDeduction: 0,
    netSalary: 0,
  });
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const employeeId = localStorage.getItem('employeeId');
      
      // 1. Fetch personal details & monthly attendance stats
      const [empRes, payrollRes, attendanceRes] = await Promise.all([
        API.get(`/api/employees/${employeeId}`),
        API.post('/api/payroll/calculate', {
          employeeId,
          month: currentMonth,
          year: currentYear,
        }),
        API.get(`/api/attendance/my-attendance?month=${currentMonth}&year=${currentYear}`),
      ]);

      setEmployee(empRes.data.employee || empRes.data);

      if (payrollRes.data?.payrollSummaries?.[0]) {
        const stats = payrollRes.data.payrollSummaries[0];
        setSummary({
          totalPresent: stats.totalPresentDays,
          totalLate: stats.totalLateDays,
          deductionDays: stats.deductionDaysApplied,
          estimatedDeduction: stats.totalDeductionAmount,
          netSalary: stats.netSalary,
        });
      }

      if (attendanceRes.data?.records) {
        setAttendanceLogs(attendanceRes.data.records);
        // Calculate total early goings from logs
        const earlyCount = attendanceRes.data.records.filter((r) => r.isEarlyGoing).length;
        setSummary((prev) => ({ ...prev, totalEarly: earlyCount }));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Could not load your performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-200 bg-blue-600/40 px-3 py-1 rounded-full">
            Employee Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Welcome back, {employee?.name || 'Employee'}! 👋
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            {employee?.email} • Shift: {employee?.shiftStart || '09:00'} - {employee?.shiftEnd || '18:00'}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
          <p className="text-xs text-blue-200 uppercase font-semibold">Current Month</p>
          <p className="text-lg font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline text-xs font-semibold">Retry</button>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Present Days */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Days Present</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-black text-gray-800">{summary.totalPresent} Days</p>
          <p className="text-[11px] text-gray-400">Active shift logs this month</p>
        </div>

        {/* Late Arrival Count */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Late Count</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-black text-amber-600">{summary.totalLate} Times</p>
          <p className="text-[11px] text-amber-600/80 font-medium">
            Rule: 3 Lates = 1 Day Penalty
          </p>
        </div>

        {/* Salary Deductions */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Deduction Penalty</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {summary.deductionDays} {summary.deductionDays === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-[11px] text-rose-500 font-medium">
            -₹{summary.estimatedDeduction.toLocaleString()}
          </p>
        </div>

        {/* Early Going Count */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Early Going</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{summary.totalEarly} Times</p>
          <p className="text-[11px] text-gray-400">Clocked out before shift end</p>
        </div>

      </div>

      {/* Main Content Layout: ClockIn Widget + Attendance Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Biometric Clock In / Clock Out Component */}
        <div className="lg:col-span-1 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <ClockIn />
        </div>

        {/* Right Column: Attendance Activity Logs Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">My Attendance Logs</h3>
              <p className="text-xs text-gray-500">Monthly record of your clock-in, clock-out, and late warnings</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Refresh Logs
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading attendance records...</div>
          ) : attendanceLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No attendance records found for this month yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="p-3.5 font-semibold rounded-l-xl">Date</th>
                    <th className="p-3.5 font-semibold">Clock In</th>
                    <th className="p-3.5 font-semibold">Clock Out</th>
                    <th className="p-3.5 font-semibold">Late Status</th>
                    <th className="p-3.5 font-semibold rounded-r-xl">Early Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {attendanceLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-gray-800">{log.date}</td>
                      <td className="p-3.5 text-gray-600">
                        {log.clockIn ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td className="p-3.5">
                        {log.isLate ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[10px]">
                            Late (+{log.lateMinutes}m)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold text-[10px]">
                            On Time
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {log.isEarlyGoing ? (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-semibold text-[10px]">
                            Early (-{log.earlyMinutes}m)
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}