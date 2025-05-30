import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../employee/Sidebar/Sidebar";
import AdminSidebar from "../admin/AdminSidebar/AdminSidebar";
import NotificationBell from "../employee/NotifcationBell/NotificationBell";
import Login from "../employee/Login/Login";
import Dashboard from "../employee/Dashboard/Dashboard";
import Profile from "../employee/Profile/Profile";
import Attendance from "../employee/Attendance/Attendance";
import Schedule from "../employee/Schedule/Schedule";
import ForgotPassword from "./ForgotPassword";
import GeneralRequest from "../employee/Requisition/GeneralRequest";
import LeaveRequest from "../employee/Requisition/LeaveRequest";
import RequisitionHistory from "../employee/Requisition/RequisitionHistory";
import Payroll from "../employee/Payroll/Payroll";
import AssistBotHelp from "../employee/AssistBotHelp/AssistBotHelp";
import EmployeeOfficialBusiness from "../employee/Requisition/EmployeeOfficialBusiness";

import AdminDashboard from "../admin/AdminDashboard/AdminDashboard";
import AdminProfile from "../admin/AdminProfile/AdminProfile";
import AdminAttendance from "../admin/AdminAttendance/AdminAttendance";
import AdminSchedule from "../admin/AdminSchedule/AdminSchedule";
import AdminGeneralRequest from "../admin/AdminRequisition/AdminGeneralRequest";
import AdminLeaveRequest from "../admin/AdminRequisition/AdminLeaveRequest";
import AdminRequisitionHistory from "../admin/AdminRequisition/AdminRequisitionHistory";
import AdminPayroll from "../admin/AdminPayroll/AdminPayroll";
import AdminViewAttendance from "../admin/AdminView/AdminViewAttendance";
import AdminScheduler from "../admin/AdminView/AdminScheduler";
import AdminViewPayroll from "../admin/AdminView/AdminViewPayroll";
import AdminViewRequisition from "../admin/AdminView/AdminViewRequisition";
import AdminViewDocuments from "../admin/AdminView/AdminViewDocuments";
import AdminAccountCreation from "../admin/AdminView/AdminAccountCreation";
import ManageEmployees from "../admin/AdminView/ManageEmployees";

import HrDashboard from "../hr/HrDashboard/HrDashboard";
import HrProfile from "../hr/HrProfile/HrProfile";
import HrSidebar from "../hr/HrSidebar/HrSidebar";
import HrAttendance from "../hr/HrAttendance/HrAttendance";
import HrSchedule from "../hr/HrSchedule/HrSchedule";
import HrPayslip from "../hr/HrPayslip/HrPayslip";
import HrRequisitionHistory from "../hr/HrRequisition/HrRequisitionHistory";
import HrGeneralRequest from "../hr/HrRequisition/HrGeneralRequest";
import HrLeaveRequest from "../hr/HrRequisition/HrLeaveRequest";
import HrViewRequisition from "../hr/HrView/HrViewRequisition";
import HrOfficialBusiness from "../hr//HrRequisition/HrOfficialBusiness";

import "./App.css";
import BasicSalary from "../admin/AdminView/PayrollManagement/BasicSalary";
import PayrollComputation from "../admin/AdminView/PayrollManagement/PayrollComputation";
import PayrollRecord from "../admin/AdminView/PayrollManagement/PayrollRecord";
import { AdminDataProvider } from "../admin/AdminDataContext";
import { PayrollDataProvider } from "../admin/AdminView/PayrollManagement/PayrollDataContext";

import OutsideOB from "../admin/AdminRequisition/OfficialBusiness";

