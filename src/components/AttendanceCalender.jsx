import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';

export default function AttendanceCalendar() {
  const { currentAccent } = useContext(ThemeContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  useEffect(() => {
    fetchMonthAttendance();
  }, [currentDate]);

  const fetchMonthAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/api/attendance/my-attendance?month=${month}&year=${year}`);
      const records = response.data?.records || [];
      
      const map = {};
      records.forEach((record) => {
        const dayNum = new Date(record.date).getDate();
        map[dayNum] = record;
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error('Failed to load monthly attendance:', err);
      setError(err.response?.data?.message || 'Could not fetch monthly calendar logs.');
    } finally {
      setLoading(false);
    }
  };

  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-3 transition-colors">
      
      {/* Compact Header & Month Navigation Controls */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
            {monthNames[month - 1]} {year}
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-slate-400">Monthly attendance overview</p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            title="Previous Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            Today
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            title="Next Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchMonthAttendance} className="underline text-[11px] font-semibold">Retry</button>
        </div>
      )}

      {/* Calendar Grid Container */}
      <div>
        
        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 dark:text-slate-500 text-xs">Loading calendar grid...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            
            {/* Blank padding cells */}
            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10 bg-gray-50/30 dark:bg-slate-950/20 rounded-xl opacity-30"></div>
            ))}

            {/* Actual Days of the Month */}
            {Array.from({ length: totalDaysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const record = attendanceMap[dayNum];
              
              let statusBg = 'bg-gray-50 dark:bg-slate-800/30 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-300';
              let badgeText = null;

              if (record) {
                if (record.isLate) {
                  statusBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
                  badgeText = `Late`;
                } else if (record.clockIn) {
                  statusBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300';
                  badgeText = 'Present';
                }
              }

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-11 p-1.5 rounded-xl border flex flex-col justify-between transition-all ${statusBg}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold leading-none">{dayNum}</span>
                    {record?.isEarlyGoing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Early Going"></span>
                    )}
                  </div>

                  <div className="text-center">
                    {badgeText ? (
                      <span className="text-[9px] font-semibold block truncate leading-tight">
                        {badgeText}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-400 dark:text-slate-600 block leading-tight">--</span>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* Compact Legend */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-center text-[11px] text-gray-500 dark:text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Present</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Late</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Early</span>
          </div>
        </div>

      </div>

    </div>
  );
}