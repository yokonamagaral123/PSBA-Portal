import React, { useState, useEffect, useCallback } from 'react';
import PayrollSidebar from './PayrollSidebar';
import './PayrollSidebar.css';
import './PayrollRecord.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePayrollData } from './PayrollDataContext';

// Import pay period options from PayrollComputation for consistency
const payPeriodOptions = [
  // 2025
  'May 1–15, 2025',
  'May 16–31, 2025',
  'June 1–15, 2025',
  'June 16–30, 2025',
  'July 1–15, 2025',
  'July 16–31, 2025',
  'August 1–15, 2025',
  'August 16–31, 2025',
  'September 1–15, 2025',
  'September 16–30, 2025',
  'October 1–15, 2025',
  'October 16–31, 2025',
  'November 1–15, 2025',
  'November 16–30, 2025',
  'December 1–15, 2025',
  'December 16–31, 2025',
  // 2026
  'January 1–15, 2026',
  'January 16–31, 2026',
  'February 1–15, 2026',
  'February 16–28, 2026',
  'March 1–15, 2026',
  'March 16–31, 2026',
  'April 1–15, 2026',
  'April 16–30, 2026',
  'May 1–15, 2026',
  'May 16–31, 2026',
  'June 1–15, 2026',
  'June 16–30, 2026',
  'July 1–15, 2026',
  'July 16–31, 2026',
  'August 1–15, 2026',
  'August 16–31, 2026',
  'September 1–15, 2026',
  'September 16–30, 2026',
  'October 1–15, 2026',
  'October 16–31, 2026',
  'November 1–15, 2026',
  'November 16–30, 2026',
  'December 1–15, 2026',
  'December 16–31, 2026',
  'Custom...'
];

function getCutoffDates(payPeriod) {
  // Extract start and end date from pay period string
  // e.g. 'May 1–15, 2025' => { start: '2025-05-01', end: '2025-05-15' }
  const match = payPeriod.match(/([A-Za-z]+) (\d+)[–-](\d+), (\d{4})/);
  if (!match) return null;
  const [, monthStr, startDay, endDay, year] = match;
  const month = new Date(`${monthStr} 1, ${year}`).getMonth() + 1;
  const pad = n => n.toString().padStart(2, '0');
  return {
    start: `${year}-${pad(month)}-${pad(startDay)}`,
    end: `${year}-${pad(month)}-${pad(endDay)}`
  };
}

// Helper to get only admin-approved overtime details for use in PayrollComputation
// This must be defined at the top level for export
export const getApprovedOvertimeDetails = (overtimeDetails, approvedOvertime, getMatchingOvertimeRequisition) => {
  return overtimeDetails.filter(o => {
    const key = o.date + '-' + o.actual;
    return approvedOvertime[key] && getMatchingOvertimeRequisition(o);
  });
};

