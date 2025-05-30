import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPayroll.css";
import "../AdminView/PayrollManagement/PayrollComputation.css";
import jsPDF from "jspdf";

const AdminPayroll = () => {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For demo: fetch the most recent payslip (can be filtered by employeeID/payPeriod)
  useEffect(() => {
    const fetchPayslip = async () => {
      setLoading(true);
      setError("");
      try {
        // Instead of sending email as a query param, send the token in the Authorization header
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          setError("No user token found. Please log in.");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          "/api/payslip",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPayslip(res.data[0] || null);
      } catch (err) {
        setError("Failed to fetch payslip.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayslip();
  }, []);

  const handleDownloadPayslip = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;
    doc.setFontSize(20);
    doc.text("PAYSLIP", 300, y, { align: "center" });
    y += 30;
    doc.setFontSize(12);
    doc.text(`Pay Period: ${payPeriod}`, margin, y);
    y += 18;
    doc.text(`Employee ID: ${employeeID}`, margin, y);
    y += 18;
    doc.text(`Name: ${name}`, margin, y);
    y += 18;
    doc.text(`Department: ${department}`, margin, y);
    y += 28;
    doc.setFontSize(13);
    doc.text("Payroll Summary", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`Period Pay: ₱${payrollSummary.periodPay?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Monthly Basic Pay: ₱${payrollSummary.monthlyBasicPay?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Rate per day: ₱${payrollSummary.ratePerDay?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Rate per hour: ₱${payrollSummary.ratePerHour?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Rate per minute: ₱${payrollSummary.ratePerMinute?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 18;
    doc.setFontSize(13);
    doc.text("Deductions", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`Late: ${payrollSummary.late}`, margin, y);
    y += 14;
    doc.text(`Undertime: ${payrollSummary.undertime}`, margin, y);
    y += 14;
    doc.text(`Absent: ${payrollSummary.absent}`, margin, y);
    y += 14;
    doc.text(`Late Deduction: ₱${payrollSummary.lateDeduction?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Undertime Deduction: ₱${payrollSummary.undertimeDeduction?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Absent Deduction: ₱${payrollSummary.absentDeduction?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Total Late/Undertime/Absent Deduction: ₱${payrollSummary.totalLateUndertimeAbsentDeduction?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 18;
    doc.setFontSize(13);
    doc.text("Additional Pay", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`Overtime: ${additionalPay.overtime}`, margin, y);
    y += 14;
    doc.text(`Overtime Multiplier: ${additionalPay.overtimeMultiplier}`, margin, y);
    y += 14;
    doc.text(`Total Overtime Pay: ₱${additionalPay.totalOvertimePay?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 18;
    doc.setFontSize(13);
    doc.text("Employee Deductions", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`SSS EE: ₱${employeeDeductions.sssEE?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`PhilHealth EE: ₱${employeeDeductions.philHealthEE?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Pag-IBIG EE: ₱${employeeDeductions.pagIbigEE?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Total Employee Deductions: ₱${employeeDeductions.totalEmployeeDeductions?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 18;
    doc.setFontSize(13);
    doc.text("Employer Contributions", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`SSS ER: ₱${employerContributions.sssER?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`SSS EC: ₱${employerContributions.sssEC?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`PhilHealth ER: ₱${employerContributions.philHealthER?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Pag-IBIG ER: ₱${employerContributions.pagIbigER?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 18;
    doc.setFontSize(13);
    doc.text("Tax Computation", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`Taxable Income: ₱${taxComputation.taxableIncome?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""} (${taxComputation.isTaxable ? "TAXABLE" : "NOT TAXABLE"})`, margin, y);
    y += 14;
    doc.text(`Withholding Tax: ₱${taxComputation.withholdingTax?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.text(`Total Deduction: ₱${taxComputation.totalDeduction?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    y += 14;
    doc.setFontSize(13);
    doc.text(`Net Pay: ₱${taxComputation.netPay?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ""}`, margin, y);
    doc.save(`Payslip_${employeeID}_${payPeriod.replace(/\s+/g, "_")}.pdf`);
  };

  if (loading) return <div style={{ margin: 32 }}>Loading payslip...</div>;
  if (error) return <div style={{ color: "red", margin: 32 }}>{error}</div>;
  if (!payslip) return <div style={{ margin: 32 }}>No payslip found.</div>;

  const {
    employeeID,
    name,
    department,
    payPeriod,
    payrollSummary,
    additionalPay,
    employeeDeductions,
    employerContributions,
    taxComputation,
  } = payslip;

  return (
    <>
      {/* Admin Payroll Banner */}
      <div className="admin-payroll-banner">
        <h1 className="admin-payroll-banner-title">PAYSLIP</h1>
      </div>
      <div
        className="admin-payroll-main"
        style={{
          background: "#f7fafd",
          minHeight: "100vh",
          paddingTop: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div
          className="payslip-header"
          style={{ justifyContent: "center", marginBottom: 8, width: "100%", maxWidth: 1100, display: "flex" }}
        >
          <div>
            <strong>Pay Period:</strong>{" "}
            <span
              style={{
                color: "#1976d2",
                fontWeight: 600,
              }}
            >
              {payPeriod}
            </span>
          </div>
        </div>
        <div
          className="payslip-employee-info"
          style={{
            width: "100%",
            maxWidth: 900,
            marginBottom: 12,
            background: "#f5f8fa",
            borderRadius: 8,
            padding: 8,
            display: "flex",
            gap: 32,
            fontSize: "1em",
            color: "#333",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            <strong>Employee ID:</strong> {employeeID}
          </div>
          <div>
            <strong>Name:</strong> {name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>
              <strong>Department:</strong> {department}
            </span>
            <button
              className="generate-payslip-btn"
              style={{
                marginLeft: 18,
                padding: "6px 18px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "1em",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(25, 118, 210, 0.08)",
                transition: "background 0.2s",
              }}
              type="button"
              onClick={handleDownloadPayslip}
            >
              Download Payslip
            </button>
          </div>
        </div>
        <div
          className="payslip-sections-container payslip-sections-clean"
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {/* Payroll Summary */}
          <div
            className="payslip-section payslip-section-summary"
            style={{ minWidth: 500, flex: 1 }}
          >
            <div className="payslip-row payslip-section-title">
              Payroll Summary
            </div>
            <div className="payslip-row">
              <span>
                {payPeriod.match(/1–15|1-15/)
                  ? "15th cut off"
                  : payPeriod.match(/16–3[01]|16-3[01]|16–30|16-30/)
                  ? "30th cut off"
                  : "Pay for Period"}
              </span>
              <span>
                {payrollSummary.periodPay?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Monthly Basic Pay</span>
              <span>
                {payrollSummary.monthlyBasicPay?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Rate per day</span>
              <span>
                ₱
                {payrollSummary.ratePerDay?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Rate per hour</span>
              <span>
                ₱
                {payrollSummary.ratePerHour?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Rate per minute</span>
              <span>
                ₱
                {payrollSummary.ratePerMinute?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div
              className="payslip-row payslip-section-title payslip-section-title-sub"
              style={{
                background: "#fffbe7",
                color: "#bfa100",
                marginTop: 18,
              }}
            >
              Deduction for Late/Undertime/Absent
            </div>
            <div className="payslip-row">
              <span>Late</span>
              <span>{payrollSummary.late}</span>
            </div>
            <div className="payslip-row">
              <span>Undertime</span>
              <span>{payrollSummary.undertime}</span>
            </div>
            <div className="payslip-row">
              <span>Absent</span>
              <span>{payrollSummary.absent}</span>
            </div>
            <div className="payslip-row">
              <span>Late Deduction</span>
              <span>
                ₱
                {payrollSummary.lateDeduction?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Undertime Deduction</span>
              <span>
                ₱
                {payrollSummary.undertimeDeduction?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Absent Deduction</span>
              <span>
                ₱
                {payrollSummary.absentDeduction?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row payslip-total payslip-total-deduction">
              <span>Total Late/Undertime/Absent Deduction</span>
              <span>
                {payrollSummary.totalLateUndertimeAbsentDeduction?.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}
              </span>
            </div>
          </div>
          {/* Additional Pay + Employee/Employer Deductions */}
          <div
            className="payslip-section payslip-section-middle"
            style={{ minWidth: 500, flex: 1 }}
          >
            <div
              className="payslip-row payslip-section-title"
              style={{ background: "#eaffea", color: "#1b7e1b" }}
            >
              Additional Pay
            </div>
            <div className="payslip-row">
              <span>Overtime</span>
              <span>{additionalPay.overtime}</span>
            </div>
            <div className="payslip-row">
              <span>Overtime Multiplier</span>
              <span>{additionalPay.overtimeMultiplier} (125%)</span>
            </div>
            <div className="payslip-row payslip-total payslip-total-overtime">
              <span>Total Overtime Pay</span>
              <span>
                {additionalPay.totalOvertimePay?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div
              className="payslip-row payslip-section-title payslip-section-title-sub"
              style={{ marginTop: 18 }}
            >
              Employee Deductions (to be deducted from Net Pay)
            </div>
            <div className="payslip-row">
              <span>SSS EE</span>
              <span>
                {employeeDeductions.sssEE?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>PhilHealth EE</span>
              <span>
                {employeeDeductions.philHealthEE?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Pag-IBIG EE</span>
              <span>
                {employeeDeductions.pagIbigEE?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row payslip-total payslip-total-employee">
              <span>Total Employee Deductions</span>
              <span>
                {employeeDeductions.totalEmployeeDeductions?.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}
              </span>
            </div>
            <div
              className="payslip-row payslip-section-title payslip-section-title-sub"
              style={{
                background: "#f0f6ff",
                color: "#1976d2",
                marginTop: 18,
              }}
            >
              Employer Contributions (for reference only, not deducted)
            </div>
            <div className="payslip-row">
              <span>SSS ER</span>
              <span>
                {employerContributions.sssER?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>SSS EC</span>
              <span>
                {employerContributions.sssEC?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>PhilHealth ER</span>
              <span>
                {employerContributions.philHealthER?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row">
              <span>Pag-IBIG ER</span>
              <span>
                {employerContributions.pagIbigER?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          {/* Tax Computation & Net Pay */}
          <div
            className="payslip-section payslip-section-tax"
            style={{ minWidth: 500, flex: 1 }}
          >
            <div className="payslip-row payslip-section-title">Tax Computation</div>
            <div className="payslip-row">
              <span>Taxable Income</span>
              <span>
                {taxComputation.taxableIncome?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                <span
                  style={{
                    marginLeft: 10,
                    color: taxComputation.isTaxable ? "green" : "gray",
                    fontWeight: 600,
                  }}
                >
                  {taxComputation.isTaxable ? "TAXABLE" : "NOT TAXABLE"}
                </span>
              </span>
            </div>
            <div className="payslip-row">
              <span>Withholding Tax</span>
              <span>
                {taxComputation.withholdingTax?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row payslip-total payslip-total-tax">
              <span>Total Deduction (Employee Deductions + Tax)</span>
              <span>
                {taxComputation.totalDeduction?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="payslip-row payslip-net">
              <span>Net Pay</span>
              <span>
                {taxComputation.netPay?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPayroll;