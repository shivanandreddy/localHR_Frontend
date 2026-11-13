import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';

export default function AdminAttendanceRequests() {
  const { currentAccent } = useContext(ThemeContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [adminComments, setAdminComments] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/api/attendance/requests');
      setRequests(response.data?.requests || []);
    } catch (err) {
      console.error('Failed to fetch admin attendance requests:', err);
      setError(err.response?.data?.message || 'Could not load employee requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (attendanceId, newStatus) => {
    try {
      const adminComment = adminComments[attendanceId] || '';
      await API.put(`/api/attendance/request/${attendanceId}`, {
        status: newStatus,
        adminComment,
      });

      // Refresh list after successful update
      fetchRequests();
    } catch (err) {
      console.error('Failed to update request:', err);
      alert(err.response?.data?.message || 'Failed to update request status.');
    }
  };

  // Filter requests based on status tab
  const filteredRequests = requests.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.exceptionRequest?.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 transition-colors">
      
      {/* Header Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${currentAccent.primary.split(' ')[0]} dark:bg-slate-900`}>
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-3 py-1 rounded-full">
            Admin Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white">
            Attendance Exception Management 📋
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Review, approve, or reject employee late arrival, early departure, and leave requests.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="bg-white/10 dark:bg-slate-800/80 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-semibold transition"
        >
          Refresh List
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-2xl flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchRequests} className="underline text-xs font-semibold">Retry</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filterStatus === status
                ? `${currentAccent.primary} text-white shadow-md`
                : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            {status} Requests
          </button>
        ))}
      </div>

      {/* Requests List Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-xs">
            Loading employee exception requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-xs">
            No {filterStatus.toLowerCase() !== 'all' ? filterStatus.toLowerCase() : ''} exception requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((item) => {
              const req = item.exceptionRequest || {};
              const emp = item.employeeId || {};
              const isPending = req.status === 'Pending';

              return (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 space-y-3 transition-all"
                >
                  {/* Top Row: Employee & Request Type */}
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                        {emp.name || 'Unknown Employee'} 
                        <span className="text-xs font-normal text-gray-400 ml-1.5">({emp.email || 'No email'})</span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        Date: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.date}</span> • Type: <span className="font-semibold text-blue-600 dark:text-blue-400">{req.requestType}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      req.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Reason Box */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 text-xs text-gray-600 dark:text-slate-300 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Employee Reason:</span>
                    <p>{req.reason || 'No reason provided.'}</p>
                  </div>

                  {/* Action Controls for Pending Requests */}
                  {isPending ? (
                    <div className="pt-2 space-y-3 border-t border-gray-200/60 dark:border-slate-700/60">
                      <input
                        type="text"
                        placeholder="Add optional admin review comment..."
                        value={adminComments[item._id] || ''}
                        onChange={(e) => setAdminComments({ ...adminComments, [item._id]: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleReviewAction(item._id, 'Rejected')}
                          className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold rounded-xl hover:bg-rose-100 transition flex items-center gap-1.5"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleReviewAction(item._id, 'Approved')}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    req.adminComment && (
                      <div className="text-[11px] text-gray-400 dark:text-slate-500 italic pt-1">
                        Admin Note: "{req.adminComment}"
                      </div>
                    )
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}