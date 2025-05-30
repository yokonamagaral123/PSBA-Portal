import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Context for sharing payroll data (approved overtime, overtime details, etc)
const PayrollDataContext = createContext();

export const usePayrollData = () => useContext(PayrollDataContext);

export const PayrollDataProvider = ({ children }) => {
  // Use empty object as initial state
  const [approvedOvertime, setApprovedOvertime] = useState({});
  const [overtimeDetails, setOvertimeDetails] = useState([]);
  const [getMatchingOvertimeRequisition, setGetMatchingOvertimeRequisition] = useState(() => () => null);

  // Fetch approved overtime from backend for an employee and cutoff
  const fetchApprovedOvertime = async (employeeID, start, end) => {
    try {
      const res = await axios.get(`/api/overtime/approved?empID=${employeeID}&start=${start}&end=${end}`);
      setApprovedOvertime(prev => ({ ...prev, ...res.data }));
      return res.data;
    } catch (err) {
      // If 404, just return empty
      if (err.response && err.response.status === 404) {
        setApprovedOvertime(prev => ({ ...prev }));
        return {};
      }
      throw err;
    }
  };

  // Approve overtime (create or update in backend)
  const approveOvertime = async (overtimeObj) => {
    // overtimeObj: { employeeID, date, minutes, status, approvedBy, payPeriod }
    const res = await axios.post('/api/overtime/approved', overtimeObj);
    // Update context
    setApprovedOvertime(prev => ({
      ...prev,
      [`${overtimeObj.date}-${overtimeObj.employeeID}`]: {
        minutes: overtimeObj.minutes,
        status: overtimeObj.status || 'approved',
        approvedBy: overtimeObj.approvedBy,
        payPeriod: overtimeObj.payPeriod,
        _id: res.data._id
      }
    }));
    return res.data;
  };

  // Remove declined overtime (delete from backend)
  const removeDeclinedOvertime = async (requisition) => {
    // Find all keys in approvedOvertime that match this requisition's date(s)
    let dates = [];
    if (requisition.startDate && requisition.endDate) {
      let d = new Date(requisition.startDate);
      const end = new Date(requisition.endDate);
      while (d <= end) {
        dates.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
    }
    // Remove all keys for this employee and these dates
    setApprovedOvertime(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        const date = key.slice(0, 10);
        if (
          dates.includes(date) &&
          requisition.requestedByEmployeeID &&
          requisition.employeeID &&
          (requisition.requestedByEmployeeID === requisition.employeeID)
        ) {
          // If _id exists, delete from backend
          if (updated[key]._id) {
            axios.delete(`/api/overtime/approved/${updated[key]._id}`);
          }
          delete updated[key];
        }
      });
      return updated;
    });
  };

  return (
    <PayrollDataContext.Provider value={{
      approvedOvertime,
      setApprovedOvertime,
      overtimeDetails,
      setOvertimeDetails,
      getMatchingOvertimeRequisition,
      setGetMatchingOvertimeRequisition,
      fetchApprovedOvertime,
      approveOvertime,
      removeDeclinedOvertime
    }}>
      {children}
    </PayrollDataContext.Provider>
  );
};
