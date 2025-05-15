import React from "react";
import "./Payroll.css";

const Payroll = () => {
  return (
    <>
      {/* Payroll Banner */}
      <div className="payroll-banner">
        <h1 className="payroll-banner-title">PAYROLL</h1>
      </div>

      {/* Payroll Content */}
      <div className="payroll-container">
        <h2>Payroll</h2>
        <table className="payroll-table">
          <tbody>
            <tr>
              <th colSpan="3">Geguna, Arvin Joseph</th>
            </tr>
            <tr>
              <td>Basic Pay</td>
              <td>11 days</td>
              <td>12,500.00</td>
            </tr>
            <tr>
              <td>Absent</td>
              <td>1 day</td>
              <td>1,136.36</td>
            </tr>
            <tr>
              <td>SSS</td>
              <td></td>
              <td>625.00</td>
            </tr>
            <tr>
              <td>Pagibig</td>
              <td></td>
              <td>100.00</td>
            </tr>
            <tr>
              <td>Philhealth</td>
              <td></td>
              <td>312.00</td>
            </tr>
            <tr>
              <td><strong>Total Deduction</strong></td>
              <td></td>
              <td><strong>2,173.36</strong></td>
            </tr>
            <tr>
              <td><strong>Gross Pay</strong></td>
              <td></td>
              <td>10,326.64</td>
            </tr>
            <tr>
              <td><strong>Taxable Income</strong></td>
              <td></td>
              <td>9,999.99</td>
            </tr>
            <tr>
              <td><strong>Net Pay</strong></td>
              <td></td>
              <td><strong>9,999.99</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Payroll;