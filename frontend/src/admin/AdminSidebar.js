import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";
import { FaBars, FaTachometerAlt, FaUser, FaCog, FaSignOutAlt, FaClock, FaFileAlt, FaMoneyBill } from "react-icons/fa";

const AdminSidebar = ({ isMinimized, toggleSidebar }) => {
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const location = useLocation();

  const toggleRequisition = () => {
    setIsRequisitionOpen(!isRequisitionOpen);
  };

  // Function to check if the current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isMinimized ? "minimized" : ""}`}>
      <div className="sidebar-header">
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
        <li>
          <Link
            to="/admin-payroll"
            className={isActive("/admin-payroll") ? "active" : ""}
          >
            <FaMoneyBill />
            {!isMinimized && <span>Payroll</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/admin-settings"
            className={isActive("/admin-settings") ? "active" : ""}
          >
            <FaCog />
            {!isMinimized && <span>Settings</span>}
          </Link>
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