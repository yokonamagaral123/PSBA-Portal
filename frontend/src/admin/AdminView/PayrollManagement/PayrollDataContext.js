import React, { createContext, useContext, useState } from 'react';

// Context for sharing payroll data (approved overtime, overtime details, etc)
const PayrollDataContext = createContext();

export const usePayrollData = () => useContext(PayrollDataContext);

export const PayrollDataProvider = ({ children }) => {
  // These states will be shared between PayrollRecord and PayrollComputation
  const [approvedOvertime, setApprovedOvertime] = useState({});
  const [overtimeDetails, setOvertimeDetails] = useState([]);
  const [getMatchingOvertimeRequisition, setGetMatchingOvertimeRequisition] = useState(() => () => null);

  // Optionally add more shared payroll-related state here

  return (
    <PayrollDataContext.Provider value={{
      approvedOvertime,
      setApprovedOvertime,
      overtimeDetails,
      setOvertimeDetails,
      getMatchingOvertimeRequisition,
      setGetMatchingOvertimeRequisition
    }}>
      {children}
    </PayrollDataContext.Provider>
  );
};
