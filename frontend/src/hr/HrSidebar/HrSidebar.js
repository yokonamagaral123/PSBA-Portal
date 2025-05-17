import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HrSidebar.css";
import { FaBars, FaTachometerAlt, FaUser, FaCog, FaSignOutAlt, FaClock, FaFileAlt } from "react-icons/fa";

const HrSidebar = ({ isMinimized, toggleSidebar }) => {
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [isHrViewOpen, setIsHrViewOpen] = useState(false);
  const location = useLocation();

  const toggleRequisition = () => {
    setIsRequisitionOpen(!isRequisitionOpen);
  };

  // Function to check if the current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`hrsidebar${isMinimized ? " minimized" : ""}`}>
      <div className="hrsidebar-header">
        {!isMinimized && <h2>HR Portal</h2>}
        <span className="hr-menu-icon" onClick={toggleSidebar}>
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
        <li className="hr-dropdown">
          <span onClick={toggleRequisition} className="hr-dropdown-toggle">
            <FaFileAlt />
            {!isMinimized && <span>Requisition ▼</span>}
          </span>
          {!isMinimized && isRequisitionOpen && (
            <ul className="hr-dropdown-menu">
              <li>
                <Link
                  to="/hr-general-request"
                  className={isActive("/hr-general-request") ? "active" : ""}
                >
                  General Request
                </Link>
              </li>
              <li>
                <Link
                  to="/hr-leave-request"
                  className={isActive("/hr-leave-request") ? "active" : ""}
                >
                  Leave Request
                </Link>
              </li>
              <li>
                <Link
                  to="/hr-requisition-history"
                  className={isActive("/hr-requisition-history") ? "active" : ""}
                >
                  Requisition History
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className="hr-dropdown">
          <span onClick={() => setIsHrViewOpen(!isHrViewOpen)} className="hr-dropdown-toggle">
            <FaUser />
            {!isMinimized && <span>HR View ▼</span>}
          </span>
          {!isMinimized && isHrViewOpen && (
            <ul className="hr-dropdown-menu">
              <li>
                <Link to="/hr-view/payroll" className={isActive("/hr-view/payroll") ? "active" : ""}>Payroll</Link>
              </li>
              <li>
                <Link to="/hr-view/attendance" className={isActive("/hr-view/attendance") ? "active" : ""}>Attendance</Link>
              </li>
              <li>
                <Link to="/hr-view/requisition" className={isActive("/hr-view/requisition") ? "active" : ""}>Requisition</Link>
              </li>
              <li>
                <Link to="/hr-view/documents" className={isActive("/hr-view/documents") ? "active" : ""}>Documents</Link>
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