import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HrSidebar.css";
import { FaBars, FaTachometerAlt, FaUser, FaCog, FaSignOutAlt, FaClock, FaFileAlt } from "react-icons/fa";

const HrSidebar = ({ isMinimized, toggleSidebar }) => {
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
        {!isMinimized && <h2>HR Portal</h2>}
        <span className="menu-icon" onClick={toggleSidebar}>
          <FaBars />
        </span>
      </div>

      <ul>
        <li>
          <Link
            to="/hr-dashboard"
            className={isActive("/hr-dashboard") ? "active" : ""}
          >
            <FaTachometerAlt />
            {!isMinimized && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/hr-profile"
            className={isActive("/hr-profile") ? "active" : ""}
          >
            <FaUser />
            {!isMinimized && <span>Profile</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/hr-attendance"
            className={isActive("/hr-attendance") ? "active" : ""}
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
                  to="/requisition/general"
                  className={
                    isActive("/requisition/general") ? "active" : ""
                  }
                >
                  General Request
                </Link>
              </li>
              <li>
                <Link
                  to="/requisition/leave"
                  className={isActive("/requisition/leave") ? "active" : ""}
                >
                  Leave Request
                </Link>
              </li>
              <li>
                <Link
                  to="/requisition/history"
                  className={
                    isActive("/requisition/history") ? "active" : ""
                  }
                >
                  Requisition History
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link
            to="/hr-settings"
            className={isActive("/hr-settings") ? "active" : ""}
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

export default HrSidebar;