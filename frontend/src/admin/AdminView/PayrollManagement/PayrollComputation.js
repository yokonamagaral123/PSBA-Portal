import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PayrollSidebar from './PayrollSidebar';
import './PayrollSidebar.css';
import './PayrollComputation.css';
import axios from 'axios';
import { calculateWithholdingTax } from './withholdingTaxCalculator';

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

  const [payPeriod, setPayPeriod] = useState('May 1–15, 2025');
  const [basicPay, setBasicPay] = useState('');
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

  useEffect(() => {
    // SSS EE should be based on monthly basic pay, then divided by 2 per cutoff
    if (basicPay) {
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
      const withholdingTax = calculateWithholdingTax({
        basicPay: periodPay,
        totalDeductions: totalDeductions
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicPay, payPeriod]);

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

  // Helper to get pay for the selected period
  function getPeriodBasicPay() {
    if (!form.basicPay) return 0;
    // Match any pay period containing 1–15, 1-15, 16–31, 16-31, 16–30, or 16-30 (even with month/year)
    if (
      payPeriod.match(/1[–-]15/) ||
      payPeriod.match(/16[–-]3[01]/) ||
      payPeriod.match(/16[–-]30/)
    ) {
      // Semi-monthly: 1st-15th or 16th-end
      return (parseFloat(form.basicPay) / 2).toFixed(2);
    }
    // If custom, default to full monthly unless user overrides
    return parseFloat(form.basicPay).toFixed(2);
  }

  return (
    <div className="payroll-computation-layout">
      <PayrollSidebar />
      <div className="payroll-computation-content">
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
          <div className="payslip-employee-info">
            <div><strong>Employee ID:</strong> {employee.employeeID}</div>
            <div><strong>Name:</strong> {employee.firstName} {employee.middleName} {employee.lastName}</div>
            <div><strong>Department:</strong> {employee.department}</div>
          </div>
        )}
        <div className="payslip-card">
          <div className="payslip-row payslip-section-title" style={{background:'#f5f5f5', fontWeight:700, fontSize:'1.1em'}}>Payroll Summary</div>
          <div className="payslip-row">
            <span>{
              payPeriod.match(/1–15|1-15/)
                ? '15th cut off'
                : payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/)
                ? '30th cut off'
                : 'Pay for Period'
            }</span>
            <span><input type="number" name="periodPay" value={getPeriodBasicPay()} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>Monthly Basic Pay</span>
            <span><input type="number" name="basicPay" value={form.basicPay} readOnly className="payslip-input" /></span>
          </div>

          <div className="payslip-row payslip-section-title" style={{marginTop:16}}>Employee Deductions (to be deducted from Net Pay)</div>
          <div className="payslip-row">
            <span>SSS EE</span>
            <span><input type="number" name="sssEE" value={form.sssEE} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>PhilHealth EE</span>
            <span><input type="number" name="philHealthEE" value={payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/) ? 0 : form.philHealthEE} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>Pag-IBIG EE</span>
            <span><input type="number" name="pagIbigEE" value={payPeriod.match(/1–15|1-15/) ? 0 : form.pagIbigEE} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-total" style={{background:'#ffeaea', fontWeight:600}}>
            <span>Total Employee Deductions</span>
            <span><input type="number" name="totalDeductions" value={getTotalDeductions(form)} readOnly className="payslip-input" /></span>
          </div>

          <div className="payslip-row payslip-section-title" style={{marginTop:16}}>Employer Contributions (for reference only, not deducted)</div>
          <div className="payslip-row">
            <span>SSS ER</span>
            <span><input type="number" name="sssER" value={form.sssER || ''} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>SSS EC</span>
            <span><input type="number" name="sssEC" value={form.sssEC || ''} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>PhilHealth ER</span>
            <span><input type="number" name="philHealthER" value={payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/) ? 0 : form.philHealthER} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>Pag-IBIG ER</span>
            <span><input type="number" name="pagIbigER" value={payPeriod.match(/1–15|1-15/) ? 0 : form.pagIbigER} readOnly className="payslip-input" /></span>
          </div>

          <div className="payslip-row payslip-section-title" style={{marginTop:16}}>Tax Computation</div>
          <div className="payslip-row">
            <span>Taxable Income</span>
            <span>
              <input type="number" name="taxableIncome" value={(getPeriodBasicPay() - parseFloat(getTotalDeductions(form) || 0)).toFixed(2)} readOnly className="payslip-input" />
              <span style={{ marginLeft: 10, color: (getPeriodBasicPay() - parseFloat(getTotalDeductions(form) || 0)) > 10417 ? 'green' : 'gray', fontWeight: 600 }}>
                {(getPeriodBasicPay() - parseFloat(getTotalDeductions(form) || 0)) > 10417 ? 'TAXABLE' : 'NOT TAXABLE'}
              </span>
            </span>
          </div>
          <div className="payslip-row">
            <span>Withholding Tax</span>
            <span><input type="number" name="withholdingTax" value={form.withholdingTax} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-total" style={{background:'#eaf7ff', fontWeight:600}}>
            <span>Total Deduction (Employee Deductions + Tax)</span>
            <span><input type="number" name="totalDeduction" value={form.withholdingTax ? (parseFloat(getTotalDeductions(form)) + parseFloat(form.withholdingTax)).toFixed(2) : getTotalDeductions(form)} readOnly className="payslip-input" /></span>
          </div>

          <div className="payslip-row payslip-net" style={{background:'#eaffea', fontWeight:700}}>
            <span>Net Pay</span>
            <span><input type="number" name="netPay" value={(getPeriodBasicPay() - parseFloat(getTotalDeductions(form) || 0) - parseFloat(form.withholdingTax || 0)).toFixed(2)} readOnly className="payslip-input payslip-net-input" /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollComputation;
