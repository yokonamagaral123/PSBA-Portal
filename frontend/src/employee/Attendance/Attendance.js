import React, { useState, useEffect } from "react";
import "./Attendance.css";

const rowsPerPage = 50;

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showClockModal, setShowClockModal] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [employeeId, setEmployeeId] = useState("");
  const [employeeSchedule, setEmployeeSchedule] = useState({});

  // Fetch employee ID and schedule for the logged-in user
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch("/api/employee/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.employee && data.employee.employeeID) {
          setEmployeeId(data.employee.employeeID);
          setEmployeeSchedule(data.employee.schedule || {});
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchEmployeeDetails();
  }, []);

  // Fetch attendance for the logged-in user from backend (Logger model)
  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/logger/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceData(data.records);
        // Check if user has already logged in today but not yet logged out
        const today = new Date();
        const dateStr =
          today.getFullYear() +
          "-" +
          String(today.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(today.getDate()).padStart(2, "0");
        const todayRecord = data.records.find(
          (row) => row.date === dateStr && row.employeeID === employeeId
        );
        if (todayRecord) {
          setHasLoggedIn(!!todayRecord.timeIn && !todayRecord.timeOut);
        } else {
          setHasLoggedIn(false);
        }
      }
    };
    fetchAttendance();
  }, [employeeId, showClockModal]);

  // Real-time clock effect
  useEffect(() => {
    if (!showClockModal) return;
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, [showClockModal]);

  // Date range filter
  const isWithinDateRange = (dateStr) => {
    if (!dateStr) return false;
    if (!startDate && !endDate) return true;
    const entryDate = new Date(dateStr);
    if (isNaN(entryDate)) return false;
    if (startDate && entryDate < new Date(startDate)) return false;
    if (endDate && entryDate > new Date(endDate)) return false;
    return true;
  };

  // Filtered data
  const filteredAttendance = attendanceData.filter((entry) =>
    isWithinDateRange(entry.date)
  );

  // Pagination logic
  const totalRows = filteredAttendance.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Pagination controls
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 1) return pages;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 2) {
      end = Math.min(totalPages, 5);
    }
    if (currentPage >= totalPages - 1) {
      start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleLogTimeIn = async () => {
    const now = new Date(clock);
    const dateStr =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const timeStr = now.toLocaleTimeString([], { hour12: false });
    let todaysSchedule = "";
    let remarks = "";
    let schedStart = null;
    if (employeeId && employeeSchedule) {
      const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
      const sched = employeeSchedule[dayOfWeek];
      if (sched && sched.start && sched.end) {
        todaysSchedule = `${sched.start} - ${sched.end}`;
        schedStart = sched.start;
      }
    }
    if (schedStart) {
      const [inH, inM] = timeStr.split(":");
      const [schH, schM] = schedStart.split(":");
      const inMinutes = parseInt(inH) * 60 + parseInt(inM);
      const schMinutes = parseInt(schH) * 60 + parseInt(schM);
      if (inMinutes > schMinutes) {
        remarks = "LATE";
      }
    }
    // POST to backend logger
    const token = localStorage.getItem("token");
    const res = await fetch("/api/logger/log", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: dateStr, timeIn: timeStr, remarks, schedule: todaysSchedule }),
    });
    const data = await res.json();
    if (data.success) {
      setAttendanceData((prev) => {
        const idx = prev.findIndex((row) => row.date === dateStr && row.employeeID === employeeId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], timeIn: timeStr, remarks, schedule: todaysSchedule };
          return updated;
        } else {
          return [
            ...prev,
            { employeeID: employeeId, date: dateStr, timeIn: timeStr, timeOut: "", remarks, schedule: todaysSchedule },
          ];
        }
      });
      setHasLoggedIn(true);
    }
  };

  const handleLogTimeOut = async () => {
    const now = new Date(clock);
    const dateStr =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const timeStr = now.toLocaleTimeString([], { hour12: false });
    let schedStart = null;
    let schedEnd = null;
    if (employeeId && employeeSchedule) {
      const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
      const sched = employeeSchedule[dayOfWeek];
      if (sched && sched.start && sched.end) {
        schedStart = sched.start;
        schedEnd = sched.end;
      }
    }
    // Find today's row for this employee in state (for remarks)
    let remarks = "";
    const prevRow = attendanceData.find((row) => row.date === dateStr && row.employeeID === employeeId);
    if (prevRow && prevRow.remarks) remarks = prevRow.remarks;
    if (schedStart && schedEnd) {
      const [outH, outM] = timeStr.split(":");
      const [schStartH, schStartM] = schedStart.split(":");
      const [schEndH, schEndM] = schedEnd.split(":");
      const outMinutes = parseInt(outH) * 60 + parseInt(outM);
      const schEndMinutes = parseInt(schEndH) * 60 + parseInt(schEndM);
      let tag = "";
      if (outMinutes > schEndMinutes) {
        tag = "OVERTIME";
      } else if (outMinutes < schEndMinutes) {
        tag = "UNDERTIME";
      }
      // Merge with previous remarks, avoid duplicates
      if (tag && !remarks.includes(tag)) {
        remarks = remarks ? `${remarks}/${tag}` : tag;
      }
    }
    // POST to backend logger
    const token = localStorage.getItem("token");
    const res = await fetch("/api/logger/log", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: dateStr, timeOut: timeStr, remarks }),
    });
    const data = await res.json();
    if (data.success) {
      setAttendanceData((prev) => {
        const idx = prev.findIndex((row) => row.date === dateStr && row.employeeID === employeeId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], timeOut: timeStr, remarks };
          return updated;
        } else {
          return [
            ...prev,
            { employeeID: employeeId, date: dateStr, timeIn: "", timeOut: timeStr, remarks },
          ];
        }
      });
      setHasLoggedIn(false);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  return (
    <>
      {/* Attendance Banner */}
      <div className="attendance-banner">
        <h1 className="attendance-banner-title">ATTENDANCE</h1>
      </div>
      <div className="attendance-filter-row">
        <div className="attendance-log-btn-container">
          <button
            className="attendance-log-btn"
            onClick={() => setShowClockModal(true)}
          >
            Log time
          </button>
        </div>
        <input
          className="attendance-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          style={{ minWidth: 0 }}
        />
        <span
          style={{
            color: "#888",
            fontWeight: 500,
            margin: "0 8px",
          }}
        >
          to
        </span>
        <input
          className="attendance-input"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
          style={{ minWidth: 0 }}
        />
        <button
          className="attendance-reset-btn"
          title="Reset filters"
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2583d8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <div
          className="attendance-pagination-bar"
          style={{ marginLeft: "auto" }}
        >
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 10))}
            disabled={currentPage === 1}
            className="attendance-page-btn"
          >
            {"<<"}
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="attendance-page-btn"
          >
            {"<"}
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`attendance-page-btn${
                page === currentPage ? " attendance-page-current" : ""
              }`}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="attendance-page-btn"
          >
            {">"}
          </button>
          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 10))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="attendance-page-btn"
          >
            {">>"}
          </button>
        </div>
      </div>
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Schedule</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAttendance.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-employees">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedAttendance.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.employeeID}</td>
                  <td>{entry.schedule}</td>
                  <td>{entry.date}</td>
                  <td>{entry.timeIn}</td>
                  <td>{entry.timeOut}</td>
                  <td>{entry.remarks}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showClockModal && (
        <div className="attendance-modal-overlay">
          <div className="attendance-modal">
            <button
              className="attendance-modal-close"
              onClick={() => setShowClockModal(false)}
            >
              &times;
            </button>
            <div className="attendance-clock-day">
              {clock
                .toLocaleDateString(undefined, { weekday: "long" })
                .toUpperCase()}
            </div>
            <div className="attendance-clock-time">
              {clock.toLocaleTimeString([], { hour12: false })}
            </div>
            <div className="attendance-clock-date">
              {clock.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="attendance-clock-btn-row">
              <button
                className="attendance-clock-action-btn"
                onClick={handleLogTimeIn}
                disabled={hasLoggedIn}
              >
                Log Time In
              </button>
              <button
                className="attendance-clock-action-btn"
                onClick={handleLogTimeOut}
                disabled={!hasLoggedIn}
              >
                Log Time Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Attendance;