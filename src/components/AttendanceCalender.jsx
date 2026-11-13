import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { PlusCircle } from 'lucide-react';
import AttendanceRequestModal from './AttendanceRequestModal'; // <--- IMPORT HERE

export default function AttendanceCalendar() {
  const { currentAccent } = useContext(ThemeContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

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
        let dayNum;
        if (record.date && typeof record.date === 'string' && record.date.includes('-')) {
          dayNum = parseInt(record.date.split('-')[2], 10);
        } else {
          dayNum = new Date(record.date).getDate();
        }
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

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

  const handleDayClick = (dayNum) => {
    const record = attendanceMap[dayNum] || null;
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    setSelectedDayRecord({
      dayNum,
      dateStr: formattedDate,
      record,
    });
    setIsModalOpen(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative space-y-3 transition-colors">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap justify-between items-center pb-2 gap-2 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
            {monthNames[month - 1]} {year}
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-slate-400">Monthly overview (Click day cell to request exception)</p>
        </div>

        <div className="flex items-center space-x-2">
          

          <div className="flex items-center space-x-1">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              ‹
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{day}</div>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 dark:text-slate-500 text-xs">Loading calendar grid...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10 bg-gray-50/30 dark:bg-slate-950/20 rounded-xl opacity-30"></div>
            ))}

            {Array.from({ length: totalDaysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const record = attendanceMap[dayNum];
              
              let statusBg = 'bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:border-blue-500';
              let badgeText = null;

              if (record) {
                if (record.isLate) {
                  statusBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:border-amber-400';
                  badgeText = `Late`;
                } else if (record.clockIn) {
                  statusBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400';
                  badgeText = 'Present';
                }
              }

              return (
                <button
                  type="button"
                  key={`day-${dayNum}`}
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-11 p-1.5 rounded-xl border flex flex-col justify-between transition-all text-left w-full cursor-pointer select-none ${statusBg}`}
                >
                  <div className="flex justify-between items-center w-full pointer-events-none">
                    <span className="text-[11px] font-bold leading-none">{dayNum}</span>
                    {record?.isEarlyGoing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Early Going"></span>
                    )}
                  </div>
                  <div className="text-center w-full pointer-events-none">
                    <span className="text-[9px] font-semibold block truncate leading-tight">
                      {badgeText || '--'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RENDER MODAL COMPONENT HERE */}
      {isModalOpen && selectedDayRecord && (
        <AttendanceRequestModal
          dateStr={selectedDayRecord.dateStr}
          initialRecord={selectedDayRecord.record}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchMonthAttendance()}
        />
      )}

    </div>
  );
}