const PayrollRecord = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const employee = location.state?.employee;
  const [payPeriod, setPayPeriod] = useState(payPeriodOptions[0]);
  const [daysWorked, setDaysWorked] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [lateMins, setLateMins] = useState(0);
  const [undertimeMins, setUndertimeMins] = useState(0);
  const [overtimeMins, setOvertimeMins] = useState(0);
  const [expanded, setExpanded] = useState({ late: false, undertime: false, overtime: false });
  const [lateDetails, setLateDetails] = useState([]);
  const [undertimeDetails, setUndertimeDetails] = useState([]);
  const [overtimeDetails, setOvertimeDetails] = useState([]);
  const [approvedOvertime, setApprovedOvertime] = useState({});
  const [requisitionOvertimeMap, setRequisitionOvertimeMap] = useState({});
  const [requisitionPopover, setRequisitionPopover] = useState({});
  const [approvedOvertimePay, setApprovedOvertimePay] = useState(0);
  const [pendingApproval, setPendingApproval] = useState({}); // Track pending approvals
  const hourlyRate = 12500 / 80; // e.g., 12,500 per cutoff, 80 hours per cutoff

  // Use context for shared state
  const {
    setApprovedOvertime: setContextApprovedOvertime,
    setOvertimeDetails: setContextOvertimeDetails,
    getMatchingOvertimeRequisition: contextGetMatchingOvertimeRequisition,
    setGetMatchingOvertimeRequisition
  } = usePayrollData();

  // After defining getMatchingOvertimeRequisition, set it in context
  useEffect(() => {
    setGetMatchingOvertimeRequisition(() => contextGetMatchingOvertimeRequisition);
  }, [contextGetMatchingOvertimeRequisition, setGetMatchingOvertimeRequisition]);

  // Sync context with employee and pay period
  useEffect(() => {
    setContextOvertimeDetails(overtimeDetails);
    setContextApprovedOvertime(approvedOvertime);
  }, [employee, payPeriod, overtimeDetails, approvedOvertime, setContextOvertimeDetails, setContextApprovedOvertime]);

  // When overtimeDetails changes, update context
  useEffect(() => {
    setContextOvertimeDetails(overtimeDetails);
  }, [overtimeDetails, setContextOvertimeDetails]);

  // When approvedOvertime changes, update context (already using setApprovedOvertime)
  useEffect(() => {
    setContextApprovedOvertime(approvedOvertime);
  }, [approvedOvertime, setContextApprovedOvertime]);

  // Helper to convert HH:MM or HH:MM:SS to minutes
  const toMinutes = t => {
    if (!t) return 0;
    const [h, m, s] = t.split(":").map(Number);
    return h * 60 + m + (s ? s / 60 : 0);
  };

  // Helper to format minutes as 'X hr Y min' or just 'Y min'
  const formatHoursMins = mins => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return `${h} hr${h > 1 ? 's' : ''}${m > 0 ? ` ${m} min${m > 1 ? 's' : ''}` : ''}`;
    }
    return `${Math.round(mins)} min${Math.round(mins) !== 1 ? 's' : ''}`;
  };

  // Fetch employee schedule on mount
  useEffect(() => {
    if (!employee) return;
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`/api/employee/details/${employee.employeeID}`);
        setSchedule(res.data.employee?.schedule || null);
      } catch {
        setSchedule(null);
      }
    };
    fetchSchedule();
  }, [employee]);

  // Fetch attendance for employee for selected cutoff
  useEffect(() => {
    if (!employee || !schedule) return;
    const cutoff = getCutoffDates(payPeriod);
    if (!cutoff) return;
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`/api/attendance?empID=${employee.employeeID}&start=${cutoff.start}&end=${cutoff.end}`);
        const attendanceArr = res.data || [];
        // Count unique days worked in this cutoff
        const workedDates = new Set(attendanceArr.map(a => a.date));
        setDaysWorked(workedDates.size);
        // Calculate total scheduled working days in cutoff period
        const start = new Date(cutoff.start);
        const end = new Date(cutoff.end);
        let totalDays = 0;
        let late = 0, undertime = 0, overtime = 0;
        // For breakdowns:
        const lateArr = [];
        const undertimeArr = [];
        const overtimeArr = [];
        // Group attendance by date
        const grouped = {};
        attendanceArr.forEach(a => {
          if (!grouped[a.date]) grouped[a.date] = [];
          grouped[a.date].push(a);
        });
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          const sched = schedule?.[dayName];
          if (sched && sched.start && sched.end && sched.start !== 'REST' && sched.end !== 'DAY') {
            totalDays++;
            const dateStr = d.toISOString().slice(0, 10);
            const records = grouped[dateStr] || [];
            if (records.length) {
              // Sort by time
              const sorted = [...records].sort((x, y) => toMinutes(x.time) - toMinutes(y.time));
              const first = sorted[0];
              const last = sorted[sorted.length - 1];
              const schedStart = toMinutes(sched.start);
              const schedEnd = toMinutes(sched.end);
              const inMins = toMinutes(first.time);
              const outMins = toMinutes(last.time);
              // Late
              if (inMins > schedStart + 5) {
                late += inMins - schedStart;
                lateArr.push({ date: dateStr, scheduled: sched.start, actual: first.time, mins: inMins - schedStart });
              }
              // Undertime
              if (outMins < schedEnd) {
                undertime += schedEnd - outMins;
                undertimeArr.push({ date: dateStr, scheduled: sched.end, actual: last.time, mins: schedEnd - outMins });
              }
              // Overtime
              if (outMins > schedEnd + 5) {
                overtime += outMins - schedEnd;
                overtimeArr.push({ date: dateStr, scheduled: sched.end, actual: last.time, mins: outMins - schedEnd });
              }
            }
          }
        }
        setAbsentDays(Math.max(totalDays - workedDates.size, 0));
        setLateMins(late);
        setUndertimeMins(undertime);
        setOvertimeMins(overtime);
        setLateDetails(lateArr);
        setUndertimeDetails(undertimeArr);
        setOvertimeDetails(overtimeArr);
      } catch {
        setDaysWorked(0);
        setAbsentDays(0);
        setLateMins(0);
        setUndertimeMins(0);
        setOvertimeMins(0);
        setLateDetails([]);
        setUndertimeDetails([]);
        setOvertimeDetails([]);
      }
    };
    fetchAttendance();
  }, [employee, payPeriod, schedule]);

  // Fetch overtime requisitions for this employee and cutoff
  useEffect(() => {
    if (!employee) return;
    const fetchOvertimeRequisitions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setRequisitionOvertimeMap({});
          return;
        }
        const res = await axios.get(`/api/requisitions/all?employeeID=${employee.employeeID}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allReqs = res.data.requisitions || [];
        // Only keep overtime requests for this cutoff
        const cutoff = getCutoffDates(payPeriod);
        if (!cutoff) return;
        // Accept if HR or supervisor has approved (hrApprovalStatus === 'approved')
        const overtimeReqs = allReqs.filter(r =>
          (r.type === 'Overtime' || r.type === 'Official Business') &&
          r.category === 'Overtime' &&
          r.hrApprovalStatus === 'approved' &&
          r.startDate && r.endDate &&
          new Date(r.startDate) <= new Date(cutoff.end) &&
          new Date(r.endDate) >= new Date(cutoff.start)
        );
        // Map by date for quick lookup
        const map = {};
        overtimeReqs.forEach(r => {
          let d = new Date(r.startDate);
          const end = new Date(r.endDate);
          while (d <= end) {
            const dateStr = d.toISOString().slice(0, 10);
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(r);
            d.setDate(d.getDate() + 1);
          }
        });
        setRequisitionOvertimeMap(map);
      } catch {
        setRequisitionOvertimeMap({});
      }
    };
    fetchOvertimeRequisitions();
  }, [employee, payPeriod]);

  // Update tick box to only mark as pending approval
  const handleTickBox = (checked, key) => {
    setPendingApproval(prev => ({ ...prev, [key]: checked }));
  };

  // Approve all checked overtime entries for this cutoff
  const handleApproveAll = async () => {
    const updates = Object.entries(pendingApproval)
      .filter(([key, val]) => val)
      .map(([key]) => {
        // Find the overtime entry and its requisition
        const o = overtimeDetails.find(ot => (ot.date + '-' + ot.actual) === key);
        const req = o && getMatchingOvertimeRequisition(o);
        return req ? { reqId: req._id, key } : null;
      })
      .filter(Boolean);
    // Update backend and context
    for (const { reqId } of updates) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/requisitions/update/${reqId}`, { status: 'approved' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Optionally show error
      }
    }
    // Update approvedOvertime context for these keys
    const newApproved = { ...approvedOvertime };
    updates.forEach(({ key }) => { newApproved[key] = true; });
    setApprovedOvertime(newApproved);
    setPendingApproval({}); // reset pending
    // Also update context
    setContextApprovedOvertime(newApproved);
    // Navigate to PayrollComputation
    navigate('/payroll-management/payroll-computation', { state: { employee, payPeriod } });
  };

  // Helper: check if an overtime entry is covered by a requisition
  const getMatchingOvertimeRequisition = useCallback((overtimeEntry) => {
    // Normalize date to YYYY-MM-DD for both overtimeEntry and requisition
    const normalizeDate = (date) => {
      if (!date) return '';
      // Accepts 'YYYY-MM-DD', 'M/D/YYYY', 'MM/DD/YYYY', etc.
      const d = new Date(date);
      if (isNaN(d)) return date;
      return d.toISOString().slice(0, 10);
    };
    // Normalize time to HH:mm (ignore seconds)
    const normalizeTime = (time) => {
      if (!time) return '';
      // Accepts 'HH:mm', 'HH:mm:ss', 'H:mm', etc.
      const [h, m] = time.split(':');
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    };
    // Try to match by date, but also try all possible date formats from the requisition
    const overtimeDate = normalizeDate(overtimeEntry.date);
    // Flatten all requisitions for all dates that match this day (in case of format mismatch)
    const allReqs = Object.keys(requisitionOvertimeMap).reduce((arr, key) => {
      if (normalizeDate(key) === overtimeDate) {
        arr.push(...requisitionOvertimeMap[key]);
      }
      return arr;
    }, []);
    // Try to match by time (ignore seconds)
    // DEBUG: Log all requisitions and the overtime entry for this date
    console.log('DEBUG OVERTIME MATCH', {
      overtimeEntry,
      allReqs,
      overtimeDate,
      times: allReqs.map(r => r.time),
      actual: overtimeEntry.actual
    });
    return allReqs.find(r => {
      if (!r.time || !overtimeEntry.actual) return false;
      return normalizeTime(r.time) === normalizeTime(overtimeEntry.actual);
    });
  }, [requisitionOvertimeMap]);

  // Recalculate approved overtime minutes and pay when checkboxes or details change
  useEffect(() => {
    let totalPay = 0;
    overtimeDetails.forEach(o => {
      const key = o.date + '-' + o.actual;
      if (approvedOvertime[key]) {
        // Find matching requisition for multiplier
        const req = getMatchingOvertimeRequisition(o);
        const multiplier = req && req.multiplier ? parseFloat(req.multiplier) : 1.25;
        totalPay += (o.mins / 60) * hourlyRate * multiplier;
      }
    });
    setApprovedOvertimePay(totalPay);
  }, [approvedOvertime, overtimeDetails, getMatchingOvertimeRequisition, hourlyRate]);

  return (
    <div className="payroll-management-layout">
      <PayrollSidebar />
      <div className="payroll-management-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
        {employee ? (
          <div className="employee-info-horizontal" style={{ maxWidth: 700, margin: '0 auto' }}>
            <span><strong>Employee ID:</strong> {employee.employeeID}</span>
            <span className="employee-info-separator">|</span>
            <span><strong>Name:</strong> {employee.firstName} {employee.middleName} {employee.lastName}</span>
            <span className="employee-info-separator">|</span>
            <span><strong>Department:</strong> {employee.department}</span>
          </div>
        ) : (
          <div className="employee-info">No employee selected.</div>
        )}
        <h1 style={{marginBottom: 18, textAlign: 'center'}}>Payroll Record</h1>
        <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          <strong>Cutoff Period:</strong>
          <select value={payPeriod} onChange={e => setPayPeriod(e.target.value)} style={{ fontWeight: 600, color: '#1976d2', border: 'none', background: 'transparent' }}>
            {payPeriodOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="payroll-record-card" style={{ margin: '32px auto', width: '100%', maxWidth: 520 }}>
          <div className="payroll-record-header">Attendance Summary</div>
          <div className="payroll-record-section-title">Cutoff Period</div>
          <div className="payroll-record-row">
            <span className="payroll-record-label">{payPeriod}</span>
            <span className="payroll-record-value"></span>
          </div>
          <div className="payroll-record-section-title">Summary</div>
          <div className="payroll-record-row">
            <span className="payroll-record-label">Days Worked</span>
            <span className="payroll-record-value">{daysWorked}</span>
          </div>
          <div className="payroll-record-row">
            <span className="payroll-record-label">Absent Days</span>
            <span className="payroll-record-absent">{absentDays}</span>
          </div>
          <div className="payroll-record-row payroll-record-expandable" style={{ position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', minHeight: 32 }}>
              <span className="payroll-record-label" onClick={() => setExpanded(e => ({ ...e, late: !e.late }))} style={{ cursor: lateDetails.length ? 'pointer' : 'default', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                Late {lateDetails.length > 0 && <span style={{ fontSize: 14, color: '#1976d2', marginLeft: 4, transition: 'transform 0.2s', transform: expanded.late ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>}
              </span>
              <span className="payroll-record-late" style={{ marginLeft: 8 }}>{formatHoursMins(lateMins)}</span>
            </div>
            <div
              className={`payroll-record-dropdown-anim${expanded.late && lateDetails.length > 0 ? ' open' : ''}`}
              style={{ overflow: 'hidden', transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s', maxHeight: expanded.late && lateDetails.length > 0 ? 400 : 0, opacity: expanded.late && lateDetails.length > 0 ? 1 : 0, marginTop: expanded.late && lateDetails.length > 0 ? 8 : 0 }}
            >
              {lateDetails.length > 0 && (
                <div style={{overflowX:'auto'}}>
                  <table className="payroll-record-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f6f9fc' }}>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Scheduled In</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Actual In</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Minutes Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lateDetails.map((l, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '6px 12px' }}>{l.date}</td>
                          <td style={{ padding: '6px 12px' }}>{l.scheduled}</td>
                          <td style={{ padding: '6px 12px' }}>{l.actual}</td>
                          <td style={{ padding: '6px 12px', color: '#d32f2f', fontWeight: 600 }}>{l.mins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="payroll-record-row payroll-record-expandable" style={{ position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', minHeight: 32 }}>
              <span className="payroll-record-label" onClick={() => setExpanded(e => ({ ...e, undertime: !e.undertime }))} style={{ cursor: undertimeDetails.length ? 'pointer' : 'default', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                Undertime {undertimeDetails.length > 0 && <span style={{ fontSize: 14, color: '#1976d2', marginLeft: 4, transition: 'transform 0.2s', transform: expanded.undertime ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>}
              </span>
              <span className="payroll-record-undertime" style={{ marginLeft: 8 }}>{formatHoursMins(undertimeMins)}</span>
            </div>
            <div
              className={`payroll-record-dropdown-anim${expanded.undertime && undertimeDetails.length > 0 ? ' open' : ''}`}
              style={{ overflow: 'hidden', transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s', maxHeight: expanded.undertime && undertimeDetails.length > 0 ? 400 : 0, opacity: expanded.undertime && undertimeDetails.length > 0 ? 1 : 0, marginTop: expanded.undertime && undertimeDetails.length > 0 ? 8 : 0 }}
            >
              {undertimeDetails.length > 0 && (
                <div style={{overflowX:'auto'}}>
                  <table className="payroll-record-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f6f9fc' }}>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Scheduled Out</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Actual Out</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Minutes Undertime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {undertimeDetails.map((u, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '6px 12px' }}>{u.date}</td>
                          <td style={{ padding: '6px 12px' }}>{u.scheduled}</td>
                          <td style={{ padding: '6px 12px' }}>{u.actual}</td>
                          <td style={{ padding: '6px 12px', color: '#f9a825', fontWeight: 600 }}>{u.mins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="payroll-record-row payroll-record-expandable" style={{ position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', minHeight: 32 }}>
              <span className="payroll-record-label" onClick={() => setExpanded(e => ({ ...e, overtime: !e.overtime }))} style={{ cursor: overtimeDetails.length ? 'pointer' : 'default', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                Overtime {overtimeDetails.length > 0 && <span style={{ fontSize: 14, color: '#1976d2', marginLeft: 4, transition: 'transform 0.2s', transform: expanded.overtime ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>}
              </span>
              <span className="payroll-record-overtime" style={{ marginLeft: 8 }}>{formatHoursMins(overtimeMins)}</span>
            </div>
            <div
              className={`payroll-record-dropdown-anim${expanded.overtime && overtimeDetails.length > 0 ? ' open' : ''}`}
              style={{ overflowY: 'auto', transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s', maxHeight: expanded.overtime && overtimeDetails.length > 0 ? 400 : 0, opacity: expanded.overtime && overtimeDetails.length > 0 ? 1 : 0, marginTop: expanded.overtime && overtimeDetails.length > 0 ? 8 : 0 }}
            >
              {overtimeDetails.length > 0 && (
                <div style={{overflowX:'auto'}}>
                  <table className="payroll-record-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f6f9fc' }}>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Scheduled Out</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Actual Out</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Minutes Overtime</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Supervisor Approval</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Admin Approval</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600 }}>Request</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimeDetails.map((o, i) => {
                        const req = getMatchingOvertimeRequisition(o);
                        // Supervisor approval status
                        const supervisorStatus = req ? req.hrApprovalStatus : null;
                        // Admin approval status (checkbox)
                        const adminStatus = req ? req.status : null;
                        // Define key before all usages
                        const key = o.date + '-' + o.actual;
                        // Only enable checkbox if supervisor/HR has approved
                        const checkboxDisabled = !req || supervisorStatus !== 'approved' || adminStatus === 'approved';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '6px 12px' }}>{o.date}</td>
                            <td style={{ padding: '6px 12px' }}>{o.scheduled}</td>
                            <td style={{ padding: '6px 12px' }}>{o.actual}</td>
                            <td style={{ padding: '6px 12px', color: '#388e3c', fontWeight: 600 }}>{o.mins}</td>
                            <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                              {req ? (
                                <span style={{
                                  color: supervisorStatus === 'approved' ? '#388e3c' : supervisorStatus === 'pending' ? '#f9a825' : '#d32f2f',
                                  fontWeight: 600
                                }}>
                                  {supervisorStatus ? supervisorStatus.charAt(0).toUpperCase() + supervisorStatus.slice(1) : 'N/A'}
                                </span>
                              ) : (
                                <span style={{ color: '#aaa' }}>N/A</span>
                              )}
                            </td>
                            <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                              {req ? (
                                <input
                                  type="checkbox"
                                  checked={!!(typeof pendingApproval[key] !== 'undefined' ? pendingApproval[key] : (adminStatus === 'approved'))}
                                  disabled={checkboxDisabled}
                                  onChange={e => handleTickBox(e.target.checked, key)}
                                />
                              ) : (
                                <span style={{ color: '#aaa' }}>N/A</span>
                              )}
                            </td>
                            <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                              {req ? (
                                <span
                                  style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                                  onClick={() => navigate('/admin-view/requisition', { state: { requisitionId: req._id } })}
                                  onMouseEnter={() => setRequisitionPopover({ [key]: true })}
                                  onMouseLeave={() => setRequisitionPopover({})}
                                >
                                  📄 View Request
                                  {requisitionPopover[key] && (
                                    <div style={{ position: 'absolute', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 6, padding: 12, zIndex: 100, minWidth: 260, left: 0, top: 32 }}>
                                      <div><strong>Type:</strong> {req.type}</div>
                                      <div><strong>Status:</strong> {req.status}</div>
                                      <div><strong>Reason:</strong> {req.reason}</div>
                                      <div><strong>Start:</strong> {req.startDate} {req.time ? '(' + req.time + ')' : ''}</div>
                                      <div><strong>End:</strong> {req.endDate} {req.time ? '(' + req.time + ')' : ''}</div>
                                      <div><strong>Remarks:</strong> {req.remarks}</div>
                                    </div>
                                  )}
                                </span>
                              ) : (
                                <span style={{ color: '#aaa' }}>N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Approve button inside the dropdown, below the table */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <button
                      onClick={handleApproveAll}
                      style={{ fontWeight: 600, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 28px', fontSize: 18, cursor: Object.values(pendingApproval).some(Boolean) ? 'pointer' : 'not-allowed', opacity: overtimeDetails.length > 0 ? 1 : 0.5 }}
                      disabled={!Object.values(pendingApproval).some(Boolean)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Show recalculated overtime pay if any overtime is approved */}
        {Object.values(approvedOvertime).some(Boolean) && (
          <div className="payroll-record-row" style={{ justifyContent: 'flex-end', fontWeight: 600, color: '#388e3c' }}>
            Overtime Pay (Approved): ₱{approvedOvertimePay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollRecord;
