import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PayrollSidebar from './PayrollSidebar';
import './PayrollSidebar.css';
import './PayrollComputation.css';
import axios from 'axios';
import { calculateWithholdingTax } from './withholdingTaxCalculator';
import { usePayrollData } from './PayrollDataContext';
import { getApprovedOvertimeDetails } from './PayrollRecord';

// SSS Table (updated based on the provided image)
const SSS_TABLE = [
  { min: 1, max: 5249.99, sssEE: 250, sssER: 500, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 5250, max: 5749.99, sssEE: 275, sssER: 550, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 5750, max: 6249.99, sssEE: 300, sssER: 600, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 6250, max: 6749.99, sssEE: 325, sssER: 650, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 6750, max: 7249.99, sssEE: 350, sssER: 700, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 7250, max: 7749.99, sssEE: 375, sssER: 750, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 7750, max: 8249.99, sssEE: 400, sssER: 800, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 8250, max: 8749.99, sssEE: 425, sssER: 850, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 8750, max: 9249.99, sssEE: 450, sssER: 900, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 9250, max: 9749.99, sssEE: 475, sssER: 950, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 9750, max: 10249.99, sssEE: 500, sssER: 1000, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 10250, max: 10749.99, sssEE: 525, sssER: 1050, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 10750, max: 11249.99, sssEE: 550, sssER: 1100, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 11250, max: 11749.99, sssEE: 575, sssER: 1150, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 11750, max: 12249.99, sssEE: 600, sssER: 1200, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 12250, max: 12749.99, sssEE: 625, sssER: 1250, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 12750, max: 13249.99, sssEE: 650, sssER: 1300, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 13250, max: 13749.99, sssEE: 675, sssER: 1350, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 13750, max: 14249.99, sssEE: 700, sssER: 1400, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 14250, max: 14749.99, sssEE: 725, sssER: 1450, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 14750, max: 15249.99, sssEE: 750, sssER: 1500, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 15250, max: 15749.99, sssEE: 775, sssER: 1550, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 15750, max: 16249.99, sssEE: 800, sssER: 1600, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 16250, max: 16749.99, sssEE: 825, sssER: 1650, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 16750, max: 17249.99, sssEE: 850, sssER: 1700, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 17250, max: 17749.99, sssEE: 875, sssER: 1750, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 17750, max: 18249.99, sssEE: 900, sssER: 1800, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 18250, max: 18749.99, sssEE: 925, sssER: 1850, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 18750, max: 19249.99, sssEE: 950, sssER: 1900, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 19250, max: 19749.99, sssEE: 975, sssER: 1950, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 19750, max: 20249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 20250, max: 20749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 25, mpfER: 50 },
  { min: 20750, max: 21249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 50, mpfER: 100 },
  { min: 21250, max: 21749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 75, mpfER: 150 },
  { min: 21750, max: 22249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 100, mpfER: 200 },
  { min: 22250, max: 22749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 125, mpfER: 250 },
  { min: 22750, max: 23249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 150, mpfER: 300 },
  { min: 23250, max: 23749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 175, mpfER: 350 },
  { min: 23750, max: 24249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 200, mpfER: 400 },
  { min: 24250, max: 24749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 225, mpfER: 450 },
  { min: 24750, max: 25249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 250, mpfER: 500 },
  { min: 25250, max: 25749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 275, mpfER: 550 },
  { min: 25750, max: 26249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 300, mpfER: 600 },
  { min: 26250, max: 26749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 325, mpfER: 650 },
  { min: 26750, max: 27249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 350, mpfER: 700 },
  { min: 27250, max: 27749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 375, mpfER: 750 },
  { min: 27750, max: 28249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 400, mpfER: 800 },
  { min: 28250, max: 28749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 425, mpfER: 850 },
  { min: 28750, max: 29249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 450, mpfER: 900 },
  { min: 29250, max: 29749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 475, mpfER: 950 },
  { min: 29750, max: 30249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 500, mpfER: 1000 },
  { min: 30250, max: 30749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 525, mpfER: 1050 },
  { min: 30750, max: 31249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 550, mpfER: 1100 },
  { min: 31250, max: 31749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 575, mpfER: 1150 },
  { min: 31750, max: 32249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 600, mpfER: 1200 },
  { min: 32250, max: 32749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 625, mpfER: 1250 },
  { min: 32750, max: 33249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 650, mpfER: 1300 },
  { min: 33250, max: 33749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 675, mpfER: 1350 },
  { min: 33750, max: 34249.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 700, mpfER: 1400 },
  { min: 34250, max: 34749.99, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 725, mpfER: 1450 },
  { min: 34750, max: 100000, sssEE: 1000, sssER: 2000, sssEC: 30, mpfEE: 750, mpfER: 1500 },
];

