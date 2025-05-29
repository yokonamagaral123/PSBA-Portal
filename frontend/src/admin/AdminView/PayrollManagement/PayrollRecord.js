import React, { useState, useEffect } from 'react';
import PayrollSidebar from './PayrollSidebar';
import './PayrollSidebar.css';
import './PayrollRecord.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

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

const PayrollRecord = () => {
  const location = useLocation();
  const employee = location.state?.employee;
  const [payPeriod, setPayPeriod] = useState(payPeriodOptions[0]);
  const [daysWorked, setDaysWorked] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [lateMins, setLateMins] = useState(0);
  const [undertimeMins, setUndertimeMins] = useState(0);
  const [overtimeMins, setOvertimeMins] = useState(0);

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
              if (inMins > schedStart + 5) late += inMins - schedStart;
              // Undertime
              if (outMins < schedEnd) undertime += schedEnd - outMins;
              // Overtime
              if (outMins > schedEnd + 5) overtime += outMins - schedEnd;
            }
          }
        }
        setAbsentDays(Math.max(totalDays - workedDates.size, 0));
        setLateMins(late);
        setUndertimeMins(undertime);
        setOvertimeMins(overtime);
      } catch {
        setDaysWorked(0);
        setAbsentDays(0);
        setLateMins(0);
        setUndertimeMins(0);
        setOvertimeMins(0);
      }
    };
    fetchAttendance();
  }, [employee, payPeriod, schedule]);

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
          <div className="payroll-record-row">
            <span className="payroll-record-label">Late</span>
            <span className="payroll-record-late">{formatHoursMins(lateMins)}</span>
          </div>
          <div className="payroll-record-row">
            <span className="payroll-record-label">Undertime</span>
            <span className="payroll-record-undertime">{formatHoursMins(undertimeMins)}</span>
          </div>
          <div className="payroll-record-row">
            <span className="payroll-record-label">Overtime</span>
            <span className="payroll-record-overtime">{formatHoursMins(overtimeMins)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollRecord;
