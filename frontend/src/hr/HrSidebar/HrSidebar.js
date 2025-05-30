import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HrSidebar.css";
import { FaBars, FaTachometerAlt, FaUser, FaSignOutAlt, FaClock,FaMoneyBill, FaFileAlt, FaCalendarAlt } from "react-icons/fa";

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
        {!isMinimized && <h2>Supervisor Portal</h2>}
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
        <li>
          <Link
            to="/hr-schedule"
            className={isActive("/hr-schedule") ? "active" : ""}
          >
            <FaCalendarAlt />
            {!isMinimized && <span>Schedule</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/hr-payslip"
            className={isActive("/hr-payslip") ? "active" : ""}
          >
            <FaMoneyBill />
            {!isMinimized && <span>Payslip</span>}
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
                  to="/hr-official-business"
                  className={isActive("/hr-official-business") ? "active" : ""}
                >
                  Official Business
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
            {!isMinimized && <span>Supervisor View ▼</span>}
          </span>
          {!isMinimized && isHrViewOpen && (
            <ul className="hr-dropdown-menu">
              <li>
                <Link to="/hr-view/requisition" className={isActive("/hr-view/requisition") ? "active" : ""}>Requisition</Link>
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

export default HrSidebar;