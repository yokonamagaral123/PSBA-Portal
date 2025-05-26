import React from "react";
import "./AdminPayroll.css";

const AdminPayroll = () => {
  return (
    <>
      {/* Admin Payroll Banner */}
      <div className="admin-payroll-banner">
        <h1 className="admin-payroll-banner-title">PAYSLIP</h1>
      </div>

      {/* Admin Payroll Content */}
      <div className="admin-payroll-main">
        <h1 className="admin-payroll-title">Payslip</h1>
        <p>Manage payslip information for user here.</p>
      </div>
    </>
  );
};

export default AdminPayroll;