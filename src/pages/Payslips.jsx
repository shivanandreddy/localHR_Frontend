import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api'; // Import your configured Axios instance[cite: 1]
import { AuthContext } from '../context/AuthContext'; // Adjust import path based on your folder structure

export default function Payslips() {
  const { user } = useContext(AuthContext); // Extract logged-in employee details
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

      // Using your pre-configured API client (handles baseURL, token, & x-device-id automatically)[cite: 1]
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
      // Using API client for authenticated file download request[cite: 1]
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
      <div style={styles.centerContainer}>
        <div style={styles.spinner}>Loading your payroll records...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Salary & Payslips</h2>
          <p style={styles.subtitle}>View monthly breakdowns, attendance deductions, and download payslips.</p>
        </div>
        <div style={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Search month or slip ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {payslips.length === 0 && !error ? (
        <div style={styles.emptyState}>No payslips generated for your account yet.</div>
      ) : (
        <div style={styles.gridContainer}>
          {/* Left Column: Payslip History List */}
          <div style={styles.listCard}>
            <h3 style={styles.sectionTitle}>History</h3>
            <div style={styles.list}>
              {filteredPayslips.map((slip) => (
                <div 
                  key={slip.id}
                  onClick={() => setSelectedPayslip(slip)}
                  style={{
                    ...styles.listItem,
                    backgroundColor: selectedPayslip?.id === slip.id ? '#e0f2fe' : '#ffffff',
                    borderColor: selectedPayslip?.id === slip.id ? '#0284c7' : '#e2e8f0'
                  }}
                >
                  <div>
                    <span style={styles.listMonth}>{slip.pay_period_month}</span>
                    <span style={styles.listId}>{slip.reference_no || slip.id}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={styles.listNetPay}>₹{Number(slip.net_salary).toLocaleString()}</span>
                    <span style={styles.badge}>{slip.status || 'PAID'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Payslip Card */}
          <div style={styles.detailCard}>
            {selectedPayslip ? (
              <div>
                <div style={styles.detailHeader}>
                  <div>
                    <h3 style={styles.detailTitle}>Payslip - {selectedPayslip.pay_period_month}</h3>
                    <p style={styles.detailSub}>Ref: {selectedPayslip.reference_no || selectedPayslip.id}</p>
                  </div>
                  <button 
                    onClick={() => handleDownloadPDF(selectedPayslip.id)}
                    style={styles.downloadBtn}
                  >
                    Download PDF
                  </button>
                </div>

                <div style={styles.divider} />

                {/* Employee Quick Info */}
                <div style={styles.empInfoGrid}>
                  <div><strong>Employee Name:</strong> {user?.first_name} {user?.last_name}</div>
                  <div><strong>Designation:</strong> {user?.designation || 'Staff'}</div>
                  <div><strong>Worked Days:</strong> {selectedPayslip.present_days || 30} Days</div>
                  <div><strong>Lateness/Early Leaves:</strong> {selectedPayslip.late_count || 0} Records</div>
                </div>

                <div style={styles.breakdownGrid}>
                  {/* Earnings */}
                  <div style={styles.breakdownBox}>
                    <h4 style={styles.boxTitle}>Earnings</h4>
                    <div style={styles.row}>
                      <span>Basic Pay</span>
                      <span>₹{Number(selectedPayslip.basic_pay || 0).toLocaleString()}</span>
                    </div>
                    <div style={styles.row}>
                      <span>Allowances (HRA/DA)</span>
                      <span>₹{Number(selectedPayslip.allowances || 0).toLocaleString()}</span>
                    </div>
                    <div style={styles.row}>
                      <span>Incentives / Overtime</span>
                      <span>₹{Number(selectedPayslip.incentives || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ ...styles.row, ...styles.totalRow }}>
                      <span>Gross Salary</span>
                      <span>₹{Number(selectedPayslip.gross_salary || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div style={styles.breakdownBox}>
                    <h4 style={styles.boxTitle}>Deductions</h4>
                    <div style={styles.row}>
                      <span>Provident Fund (PF)</span>
                      <span>₹{Number(selectedPayslip.pf_deduction || 0).toLocaleString()}</span>
                    </div>
                    <div style={styles.row}>
                      <span>Professional Tax (PT)</span>
                      <span>₹{Number(selectedPayslip.pt_deduction || 0).toLocaleString()}</span>
                    </div>
                    <div style={styles.row}>
                      <span>Lateness / Attendance Deductions</span>
                      <span>₹{Number(selectedPayslip.attendance_deductions || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ ...styles.row, ...styles.totalRow }}>
                      <span>Total Deductions</span>
                      <span>₹{Number(selectedPayslip.total_deductions || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div style={styles.netPayBanner}>
                  <div>
                    <span style={styles.netLabel}>Net Take-Home Pay</span>
                    <span style={styles.payDate}>
                      Processed on {selectedPayslip.payment_date ? new Date(selectedPayslip.payment_date).toLocaleDateString() : 'End of Month'}
                    </span>
                  </div>
                  <span style={styles.netAmount}>₹{Number(selectedPayslip.net_salary || 0).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>Select a payslip from the list to view its complete breakdown.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    fontFamily: 'Inter, system-ui, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  searchBox: {
    minWidth: '240px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '24px',
    alignItems: 'start'
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 16px 0'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  listMonth: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600'
  },
  listId: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b'
  },
  listNetPay: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  badge: {
    fontSize: '11px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
  },
  detailSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  downloadBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '20px 0'
  },
  empInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    backgroundColor: '#f8fafc',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    border: '1px solid #f1f5f9'
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px'
  },
  breakdownBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e2e8f0'
  },
  boxTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#334155'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '10px',
    color: '#475569'
  },
  totalRow: {
    fontWeight: 'bold',
    borderTop: '1px solid #cbd5e1',
    paddingTop: '10px',
    marginTop: '10px',
    color: '#0f172a'
  },
  netPayBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '16px 20px',
    borderRadius: '8px'
  },
  netLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534'
  },
  payDate: {
    display: 'block',
    fontSize: '12px',
    color: '#15803d'
  },
  netAmount: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#15803d'
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px',
    color: '#64748b',
    fontSize: '14px'
  }
};