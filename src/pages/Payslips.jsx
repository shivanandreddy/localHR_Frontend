import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api'; 
import { AuthContext } from '../context/AuthContext'; 
import { ThemeContext } from '../context/ThemeContext';
import { FileText, Download, Search, AlertCircle, Calendar, User, Briefcase, Clock } from 'lucide-react';

export default function Payslips() {
  const { user } = useContext(AuthContext); 
  const { currentAccent } = useContext(ThemeContext);

  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayslips();
  }, [user]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);

      const employeeId = user?.employee_id || user?.id;
      if (!employeeId) {
        setLoading(false);
        return;
      }

      const response = await API.get(`/api/payroll/payslips?employee_id=${employeeId}`);
      
      const records = response.data.payslips || [];
      setPayslips(records);
      if (records.length > 0) {
        setSelectedPayslip(records[0]);
      }
    } catch (err) {
      console.error('Error loading payslips:', err.message);
      setError('Unable to load payslip records. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (payslipId) => {
    try {
      const response = await API.get(`/api/payroll/payslips/${payslipId}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${payslipId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err.message);
      alert('Could not download payslip PDF. Printing current view instead.');
      window.print();
    }
  };

  const filteredPayslips = payslips.filter(p => 
    p.pay_period_month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-400 dark:text-slate-500 text-sm">
        Loading your payroll records...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 transition-colors duration-200">
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${currentAccent.badge}`}>
            Payroll Portal
          </span>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">
            Salary & Payslips
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            View monthly breakdowns, attendance deductions, and download payslips.
          </p>
        </div>

        <div className="w-full md:w-72">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search month or slip ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-2xl font-medium flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {payslips.length === 0 && !error ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 text-sm">
          No payslips generated for your account yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Payslip History List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 px-1">
              History
            </h3>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredPayslips.map((slip) => {
                const isSelected = selectedPayslip?.id === slip.id;
                return (
                  <div 
                    key={slip.id}
                    onClick={() => setSelectedPayslip(slip)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 shadow-sm' 
                        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200/60 dark:border-slate-700/60 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {slip.pay_period_month}
                      </span>
                      <span className="block text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                        {slip.reference_no || slip.id}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-extrabold text-gray-900 dark:text-gray-100">
                        ₹{Number(slip.net_salary).toLocaleString()}
                      </span>
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        {slip.status || 'PAID'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Payslip Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
            {selectedPayslip ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      Payslip - {selectedPayslip.pay_period_month}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Ref: {selectedPayslip.reference_no || selectedPayslip.id}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDownloadPDF(selectedPayslip.id)}
                    className={`py-2.5 px-5 ${currentAccent.primary} text-white font-semibold rounded-xl shadow-md transition-all text-xs flex items-center space-x-2`}
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="h-[1px] bg-gray-100 dark:bg-slate-800 my-4" />

                {/* Employee Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs text-gray-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span><strong>Employee:</strong> {user?.first_name || user?.name} {user?.last_name || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-400" />
                    <span><strong>Designation:</strong> {user?.designation || 'Staff'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span><strong>Worked Days:</strong> {selectedPayslip.present_days || 30} Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span><strong>Lateness/Early Leaves:</strong> {selectedPayslip.late_count || 0} Records</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Earnings */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                      Earnings
                    </h4>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Basic Pay</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{Number(selectedPayslip.basic_pay || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allowances (HRA/DA)</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{Number(selectedPayslip.allowances || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Incentives / Overtime</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{Number(selectedPayslip.incentives || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between text-xs font-bold text-gray-900 dark:text-gray-100">
                      <span>Gross Salary</span>
                      <span>₹{Number(selectedPayslip.gross_salary || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                      Deductions
                    </h4>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Provident Fund (PF)</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{Number(selectedPayslip.pf_deduction || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Tax (PT)</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{Number(selectedPayslip.pt_deduction || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attendance Deductions</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{Number(selectedPayslip.attendance_deductions || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                      <span>Total Deductions</span>
                      <span>₹{Number(selectedPayslip.total_deductions || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-5 rounded-2xl gap-4">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Net Take-Home Pay
                    </span>
                    <span className="block text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                      Processed on {selectedPayslip.payment_date ? new Date(selectedPayslip.payment_date).toLocaleDateString() : 'End of Month'}
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    ₹{Number(selectedPayslip.net_salary || 0).toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-gray-400 dark:text-slate-500 text-sm">
                Select a payslip from the list to view its complete breakdown.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}