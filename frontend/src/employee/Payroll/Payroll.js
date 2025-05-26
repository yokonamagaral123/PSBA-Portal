import React from "react";
import "./Payroll.css";

const Payroll = () => {
  return (
    <>
      {/* Payroll Banner */}
      <div className="payroll-banner">
        <h1 className="payroll-banner-title">PAYSLIP</h1>
      </div>

      {/* Payroll Content */}
      <div className="payroll-main">
        <h1 className="payroll-title">Payslip</h1>
        <p>Manage payslip information for user here.</p>
      </div>
    </>
  );
};

export default Payroll;