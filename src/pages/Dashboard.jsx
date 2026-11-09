import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import AttendanceCalendar from '../components/AttendanceCalender';

export default function Dashboard() {
  const { currentAccent } = useContext(ThemeContext);

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 transition-colors">
      
      {/* Header Banner - Dynamically Responsive to Theme Accent */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors border border-transparent dark:border-slate-800 ${currentAccent.primary.split(' ')[0]} dark:bg-slate-900`}>
        <div>
         
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white">
            Hi, {employee?.name}! 👋
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            {employee?.email} • Shift: {employee?.shiftStart || '09:00'} - {employee?.shiftEnd || '18:00'}
          </p>
        </div>
        <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 dark:border-slate-700 text-right">
          <p className="text-xs text-white/80 uppercase font-semibold">Current Month</p>
          <p className="text-lg font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-2xl flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline text-xs font-semibold">Retry</button>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Present Days */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
          <div className="flex justify-between items-center text-gray-400 dark:text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Days Present</span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>
          <p className="text-xl   font-black text-green-800 dark:text-green-500 ">{summary.totalPresent} Days</p>
          <p className="text-[11px] text-green-400 dark:text-green-500 font-medium">Active shift logs this month</p>
        </div>

        {/* Late Arrival Count */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
          <div className="flex justify-between items-center text-gray-400 dark:text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Late Count</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">{summary.totalLate} Times</p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
            Rule: 3 Lates = 1 Day Penalty
          </p>
        </div>

        {/* Salary Deductions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
          <div className="flex justify-between items-center text-gray-400 dark:text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Deduction Penalty</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400">
            {summary.deductionDays} {summary.deductionDays === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
            -₹{summary.estimatedDeduction.toLocaleString()}
          </p>
        </div>

        {/* Early Going Count */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
          <div className="flex justify-between items-center text-gray-400 dark:text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Early Going</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{summary.totalEarly} Times</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">Clocked out before shift end</p>
        </div>

      </div>

      {/* Main Content Layout: Attendance Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column Verification Status Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-3 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center transition-colors">
          <div className={`p-4 rounded-2xl mb-3 ${currentAccent.badge}`}>
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Real-time Verification Active</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Your facial recognition and GPS geofence checks are fully synchronized with company policy.</p>
        </div>

        {/* Right Column: Attendance Activity Logs Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
         <AttendanceCalendar/>

          
        </div>

      </div>

    </div>
  );
}