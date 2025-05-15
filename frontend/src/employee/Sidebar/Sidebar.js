import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
  FaUser,
  FaClock,
  FaFileAlt,
  FaMoneyBill,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBars,
} from "react-icons/fa";

const Sidebar = ({ isMinimized, toggleSidebar }) => {
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const location = useLocation();

  const toggleRequisition = () => {
    setIsRequisitionOpen(!isRequisitionOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isMinimized ? "minimized" : ""}`}>
      <div className="sidebar-header">
        {!isMinimized && <h2>Employee Portal</h2>}
        <span className="menu-icon" onClick={toggleSidebar}>
          <FaBars />
        </span>
      </div>

      <ul>
        <li>
          <Link
            to="/dashboard"
            className={isActive("/dashboard") ? "active" : ""}
          >
            <FaTachometerAlt /> {!isMinimized && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className={isActive("/profile") ? "active" : ""}
          >
            <FaUser /> {!isMinimized && <span>Profile</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/attendance"
            className={isActive("/attendance") ? "active" : ""}
          >
            <FaClock /> {!isMinimized && <span>Attendance</span>}
          </Link>
        </li>
        <li className="dropdown">
          <span onClick={toggleRequisition} className="dropdown-toggle">
            <FaFileAlt /> {!isMinimized && <span>Requisition ▼</span>}
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
            to="/payroll"
            className={isActive("/payroll") ? "active" : ""}
          >
            <FaMoneyBill /> {!isMinimized && <span>Payroll</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className={isActive("/settings") ? "active" : ""}
          >
            <FaCog /> {!isMinimized && <span>Settings</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/assistbothelp"
            className={isActive("/assistbothelp") ? "active" : ""}
          >
            <FaQuestionCircle /> {!isMinimized && <span>AssistBot/Help</span>}
          </Link>
        </li>
        <li>
          <Link to="/" className={isActive("/") ? "active" : ""}>
            <FaSignOutAlt /> {!isMinimized && <span>Logout</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;