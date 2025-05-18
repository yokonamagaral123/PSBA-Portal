import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../employee/Sidebar/Sidebar";
import AdminSidebar from "../admin/AdminSidebar/AdminSidebar";
import NotificationBell from "../employee/NotifcationBell/NotificationBell";
import Login from "../employee/Login/Login";
import Dashboard from "../employee/Dashboard/Dashboard";
import Profile from "../employee/Profile/Profile";
import Attendance from "../employee/Attendance/Attendance";
import ForgotPassword from "./ForgotPassword";
import GeneralRequest from "../employee/Requisition/GeneralRequest";
import LeaveRequest from "../employee/Requisition/LeaveRequest";
import RequisitionHistory from "../employee/Requisition/RequisitionHistory";
import Payroll from "../employee/Payroll/Payroll";
import Settings from "../employee/Settings/Settings";
import AssistBotHelp from "../employee/AssistBotHelp/AssistBotHelp";
import AdminDashboard from "../admin/AdminDashboard";
import AdminProfile from "../admin/AdminProfile/AdminProfile";
import AdminSettings from "../admin/AdminSettings/AdminSettings";
import AdminAttendance from "../admin/AdminAttendance/AdminAttendance";
import AdminGeneralRequest from "../admin/AdminRequisition/AdminGeneralRequest";
import AdminLeaveRequest from "../admin/AdminRequisition/AdminLeaveRequest";
import AdminRequisitionHistory from "../admin/AdminRequisition/AdminRequisitionHistory";
import AdminPayroll from "../admin/AdminPayroll/AdminPayroll";
import AdminViewAttendance from "../admin/AdminView/AdminViewAttendance";
import AdminViewPayroll from "../admin/AdminView/AdminViewPayroll";
import AdminViewRequisition from "../admin/AdminView/AdminViewRequisition";
import AdminViewDocuments from "../admin/AdminView/AdminViewDocuments";
import AdminAccountCreation from "../admin/AdminView/AdminAccountCreation";
import ManageEmployees from "../admin/AdminView/ManageEmployees";

// Import HR components
import HrDashboard from "../hr/HrDashboard/HrDashboard";
import HrProfile from "../hr/HrProfile/HrProfile";
import HrSidebar from "../hr/HrSidebar/HrSidebar";
import HrSettings from "../hr/HrSettings";
import HrAttendance from "../hr/HrAttendance/HrAttendance";
import HrRequisitionHistory from "../hr/HrRequisition/HrRequisitionHistory";
import HrGeneralRequest from "../hr/HrRequisition/HrGeneralRequest";
import HrLeaveRequest from "../hr/HrRequisition/HrLeaveRequest";
import HrViewPayroll from "../hr/HrView/HrViewPayroll";
import HrViewAttendance from "../hr/HrView/HrViewAttendance";
import HrViewRequisition from "../hr/HrView/HrViewRequisition";
import HrViewDocuments from "../hr/HrView/HrViewDocuments";
import "./App.css";

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
                    <Route path="/requisition/general" element={<GeneralRequest />} />
                    <Route path="/requisition/leave" element={<LeaveRequest />} />
                    <Route path="/requisition/history" element={<RequisitionHistory />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/settings" element={<Settings />} />
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
              <div className={`app-container ${isMinimized ? "sidebar-minimized" : ""}`}>
                <AdminSidebar isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
                <div className="page-content">
                  <Routes>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/admin-profile" element={<AdminProfile />} />
                    <Route path="/admin-settings" element={<AdminSettings />} />
                    <Route path="/admin-attendance" element={<AdminAttendance />} />
                    <Route path="/admin-general-request" element={<AdminGeneralRequest />} />
                    <Route path="/admin-leave-request" element={<AdminLeaveRequest />} />
                    <Route path="/admin-requisition-history" element={<AdminRequisitionHistory />} />
                    <Route path="/admin-payroll" element={<AdminPayroll />} />
                    <Route path="/admin-view/attendance" element={<AdminViewAttendance />} />
                    <Route path="/admin-view/payroll" element={<AdminViewPayroll />} />
                    <Route path="/admin-view/requisition" element={<AdminViewRequisition />} />
                    <Route path="/admin-view/documents" element={<AdminViewDocuments />} />
                    <Route path="/admin-view/account-creation" element={<AdminAccountCreation />} />
                    <Route path="/admin-view/manage-employees" element={<ManageEmployees />} />
                    <Route path="*" element={<Navigate to="/admin-dashboard" />} />
                  </Routes>
                </div>
              </div>
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
                    <Route path="/hr-settings" element={<HrSettings />} />
                    <Route path="/hr-attendance" element={<HrAttendance />} />
                    <Route path="/hr-view/payroll" element={<HrViewPayroll />} />
                    <Route path="/hr-view/attendance" element={<HrViewAttendance />} />
                    <Route path="/hr-view/requisition" element={<HrViewRequisition />} />
                    <Route path="/hr-view/documents" element={<HrViewDocuments />} />
                    <Route path="*" element={<Navigate to="/hr-dashboard" />} />
                    <Route path="/hr-requisition-history" element={<HrRequisitionHistory />} />
                    <Route path="/hr-general-request" element={<HrGeneralRequest />} />
                    <Route path="/hr-leave-request" element={<HrLeaveRequest />} />
                  </Routes>
                </div>
              </div>
            }
          />
        )}
      </Routes>
    </Router>
  );
};

export default App;