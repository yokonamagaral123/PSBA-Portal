import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PayrollSidebar.css';

const PayrollSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  const goTo = (path) => {
    navigate(path, { state: { employee } });
  };

  return (
    <div className="payroll-sidebar-horizontal">
      <button
        className="sidebar-btn back-btn"
        onClick={() => navigate('/admin-view/payroll')}
      >
        <span className="back-icon">&#8592;</span> Back
      </button>
      <button
        className={`sidebar-btn${location.pathname.includes('basic-salary') ? ' active' : ''}`}
        onClick={() => goTo('/payroll-management/basic-salary')}
      >
        Basic Salary
      </button>
      <button
        className={`sidebar-btn${location.pathname.includes('payroll-computation') ? ' active' : ''}`}
        onClick={() => goTo('/payroll-management/payroll-computation')}
      >
        Payroll Computation
      </button>
      <button
        className={`sidebar-btn${location.pathname.includes('payroll-record') ? ' active' : ''}`}
        onClick={() => goTo('/payroll-management/payroll-record')}
      >
        Payroll Record
      </button>
    </div>
  );
};

export default PayrollSidebar;