const App = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole);
    }
    // Try to get user info from localStorage (or fetch from backend if needed)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Example: After login, save user info to localStorage and state
  // You should do this in your Login component after successful login:
  // localStorage.setItem("user", JSON.stringify(userObject));
  // setUser(userObject);

  return (
    <AdminDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login setUserRole={setUserRole} setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {userRole === "employee" && (
            <Route
              path="/*"
              element={
                <div className={`app-container ${isMinimized ? "sidebar-minimized" : ""}`}>
                  <Sidebar isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
                  <div className="top-bar">
                    <NotificationBell />
                  </div>
                  <div className="page-content">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/requisition/general" element={<GeneralRequest />} />
                      <Route path="/requisition/leave" element={<LeaveRequest />} />
                      <Route path="/requisition/history" element={<RequisitionHistory />} />
                      <Route path="/payroll" element={<Payroll />} />
                      <Route path="/requisition/official-business" element={<EmployeeOfficialBusiness />} />
                      <Route path="/assistbothelp" element={<AssistBotHelp />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          )}

          {userRole === "admin" && (
            <Route
              path="/*"
              element={
                <PayrollDataProvider>
                  <div className={`app-container ${isMinimized ? "sidebar-minimized" : ""}`}>
                    <AdminSidebar isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
                    <div className="page-content">
                      <Routes>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/admin-profile" element={<AdminProfile />} />
                        <Route path="/admin-attendance" element={<AdminAttendance />} />
                        <Route path="/admin-schedule" element={<AdminSchedule />} />
                        <Route path="/admin-general-request" element={<AdminGeneralRequest />} />
                        <Route path="/admin-leave-request" element={<AdminLeaveRequest />} />
                        <Route path="/admin-requisition-history" element={<AdminRequisitionHistory />} />
                        <Route path="/admin-payroll" element={<AdminPayroll />} />
                        <Route path="/admin-view/attendance" element={<AdminViewAttendance />} />
                        <Route path="/admin-view/scheduler" element={<AdminScheduler />} />
                        <Route path="/admin-view/payroll" element={<AdminViewPayroll />} />
                        <Route path="/admin-view/requisition" element={<AdminViewRequisition />} />
                        <Route path="/admin-view/documents" element={<AdminViewDocuments />} />
                        <Route path="/admin-view/account-creation" element={<AdminAccountCreation />} />
                        <Route path="/admin-view/manage-employees" element={<ManageEmployees />} />
                      
                        <Route path="/payroll-management/basic-salary" element={<BasicSalary />} />
                        <Route path="/payroll-management/payroll-computation" element={<PayrollComputation />} />
                        <Route path="/payroll-management/payroll-record" element={<PayrollRecord />} />
                       
                        <Route path="/admin-view/official-business" element={<OutsideOB />} />
                   
                        <Route path="*" element={<Navigate to="/admin-dashboard" />} />
                      </Routes>
                    </div>
                  </div>
                </PayrollDataProvider>
              }
            />
          )}

          {userRole === "hr" && (
            <Route
              path="/*"
              element={
                <div className={`app-container ${isMinimized ? "sidebar-minimized" : ""}`}>
                  <HrSidebar isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
                  <div className="page-content">
                    <Routes>
                      <Route path="/hr-dashboard" element={<HrDashboard user={user} />} />
                      <Route path="/hr-profile" element={<HrProfile />} />
                      <Route path="/hr-attendance" element={<HrAttendance />} />
                      <Route path="/hr-schedule" element={<HrSchedule />} />
                      <Route path="/hr-payslip" element={<HrPayslip />} /> 
                      <Route path="/hr-view/requisition" element={<HrViewRequisition />} />
                      <Route path="*" element={<Navigate to="/hr-dashboard" />} />
                      <Route path="/hr-requisition-history" element={<HrRequisitionHistory />} />
                      <Route path="/hr-general-request" element={<HrGeneralRequest />} />
                      <Route path="/hr-leave-request" element={<HrLeaveRequest />} />
                      <Route path="/hr-official-business" element={<HrOfficialBusiness />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          )}
        </Routes>
      </Router>
    </AdminDataProvider>
  );
};

export default App;