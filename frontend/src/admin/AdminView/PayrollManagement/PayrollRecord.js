import React from 'react';
import PayrollSidebar from './PayrollSidebar';
import './PayrollSidebar.css';
import './PayrollRecord.css';
import { useLocation } from 'react-router-dom';

const PayrollRecord = () => {
  const location = useLocation();
  const employee = location.state?.employee;

  return (
    <div className="payroll-management-layout">
      <PayrollSidebar />
      <div className="payroll-management-content">
        {employee ? (
          <div className="employee-info-horizontal">
            <span><strong>Employee ID:</strong> {employee.employeeID}</span>
            <span className="employee-info-separator">I</span>
            <span><strong>Name:</strong> {employee.firstName} {employee.middleName} {employee.lastName}</span>
            <span className="employee-info-separator">I</span>
            <span><strong>Department:</strong> {employee.department}</span>
          </div>
        ) : (
          <div className="employee-info">No employee selected.</div>
        )}
        <h1>Payroll Record</h1>
        <p>Content for Payroll Record page goes here.</p>
      </div>
    </div>
  );
};

export default PayrollRecord;
