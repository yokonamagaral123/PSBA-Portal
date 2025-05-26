import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PayrollSidebar from './PayrollSidebar';
import './PayrollSidebar.css';
import './PayrollComputation.css';
import axios from 'axios';

// SSS Table (updated based on the provided image)
const SSS_TABLE = [
  { min: 5250, max: 5749.99, sssEE: 250, sssER: 510, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 5750, max: 6249.99, sssEE: 275, sssER: 560, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 6250, max: 6749.99, sssEE: 300, sssER: 610, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 6750, max: 7249.99, sssEE: 325, sssER: 660, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 7250, max: 7749.99, sssEE: 350, sssER: 710, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 7750, max: 8249.99, sssEE: 375, sssER: 760, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 8250, max: 8749.99, sssEE: 400, sssER: 810, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 8750, max: 9249.99, sssEE: 425, sssER: 860, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 9250, max: 9749.99, sssEE: 450, sssER: 910, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 9750, max: 10249.99, sssEE: 475, sssER: 960, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 10250, max: 10749.99, sssEE: 500, sssER: 1010, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 10750, max: 11249.99, sssEE: 525, sssER: 1060, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 11250, max: 11749.99, sssEE: 550, sssER: 1110, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 11750, max: 12249.99, sssEE: 575, sssER: 1160, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 12250, max: 12749.99, sssEE: 600, sssER: 1210, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 12750, max: 13249.99, sssEE: 625, sssER: 1260, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 13250, max: 13749.99, sssEE: 650, sssER: 1310, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 13750, max: 14249.99, sssEE: 675, sssER: 1360, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 14250, max: 14749.99, sssEE: 700, sssER: 1410, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 14750, max: 15249.99, sssEE: 725, sssER: 1460, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 15250, max: 15749.99, sssEE: 750, sssER: 1510, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 15750, max: 16249.99, sssEE: 775, sssER: 1560, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 16250, max: 16749.99, sssEE: 800, sssER: 1610, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 16750, max: 17249.99, sssEE: 825, sssER: 1660, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 17250, max: 17749.99, sssEE: 850, sssER: 1710, sssEC: 10, mpfEE: 0, mpfER: 0 },
  { min: 17750, max: 18249.99, sssEE: 875, sssER: 1760, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 18250, max: 18749.99, sssEE: 900, sssER: 1810, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 18750, max: 19249.99, sssEE: 925, sssER: 1860, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 19250, max: 19749.99, sssEE: 950, sssER: 1910, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 19750, max: 20249.99, sssEE: 975, sssER: 1960, sssEC: 30, mpfEE: 0, mpfER: 0 },
  { min: 20250, max: 20749.99, sssEE: 1000, sssER: 2010, sssEC: 50, mpfEE: 0, mpfER: 0 },
  { min: 20750, max: 21249.99, sssEE: 1025, sssER: 2060, sssEC: 50, mpfEE: 0, mpfER: 0 },
  { min: 21250, max: 21749.99, sssEE: 1050, sssER: 2110, sssEC: 75, mpfEE: 0, mpfER: 0 },
  { min: 21750, max: 22249.99, sssEE: 1075, sssER: 2160, sssEC: 100, mpfEE: 0, mpfER: 0 },
  { min: 22250, max: 22749.99, sssEE: 1100, sssER: 2210, sssEC: 125, mpfEE: 0, mpfER: 0 },
  { min: 22750, max: 23249.99, sssEE: 1125, sssER: 2260, sssEC: 150, mpfEE: 0, mpfER: 0 },
  { min: 23250, max: 23749.99, sssEE: 1150, sssER: 2310, sssEC: 175, mpfEE: 0, mpfER: 0 },
  { min: 23750, max: 24249.99, sssEE: 1175, sssER: 2360, sssEC: 200, mpfEE: 0, mpfER: 0 },
  { min: 24250, max: 24749.99, sssEE: 1200, sssER: 2410, sssEC: 225, mpfEE: 0, mpfER: 0 },
  { min: 24750, max: 25249.99, sssEE: 1225, sssER: 2460, sssEC: 250, mpfEE: 0, mpfER: 0 },
  { min: 25250, max: 25749.99, sssEE: 1250, sssER: 2510, sssEC: 275, mpfEE: 0, mpfER: 0 },
  { min: 25750, max: 26249.99, sssEE: 1275, sssER: 2560, sssEC: 300, mpfEE: 0, mpfER: 0 },
  { min: 26250, max: 26749.99, sssEE: 1300, sssER: 2610, sssEC: 325, mpfEE: 0, mpfER: 0 },
  { min: 26750, max: 27249.99, sssEE: 1325, sssER: 2660, sssEC: 350, mpfEE: 0, mpfER: 0 },
  { min: 27250, max: 27749.99, sssEE: 1350, sssER: 2710, sssEC: 375, mpfEE: 0, mpfER: 0 },
  { min: 27750, max: 28249.99, sssEE: 1375, sssER: 2760, sssEC: 400, mpfEE: 0, mpfER: 0 },
  { min: 28250, max: 28749.99, sssEE: 1400, sssER: 2810, sssEC: 425, mpfEE: 0, mpfER: 0 },
  { min: 28750, max: 29249.99, sssEE: 1425, sssER: 2860, sssEC: 450, mpfEE: 0, mpfER: 0 },
  { min: 29250, max: 29749.99, sssEE: 1450, sssER: 2910, sssEC: 475, mpfEE: 0, mpfER: 0 },
  { min: 29750, max: 30249.99, sssEE: 1475, sssER: 2960, sssEC: 500, mpfEE: 0, mpfER: 0 },
  { min: 30250, max: 30749.99, sssEE: 1500, sssER: 3010, sssEC: 525, mpfEE: 0, mpfER: 0 },
  { min: 30750, max: 31249.99, sssEE: 1525, sssER: 3060, sssEC: 550, mpfEE: 0, mpfER: 0 },
  { min: 31250, max: 31749.99, sssEE: 1550, sssER: 3110, sssEC: 575, mpfEE: 0, mpfER: 0 },
  { min: 31750, max: 32249.99, sssEE: 1575, sssER: 3160, sssEC: 600, mpfEE: 0, mpfER: 0 },
  { min: 32250, max: 32749.99, sssEE: 1600, sssER: 3210, sssEC: 625, mpfEE: 0, mpfER: 0 },
  { min: 32750, max: 33249.99, sssEE: 1625, sssER: 3260, sssEC: 650, mpfEE: 0, mpfER: 0 },
  { min: 33250, max: 33749.99, sssEE: 1650, sssER: 3310, sssEC: 675, mpfEE: 0, mpfER: 0 },
  { min: 33750, max: 34249.99, sssEE: 1675, sssER: 3360, sssEC: 700, mpfEE: 0, mpfER: 0 },
  { min: 34250, max: 100000, sssEE: 1700, sssER: 3410, sssEC: 750, mpfEE: 0, mpfER: 0 },
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
  const [form, setForm] = useState({
    basicPay: '',
    sssEE: '',
    sssER: '',
    sssEC: '',
    mpfEE: '',
    mpfER: '',
    philHealthEE: '',
    pagIbigEE: '',
    totalDeductions: '',
    taxableIncome: '',
    withholdingTax: '',
    totalDeduction: '',
    netPay: '',
  });

  // Fetch basic salary for the employee and set as basicPay
  useEffect(() => {
    const fetchBasicSalary = async () => {
      if (employee && employee.employeeID) {
        try {
          const response = await axios.get(`/api/salary/${employee.employeeID}`);
          if (response.data && response.data.basicSalary) {
            setForm(prev => {
              const sss = getSSSContributions(response.data.basicSalary);
              return {
                ...prev,
                basicPay: response.data.basicSalary,
                sssEE: sss.sssEE + sss.mpfEE,
                sssER: sss.sssER + sss.mpfER,
                sssEC: sss.sssEC,
                mpfEE: sss.mpfEE,
                mpfER: sss.mpfER,
                
              };
            });
          }
        } catch (error) {
          // If not found, leave as blank
        }
      }
    };
    fetchBasicSalary();
  }, [employee]);

  useEffect(() => {
    // Auto-update SSS fields if basicPay changes
    if (form.basicPay) {
      const sss = getSSSContributions(Number(form.basicPay));
      setForm(prev => ({
        ...prev,
        sssEE: sss.sssEE + sss.mpfEE,
        sssER: sss.sssER + sss.mpfER,
        sssEC: sss.sssEC,
        mpfEE: sss.mpfEE,
        mpfER: sss.mpfER,
      
      }));
    }
  }, [form.basicPay]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Pay period options for filter
  const payPeriodOptions = [
    'May 1–15, 2025',
    'May 16–31, 2025',
    'June 1–15, 2025',
    'June 16–30, 2025',
    'Custom...'
  ];

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
          <div className="payslip-row">
            <span>Basic Pay</span>
            <span><input type="number" name="basicPay" value={form.basicPay} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-section-title">Government Deductions</div>
          <div className="payslip-row">
            <span>SSS EE</span>
            <span><input type="number" name="sssEE" value={form.sssEE} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>SSS ER</span>
            <span><input type="number" name="sssER" value={form.sssER || ''} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>SSS EC</span>
            <span><input type="number" name="sssEC" value={form.sssEC || ''} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>PhilHealth EE</span>
            <span><input type="number" name="philHealthEE" value={form.philHealthEE} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>Pag-IBIG EE</span>
            <span><input type="number" name="pagIbigEE" value={form.pagIbigEE} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-total">
            <span>Total Deductions</span>
            <span><input type="number" name="totalDeductions" value={form.totalDeductions} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-section-title">Tax Computation</div>
          <div className="payslip-row">
            <span>Taxable Income</span>
            <span><input type="number" name="taxableIncome" value={form.taxableIncome} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>Withholding Tax</span>
            <span><input type="number" name="withholdingTax" value={form.withholdingTax} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-total">
            <span>Total Deduction</span>
            <span><input type="number" name="totalDeduction" value={form.totalDeduction} onChange={handleChange} className="payslip-input" /></span>
          </div>
          <div className="payslip-row payslip-net">
            <span>Net Pay</span>
            <span><input type="number" name="netPay" value={form.netPay} onChange={handleChange} className="payslip-input payslip-net-input" /></span>
          </div>
          <div className="payslip-row">
            <span>SSSEE (SSS EE + MPF EE)</span>
            <span><input type="number" name="sssee" value={form.sssee} readOnly className="payslip-input" /></span>
          </div>
          <div className="payslip-row">
            <span>SSSER (SSS ER + MPF ER)</span>
            <span><input type="number" name="sser" value={form.sser} readOnly className="payslip-input" /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollComputation;