function getSSSContributions(basicPay) {
  const row = SSS_TABLE.find(r => basicPay >= r.min && basicPay <= r.max);
  if (row) {
    return { sssEE: row.sssEE, sssER: row.sssER, sssEC: row.sssEC, mpfEE: row.mpfEE, mpfER: row.mpfER };
  }
  return { sssEE: '', sssER: '', sssEC: '', mpfEE: '', mpfER: '' };
}

const PayrollComputation = () => {
  const location = useLocation();
  const employee = location.state?.employee;
  // Use payPeriod from navigation state if present, otherwise default
  const initialPayPeriod = location.state?.payPeriod || 'May 1–15, 2025';
  const [payPeriod, setPayPeriod] = useState(initialPayPeriod);
  const [basicPay, setBasicPay] = useState('');
  const [daysWorked, setDaysWorked] = useState(0);
  const [dailyRate, setDailyRate] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [perMinuteRate, setPerMinuteRate] = useState(0);
  const [lateMins, setLateMins] = useState(0);
  const [undertimeMins, setUndertimeMins] = useState(0);
  const [lateUndertimeDeduction, setLateUndertimeDeduction] = useState(0);
  const [form, setForm] = useState({
  // Removed basicPay dependency from form
    basicPay: '',
    sssEE: '',
    sssER: '',
    sssEC: '',
    mpfEE: '',
    mpfER: '',
    philHealthEE: '',
    philHealthER: '', // Add PhilHealth ER
    pagIbigEE: '',
    pagIbigER: '', // Add Pag-IBIG ER
    totalDeductions: '',
    taxableIncome: '',
    withholdingTax: '',
    totalDeduction: '',
    netPay: '',
  });
  const [lateBreakdown, setLateBreakdown] = useState({ hours: 0, minutes: 0, deduction: 0 });
  const [undertimeBreakdown, setUndertimeBreakdown] = useState({ hours: 0, minutes: 0, deduction: 0 });
  const [overtimeBreakdown, setOvertimeBreakdown] = useState({ hours: 0, minutes: 0, pay: 0 });
  const OVERTIME_MULTIPLIER = 1.25;

  // Helper for PhilHealth computation
  function getPhilHealthContributions(basicPay) {
    // 5% of monthly basic pay, split 50/50 between EE and ER
    const monthly = Number(basicPay) || 0;
    const total = monthly * 0.05;
    const ee = total / 2;
    const er = total / 2;
    return { ee: ee.toFixed(2), er: er.toFixed(2) };
  }

  // Helper for Pag-IBIG computation
  function getPagIbigContributions(payPeriod) {
    // Pag-IBIG EE is 0 on 15th cutoff, 200 on 30th cutoff (EE only)
    if (payPeriod.match(/1–15|1-15/)) {
      return { ee: '0.00', er: '0.00' };
    } else if (payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/)) {
      return { ee: '200.00', er: '100.00' };
    }
    // Default for custom
    return { ee: '200.00', er: '100.00' };
  }

  // Helper to sum government deductions (dynamic for cutoff)
  function getTotalDeductions(form) {
    // Only include employee share in deductions
    let fields = [form.sssEE];
    if (payPeriod.match(/1–15|1-15/)) {
      // 15th cut off: include PhilHealth EE only
      fields = fields.concat([form.philHealthEE]);
    } else if (payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/)) {
      // 30th cut off: include Pag-IBIG EE only
      fields = fields.concat([form.pagIbigEE]);
    }
    return fields.reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2);
  }

  // Fetch basic salary for the employee and set as basicPay
  useEffect(() => {
    const fetchBasicSalary = async () => {
      if (employee && employee.employeeID) {
        try {
          const response = await axios.get(`/api/salary/${employee.employeeID}`);
          if (response.data && response.data.basicSalary) {
            setForm(prev => ({
              ...prev,
              basicPay: response.data.basicSalary // always set monthly only here
            }));
            setBasicPay(response.data.basicSalary);
          }
        } catch (error) {
          // If not found, leave as blank
        }
      }
    };
    fetchBasicSalary();
  }, [employee]);

  // Fetch daysWorked, dailyRate, hourlyRate, perMinuteRate, lateMins, undertimeMins, and overtimeMins for the selected employee and cutoff
  useEffect(() => {
    const fetchAttendanceAndRate = async () => {
      if (employee && employee.employeeID && payPeriod) {
        // 1. Get cutoff dates
        const match = payPeriod.match(/([A-Za-z]+) (\d+)[–-](\d+), (\d{4})/);
        if (!match) return;
        const [, monthStr, startDay, endDay, year] = match;
        const month = new Date(`${monthStr} 1, ${year}`).getMonth() + 1;
        const pad = n => n.toString().padStart(2, '0');
        const start = `${year}-${pad(month)}-${pad(startDay)}`;
        const end = `${year}-${pad(month)}-${pad(endDay)}`;
        // 2. Fetch attendance
        let days = 0, late = 0, undertime = 0; // remove overtime
        try {
          const attRes = await axios.get(`/api/attendance?empID=${employee.employeeID}&start=${start}&end=${end}`);
          const attendanceArr = attRes.data || [];
          const workedDates = new Set(attendanceArr.map(a => a.date));
          days = workedDates.size;
          // Group attendance by date
          const grouped = {};
          attendanceArr.forEach(a => {
            if (!grouped[a.date]) grouped[a.date] = [];
            grouped[a.date].push(a);
          });
          // Fetch schedule
          let sched = null;
          try {
            const schedRes = await axios.get(`/api/employee/details/${employee.employeeID}`);
            sched = schedRes.data.employee?.schedule || null;
          } catch {}
          for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const s = sched?.[dayName];
            if (s && s.start && s.end && s.start !== 'REST' && s.end !== 'DAY') {
              const dateStr = d.toISOString().slice(0, 10);
              const records = grouped[dateStr] || [];
              if (records.length) {
                const toMinutes = t => {
                  if (!t) return 0;
                  const [h, m, s] = t.split(":").map(Number);
                  return h * 60 + m + (s ? s / 60 : 0);
                };
                const sorted = [...records].sort((x, y) => toMinutes(x.time) - toMinutes(y.time));
                const first = sorted[0];
                const last = sorted[sorted.length - 1];
                const schedStart = toMinutes(s.start);
                const schedEnd = toMinutes(s.end);
                const inMins = toMinutes(first.time);
                const outMins = toMinutes(last.time);
                if (inMins > schedStart + 5) late += inMins - schedStart;
                if (outMins < schedEnd) undertime += schedEnd - outMins;
                // Use a 5-minute grace period for overtime, to match PayrollRecord.js
                if (outMins > schedEnd + 5) undertime += outMins - schedEnd; // remove this line
              }
            }
          }
        } catch {
          days = 0; late = 0; undertime = 0;
        }
        setDaysWorked(days);
        setLateMins(late);
        setUndertimeMins(undertime);
        // 3. Fetch daily, hourly, per minute rate
        try {
          const salRes = await axios.get(`/api/salary/${employee.employeeID}`);
          setDailyRate(Number(salRes.data.dailyRate) || 0);
          setHourlyRate(Number(salRes.data.hourlyRate) || 0);
          setPerMinuteRate(Number(salRes.data.perMinuteRate) || 0);
        } catch {
          setDailyRate(0); setHourlyRate(0); setPerMinuteRate(0);
        }
      }
    };
    fetchAttendanceAndRate();
  }, [employee, payPeriod]);

  // Helper to format minutes as 'X hr Y min' or just 'Y min'
  function formatHoursMins(mins) {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return `${h} hr${h > 1 ? 's' : ''}${m > 0 ? ` ${m} min${m > 1 ? 's' : ''}` : ''}`;
    }
    return `${Math.round(mins)} min${Math.round(mins) !== 1 ? 's' : ''}`;
  }

  // Calculate deduction for late and undertime using hour and minute rate breakdown
  useEffect(() => {
    function getDeductionBreakdown(mins, ratePerHour, ratePerMinute) {
      const hours = Math.floor(mins / 60);
      const minutes = Math.round(mins % 60); // round minutes for display
      const deduction = (hours * ratePerHour) + ((mins % 60) * ratePerMinute); // keep calculation precise
      return { hours, minutes, deduction: Number(deduction.toFixed(2)) };
    }
    const late = getDeductionBreakdown(lateMins, hourlyRate, perMinuteRate);
    const undertime = getDeductionBreakdown(undertimeMins, hourlyRate, perMinuteRate);
    setLateUndertimeDeduction(Number((late.deduction + undertime.deduction).toFixed(2)));
    setLateBreakdown(late);
    setUndertimeBreakdown(undertime);
  }, [lateMins, undertimeMins, hourlyRate, perMinuteRate]);

  // Use context for shared state
  const {
    approvedOvertime,
    overtimeDetails,
    getMatchingOvertimeRequisition,
    setOvertimeDetails, // Add setter if available in context
    setApprovedOvertime // Add setter if available in context
  } = usePayrollData();

  // --- NEW STATE FOR REMOTE OVERTIME DATA ---
  const [remoteOvertimeDetails, setRemoteOvertimeDetails] = useState([]);
  const [remoteApprovedOvertime, setRemoteApprovedOvertime] = useState({});

  // Filter context overtime data for the current employee and pay period
  const cutoff = (() => {
    const match = payPeriod.match(/([A-Za-z]+) (\d+)[–-](\d+), (\d{4})/);
    if (!match) return null;
    const [, monthStr, startDay, endDay, year] = match;
    const month = new Date(`${monthStr} 1, ${year}`).getMonth() + 1;
    const pad = n => n.toString().padStart(2, '0');
    return {
      start: `${year}-${pad(month)}-${pad(startDay)}`,
      end: `${year}-${pad(month)}-${pad(endDay)}`
    };
  })();

  // Filter overtimeDetails for this employee and cutoff
  const filteredOvertimeDetails = overtimeDetails.filter(o => {
    if (!employee) return false;
    if (!o.date) return false;
    if (!cutoff) return false;
    // Only include overtime for this employee
    if (o.employeeID !== employee.employeeID) return false;
    return o.date >= cutoff.start && o.date <= cutoff.end;
  });

  // Filter approvedOvertime for this cutoff
  const filteredApprovedOvertime = Object.fromEntries(
    Object.entries(approvedOvertime).filter(([key, val]) => {
      const [date] = key.split('-');
      if (!cutoff) return false;
      return date >= cutoff.start && date <= cutoff.end;
    })
  );

  // --- FETCH OVERTIME DATA FROM BACKEND IF CONTEXT IS EMPTY OR STALE ---
  useEffect(() => {
    const fetchOvertimeData = async () => {
      if (!employee || !cutoff) return;
      // If context already has data for this employee and cutoff, skip
      if (filteredOvertimeDetails.length > 0) return;
      try {
        // Fetch overtime details for this employee and cutoff
        const otRes = await axios.get(`/api/overtime?empID=${employee.employeeID}&start=${cutoff.start}&end=${cutoff.end}`);
        const details = otRes.data || [];
        setRemoteOvertimeDetails(details);
        // Optionally update context if setter is available
        if (typeof setOvertimeDetails === 'function') {
          setOvertimeDetails(prev => {
            // Merge new details, avoid duplicates
            const existing = Array.isArray(prev) ? prev : [];
            const merged = [...existing.filter(o => o.employeeID !== employee.employeeID || o.date < cutoff.start || o.date > cutoff.end), ...details];
            return merged;
          });
        }
        // Fetch approved overtime for this employee and cutoff
        const apprRes = await axios.get(`/api/overtime/approved?empID=${employee.employeeID}&start=${cutoff.start}&end=${cutoff.end}`);
        const approved = apprRes.data || {};
        setRemoteApprovedOvertime(approved);
        if (typeof setApprovedOvertime === 'function') {
          setApprovedOvertime(prev => ({ ...prev, ...approved }));
        }
      } catch (err) {
        // fallback: clear remote data
        setRemoteOvertimeDetails([]);
        setRemoteApprovedOvertime({});
      }
    };
    fetchOvertimeData();
    // Only run when employee, cutoff, or context changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, cutoff, overtimeDetails, approvedOvertime]);

  // Use remote data if context is empty for this employee/cutoff
  const overtimeDetailsToUse = filteredOvertimeDetails.length > 0 ? filteredOvertimeDetails : remoteOvertimeDetails;
  const approvedOvertimeToUse = Object.keys(filteredApprovedOvertime).length > 0 ? filteredApprovedOvertime : remoteApprovedOvertime;

  // Use only admin-approved overtime for all calculations (filtered)
  const approvedOvertimeEntries = getApprovedOvertimeDetails(
    overtimeDetailsToUse,
    approvedOvertimeToUse,
    getMatchingOvertimeRequisition
  );
  const approvedOvertimeMins = approvedOvertimeEntries.reduce((sum, o) => sum + o.mins, 0);

  // Use approvedOvertimeMins for all overtime calculations
  useEffect(() => {
    const hours = Math.floor(approvedOvertimeMins / 60);
    const minutes = Math.round(approvedOvertimeMins % 60);
    const basePay = (hours * hourlyRate) + (minutes * perMinuteRate);
    const pay = Number((basePay * OVERTIME_MULTIPLIER).toFixed(2));
    setOvertimeBreakdown({ hours, minutes, pay });
  }, [approvedOvertimeMins, hourlyRate, perMinuteRate]);

  // Always use half of monthly basic pay as period pay per cutoff
  const getPeriodBasicPay = React.useCallback(() => {
    // Use the monthly basic pay from form or state
    const monthly = parseFloat(form.basicPay || basicPay || 0);
    return (monthly / 2).toFixed(2);
  }, [form.basicPay, basicPay]);

  // Calculate expected working days for the cutoff
  const getExpectedWorkingDays = React.useCallback(() => {
    // Use the same logic as before to get the number of scheduled work days in the cutoff
    if (!payPeriod) return 0;
    const match = payPeriod.match(/([A-Za-z]+) (\d+)[–-](\d+), (\d{4})/);
    if (!match) return 0;
    const [, monthStr, startDay, endDay, year] = match;
    const month = new Date(`${monthStr} 1, ${year}`).getMonth() + 1;
    const pad = n => n.toString().padStart(2, '0');
    const start = `${year}-${pad(month)}-${pad(startDay)}`;
    const end = `${year}-${pad(month)}-${pad(endDay)}`;
    let count = 0;
    if (employee && employee.schedule) {
      for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const s = employee.schedule[dayName];
        if (s && s.start && s.end && s.start !== 'REST' && s.end !== 'DAY') {
          count++;
        }
      }
    }
    return count;
  }, [payPeriod, employee]);

  // Calculate expected working days for the cutoff
  const expectedWorkingDays = getExpectedWorkingDays();
  const absentDays = Math.max(0, expectedWorkingDays - daysWorked);
  const absentDeduction = absentDays * dailyRate;

  // Helper to get total deduction for late/undertime + employee deductions
  const getTotalDeductionsWithLateUndertime = React.useCallback((formArg) => {
    // Only include employee share in deductions
    let fields = [formArg.sssEE];
    if (payPeriod.match(/1–15|1-15/)) {
      // 15th cut off: include PhilHealth EE only
      fields = fields.concat([formArg.philHealthEE]);
    } else if (payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/)) {
      // 30th cut off: include Pag-IBIG EE only
      fields = fields.concat([formArg.pagIbigEE]);
    }
    // Add late/undertime deduction first
    return (lateUndertimeDeduction + fields.reduce((sum, val) => sum + (parseFloat(val) || 0), 0)).toFixed(2);
  }, [payPeriod, lateUndertimeDeduction]);

  // Add a new useEffect that recalculates all deduction/tax fields whenever any relevant value changes
  useEffect(() => {
    if (basicPay && payPeriod) {
      const periodPay = parseFloat(getPeriodBasicPay());
      // Get SSS based on monthly basic pay
      const sssMonthly = getSSSContributions(parseFloat(basicPay));
      // Divide SSS EE by 2 for per cutoff
      const sssEEPerCutoff = (parseFloat(sssMonthly.sssEE) / 2).toFixed(2);
      const sssERPerCutoff = (parseFloat(sssMonthly.sssER) / 2).toFixed(2);
      const sssECPerCutoff = (parseFloat(sssMonthly.sssEC) / 2).toFixed(2);
      const mpfEEPerCutoff = (parseFloat(sssMonthly.mpfEE) / 2).toFixed(2);
      const mpfERPerCutoff = (parseFloat(sssMonthly.mpfER) / 2).toFixed(2);
      // Add MPF EE to SSS EE, and MPF ER to SSS ER for output
      const sssEEWithMPF = (parseFloat(sssEEPerCutoff) + parseFloat(mpfEEPerCutoff)).toFixed(2);
      const sssERWithMPF = (parseFloat(sssERPerCutoff) + parseFloat(mpfERPerCutoff)).toFixed(2);
      const philhealth = getPhilHealthContributions(basicPay);
      const pagibig = getPagIbigContributions(payPeriod);
      let fields = [sssEEWithMPF];
      if (payPeriod.match(/1–15|1-15/)) {
        fields = fields.concat([philhealth.ee]);
      } else if (payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/)) {
        fields = fields.concat([pagibig.ee]);
      }
      const totalDeductions = fields.reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2);
      // Use the correct deduction for tax computation (late/undertime included)
      const totalDeductionsWithLateUndertime = getTotalDeductionsWithLateUndertime({
        sssEE: sssEEWithMPF,
        philHealthEE: philhealth.ee,
        pagIbigEE: pagibig.ee
      });
      const withholdingTax = calculateWithholdingTax({
        basicPay: periodPay,
        totalDeductions: totalDeductionsWithLateUndertime
      });
      setForm(prev => ({
        ...prev,
        basicPay: prev.basicPay, // keep monthly for display
        sssEE: sssEEWithMPF, // SSS EE + MPF EE
        sssER: sssERWithMPF, // SSS ER + MPF ER
        sssEC: sssECPerCutoff,
        mpfEE: mpfEEPerCutoff,
        mpfER: mpfERPerCutoff,
        philHealthEE: philhealth.ee,
        philHealthER: philhealth.er,
        pagIbigEE: pagibig.ee,
        pagIbigER: pagibig.er,
        totalDeductions: totalDeductions,
        withholdingTax: withholdingTax,
      }));
    }
  }, [basicPay, payPeriod, daysWorked, dailyRate, lateUndertimeDeduction, getPeriodBasicPay, getTotalDeductionsWithLateUndertime]);
  // Pay period options for filter
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

  if (!employee) {
    return <div style={{ color: 'red', fontWeight: 600, margin: 32 }}>No employee selected. Please select an employee from Payroll Management.</div>;
  }

  return (
    <div className="payroll-computation-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', background: '#f6f9fc' }}>
      <PayrollSidebar />
      <div className="payroll-computation-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 0, marginBottom: 24, marginTop: 64 }}>
        <h1>Payroll Calculator</h1>
        <div className="payslip-header" style={{ justifyContent: 'flex-start' }}>
          <div>
            <strong>Pay Period:</strong>
            <select
              className="pay-period-input"
              value={payPeriod}
              onChange={e => setPayPeriod(e.target.value)}
              style={{ width: '200px', fontWeight: 600, color: '#1976d2', border: 'none', background: 'transparent', marginLeft: 8 }}
            >
              {payPeriodOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {payPeriod === 'Custom...' && (
              <input
                type="text"
                placeholder="Enter custom period"
                value={payPeriod !== 'Custom...' ? payPeriod : ''}
                onChange={e => setPayPeriod(e.target.value)}
                className="pay-period-input"
                style={{ width: '180px', marginLeft: 8 }}
              />
            )}
          </div>
        </div>
        {employee && (
          <div className="payslip-employee-info" style={{ width: '100%', maxWidth: 900, marginBottom: 12, background: '#f5f8fa', borderRadius: 8, padding: 8, display: 'flex', gap: 32, fontSize: '1em', color: '#333' }}>
            <div><strong>Employee ID:</strong> {employee.employeeID}</div>
            <div><strong>Name:</strong> {employee.firstName} {employee.middleName} {employee.lastName}</div>
            <div><strong>Department:</strong> {employee.department}</div>
          </div>
        )}
        <div className="payslip-sections-container payslip-sections-clean" style={{ display: 'flex', gap: 24, justifyContent: 'right', alignItems: 'flex-start', width: '100%', maxWidth: 1100, margin: '0 auto' }}>
          {/* COLUMN 1: Payroll Summary + Deductions for Late/Undertime/Absent */}
          <div className="payslip-section payslip-section-summary" style={{ minWidth: 500, flex: 1 }}>
            <div className="payslip-row payslip-section-title">Payroll Summary</div>
            <div className="payslip-row"><span>{payPeriod.match(/1–15|1-15/) ? '15th cut off' : payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/) ? '30th cut off' : 'Pay for Period'}</span><span><input type="number" name="periodPay" value={getPeriodBasicPay()} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>Monthly Basic Pay</span><span><input type="number" name="basicPay" value={form.basicPay} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>Rate per day</span><span>₱{dailyRate.toFixed(2)}</span></div>
            <div className="payslip-row"><span>Rate per hour</span><span>₱{hourlyRate.toFixed(2)}</span></div>
            <div className="payslip-row"><span>Rate per minute</span><span>₱{perMinuteRate.toFixed(2)}</span></div>
            <div className="payslip-row payslip-section-title payslip-section-title-sub" style={{background:'#fffbe7', color:'#bfa100', marginTop:18}}>Deduction for Late/Undertime/Absent</div>
            <div className="payslip-row"><span>Late</span><span>{formatHoursMins(lateMins)}</span></div>
            <div className="payslip-row"><span>Undertime</span><span>{formatHoursMins(undertimeMins)}</span></div>
            <div className="payslip-row"><span>Absent</span><span>{absentDays} day{absentDays !== 1 ? 's' : ''}</span></div>
            <div className="payslip-row"><span>Late Deduction</span><span>({lateBreakdown.hours} × ₱{hourlyRate.toFixed(2)}) + ({lateBreakdown.minutes} × ₱{perMinuteRate.toFixed(2)}) = ₱{lateBreakdown.deduction.toFixed(2)}</span></div>
            <div className="payslip-row"><span>Undertime Deduction</span><span>({undertimeBreakdown.hours} × ₱{hourlyRate.toFixed(2)}) + ({undertimeBreakdown.minutes} × ₱{perMinuteRate.toFixed(2)}) = ₱{undertimeBreakdown.deduction.toFixed(2)}</span></div>
            <div className="payslip-row"><span>Absent Deduction</span><span>{absentDays} day{absentDays !== 1 ? 's' : ''} × ₱{dailyRate.toFixed(2)} = ₱{absentDeduction.toFixed(2)}</span></div>
            <div className="payslip-row payslip-total payslip-total-deduction"><span>Total Late/Undertime/Absent Deduction</span><span>{(lateUndertimeDeduction + absentDeduction).toFixed(2)}</span></div>
          </div>

          {/* COLUMN 2: Additional Pay + Employee/Employer Deductions */}
          <div className="payslip-section payslip-section-middle" style={{ minWidth: 500, flex: 1 }}>
            <div className="payslip-row payslip-section-title" style={{background:'#eaffea', color:'#1b7e1b'}}>Additional Pay</div>
            <div className="payslip-row"><span>Overtime</span><span>{overtimeBreakdown.hours > 0 || overtimeBreakdown.minutes > 0 ? `${overtimeBreakdown.hours} hr${overtimeBreakdown.hours !== 1 ? 's' : ''} ${overtimeBreakdown.minutes} min${overtimeBreakdown.minutes !== 1 ? 's' : ''}` : '0 min'}</span></div>
            <div className="payslip-row"><span>Overtime Multiplier</span><span>1.25 (125%)</span></div>
            <div className="payslip-row payslip-total payslip-total-overtime"><span>Total Overtime Pay</span><span>{overtimeBreakdown.pay.toFixed(2)}</span></div>
            <div className="payslip-row payslip-section-title payslip-section-title-sub" style={{marginTop:18}}>Employee Deductions (to be deducted from Net Pay)</div>
            <div className="payslip-row"><span>SSS EE</span><span><input type="number" name="sssEE" value={form.sssEE} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>PhilHealth EE</span><span><input type="number" name="philHealthEE" value={payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/) ? 0 : form.philHealthEE} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>Pag-IBIG EE</span><span><input type="number" name="pagIbigEE" value={payPeriod.match(/1–15|1-15/) ? 0 : form.pagIbigEE} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row payslip-total payslip-total-employee"><span>Total Employee Deductions</span><span><input type="number" name="totalDeductions" value={getTotalDeductions(form)} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row payslip-section-title payslip-section-title-sub" style={{background:'#f0f6ff', color:'#1976d2', marginTop:18}}>Employer Contributions (for reference only, not deducted)</div>
            <div className="payslip-row"><span>SSS ER</span><span><input type="number" name="sssER" value={form.sssER || ''} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>SSS EC</span><span><input type="number" name="sssEC" value={form.sssEC || ''} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>PhilHealth ER</span><span><input type="number" name="philHealthER" value={payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/) ? 0 : form.philHealthER} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row"><span>Pag-IBIG ER</span><span><input type="number" name="pagIbigER" value={payPeriod.match(/1–15|1-15/) ? 0 : form.pagIbigER} readOnly className="payslip-input" /></span></div>
          </div>

          {/* COLUMN 3: Tax Computation & Net Pay */}
          <div className="payslip-section payslip-section-tax" style={{ minWidth: 500, flex: 1 }}>
            <div className="payslip-row payslip-section-title">Tax Computation</div>
            <div className="payslip-row"><span>Taxable Income</span><span><input type="number" name="taxableIncome" value={(getPeriodBasicPay() - parseFloat(getTotalDeductionsWithLateUndertime(form) || 0)).toFixed(2)} readOnly className="payslip-input" /><span style={{ marginLeft: 10, color: (getPeriodBasicPay() - parseFloat(getTotalDeductionsWithLateUndertime(form) || 0)) > 10417 ? 'green' : 'gray', fontWeight: 600 }}>{(getPeriodBasicPay() - parseFloat(getTotalDeductionsWithLateUndertime(form) || 0)) > 10417 ? 'TAXABLE' : 'NOT TAXABLE'}</span></span></div>
            <div className="payslip-row"><span>Withholding Tax</span><span><input type="number" name="withholdingTax" value={form.withholdingTax} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row payslip-total payslip-total-tax"><span>Total Deduction (Employee Deductions + Tax)</span><span><input type="number" name="totalDeductions" value={form.withholdingTax ? (parseFloat(getTotalDeductionsWithLateUndertime(form)) + parseFloat(form.withholdingTax)).toFixed(2) : getTotalDeductionsWithLateUndertime(form)} readOnly className="payslip-input" /></span></div>
            <div className="payslip-row payslip-net"><span>Net Pay</span><span><input type="number" name="netPay" value={(getPeriodBasicPay() - parseFloat(getTotalDeductionsWithLateUndertime(form) || 0) - parseFloat(form.withholdingTax || 0) + overtimeBreakdown.pay).toFixed(2)} readOnly className="payslip-input payslip-net-input" /></span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollComputation;
