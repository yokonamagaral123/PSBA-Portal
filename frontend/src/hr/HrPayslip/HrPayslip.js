import React from "react";
import "./HrPayslip.css";

const HrPayslip = () => {
  return (
    <>
      {/* HR Payslip Banner */}
      <div className="hr-payslip-banner">
        <h1 className="hr-payslip-banner-title">PAYSLIP</h1>
      </div>

      {/* HR Payslip Content */}
      <div className="hr-payslip-main">
        <h1 className="hr-payslip-title">Payslip</h1>
        <p>Payslip information per-user</p>
        {/* Add payroll management features here */}
      </div>
    </>
  );
};

export default HrPayslip;