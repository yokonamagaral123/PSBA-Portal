import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";
import { FaBars, FaTachometerAlt, FaUser, FaSignOutAlt, FaClock, FaFileAlt, FaMoneyBill, FaCalendarAlt } from "react-icons/fa";

const AdminSidebar = ({ isMinimized, toggleSidebar }) => {
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const location = useLocation();

  const toggleRequisition = () => {
    setIsRequisitionOpen(!isRequisitionOpen);
  };

  // Function to check if the current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`adminsidebar ${isMinimized ? "minimized" : ""}`}>
      <div className="adminsidebar-header">
        {!isMinimized && <h2>Admin Portal</h2>}
        <span className="menu-icon" onClick={toggleSidebar}>
          <FaBars />
        </span>
      </div>

      <ul>
        <li>
          <Link
            to="/admin-dashboard"
            className={isActive("/admin-dashboard") ? "active" : ""}
          >
            <FaTachometerAlt />
            {!isMinimized && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/admin-profile"
            className={isActive("/admin-profile") ? "active" : ""}
          >
            <FaUser />
            {!isMinimized && <span>Profile</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/admin-attendance"
            className={isActive("/admin-attendance") ? "active" : ""}
          >
            <FaClock />
            {!isMinimized && <span>Attendance</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/admin-schedule"
            className={isActive("/admin-schedule") ? "active" : ""}
          >
            <FaCalendarAlt />
            {!isMinimized && <span>Schedule</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/admin-payroll"
            className={isActive("/admin-payroll") ? "active" : ""}
          >
            <FaMoneyBill />
            {!isMinimized && <span>Payslip</span>}
          </Link>
        </li>
        <li className="dropdown">
          <span onClick={toggleRequisition} className="dropdown-toggle">
            <FaFileAlt />
            {!isMinimized && <span>Requisition ▼</span>}
          </span>
          {!isMinimized && isRequisitionOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/admin-general-request"
                  className={isActive("/admin-general-request") ? "active" : ""}
                >
                  General Request
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-leave-request"
                  className={isActive("/admin-leave-request") ? "active" : ""}
                >
                  Leave Request
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-requisition-history"
                  className={isActive("/admin-requisition-history") ? "active" : ""}
                >
                  Requisition History
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className="dropdown">
          <span onClick={() => setIsAdminViewOpen(!isAdminViewOpen)} className="dropdown-toggle">
            <FaFileAlt />
            {!isMinimized && <span>Admin View ▼</span>}
          </span>
          {!isMinimized && isAdminViewOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/admin-view/account-creation"
                  className={isActive("/admin-view/account-creation") ? "active" : ""}
                >
                  Account Creation
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-view/attendance"
                  className={isActive("/admin-view/attendance") ? "active" : ""}
                >
                  Attendance
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-view/documents"
                  className={isActive("/admin-view/documents") ? "active" : ""}
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-view/manage-employees"
                  className={isActive("/admin-view/manage-employees") ? "active" : ""}
                >
                  Manage Employees
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-view/payroll"
                  className={isActive("/admin-view/payroll") ? "active" : ""}
                >
                  Payroll
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-view/requisition"
                  className={isActive("/admin-view/requisition") ? "active" : ""}
                >
                  Requisition
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-view/scheduler"
                  className={isActive("/admin-view/scheduler") ? "active" : ""}
                >
                  Scheduler
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link to="/" className={isActive("/") ? "active" : ""}>
            <FaSignOutAlt />
            {!isMinimized && <span>Logout</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;