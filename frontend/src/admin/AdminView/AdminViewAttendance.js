import React, { useRef, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./AdminViewAttendance.css";

// Helper to convert HH:MM or HH:MM:SS to minutes
const toMinutes = t => {
  if (!t) return 0;
  const [h, m, s] = t.split(":").map(Number);
  return h * 60 + m + (s ? s / 60 : 0);
};

const AdminViewAttendance = () => {
  const fileInputRef = useRef();
  const [attendanceData, setAttendanceData] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Handle file import for both .xlsx and .txt
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    let mapped = [];
    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        mapped = lines.map(line => {
          const cols = line.trim().split(/\s+/);
          return {
            empID: cols[0] || "",
            date: cols[1] || "",
            time: cols[2] || ""
          };
        });
        await sendAttendanceToServer(mapped);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          // Find the first non-empty row as header
          let headerRowIdx = data.findIndex(row => Array.isArray(row) && row.some(cell => cell && cell.toString().trim() !== ""));
          if (headerRowIdx === -1) return;
          const headers = data[headerRowIdx];
          const normalizedHeaders = headers.map(h => (h || "").toString().trim().toLowerCase());
          const headerKeyMap = {
            "employee id": "empID",
            "date": "date",
            "time": "time"
          };
          const rows = data.slice(headerRowIdx + 1).filter(row => Array.isArray(row) && row.some(cell => cell && cell.toString().trim() !== ""));
          mapped = rows.map(row => {
            const obj = {};
            normalizedHeaders.forEach((h, i) => {
              const key = headerKeyMap[h];
              if (key) obj[key] = row[i] || "";
            });
            return {
              empID: obj.empID || "",
              date: obj.date || "",
              time: obj.time || ""
            };
          });
          await sendAttendanceToServer(mapped);
        } catch (err) {
          alert("Failed to parse Excel file. Please check the file format.\n" + err);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file type. Please upload a .xlsx, .xls, or .txt file.");
    }
  };

  // Fetch employee details by empID
  const fetchEmployeeDetails = async (empIDs) => {
    try {
      const response = await fetch('/api/employee/details/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empIDs })
      });
      if (!response.ok) throw new Error('Failed to fetch employee details');
      return await response.json(); // Should be an array of employee details
    } catch (err) {
      alert('Error fetching employee details: ' + err.message);
      return [];
    }
  };

  // Helper: group by empID+date, assign remarks only to earliest/latest per day
  const groupAndRemarkAttendance = (attendanceArr, empIdToDetails) => {
    // Group attendance by empID + date
    const grouped = {};
    attendanceArr.forEach(a => {
      const key = `${a.empID}_${a.date}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    });
    // Build enriched array
    let enriched = [];
    Object.values(grouped).forEach(records => {
      if (!records.length) return;
      const a = records[0];
      const details = empIdToDetails[a.empID] || {};
      let scheduleStr = '', schedStart = '', schedEnd = '';
      if (details.schedule && a.date) {
        const dayOfWeek = new Date(a.date).toLocaleDateString('en-US', { weekday: 'long' });
        const sched = details.schedule[dayOfWeek];
        if (sched && sched.start && sched.end) {
          scheduleStr = `${sched.start} - ${sched.end}`;
          schedStart = sched.start;
          schedEnd = sched.end;
        }
      }
      // Sort records by time
      const sorted = [...records].sort((x, y) => toMinutes(x.time) - toMinutes(y.time));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const startMins = schedStart ? toMinutes(schedStart) : null;
      const endMins = schedEnd ? toMinutes(schedEnd) : null;
      // Assign remarks only to earliest and latest
      sorted.forEach((r, idx) => {
        let remarks = '';
        const mins = toMinutes(r.time);
        if (r === first) {
          // IN
          if (startMins !== null) {
            if (mins <= startMins + 5) {
              remarks = 'ON TIME';
            } else {
              remarks = 'LATE';
            }
          }
        } else if (r === last && sorted.length > 1) {
          // OUT
          if (endMins !== null) {
            if (mins < endMins) {
              remarks = 'UNDERTIME';
            } else if (mins <= endMins + 5) {
              remarks = 'ON TIME';
            } else if (mins > endMins + 5) {
              remarks = 'OVERTIME';
            }
          }
        }
        // All other times: remarks remains ''
        enriched.push({ ...r, name: details.name || '', schedule: scheduleStr, remarks });
      });
    });
    // Sort by date, empID, time
    enriched.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.empID !== b.empID) return a.empID.localeCompare(b.empID);
      return toMinutes(a.time) - toMinutes(b.time);
    });
    return enriched;
  };

  // After importing, fetch names and schedule and merge with attendance data
  const enrichAttendanceWithNamesAndSchedule = async (attendanceArr) => {
    const empIDs = Array.from(new Set(attendanceArr.map(a => a.empID)));
    const employeeDetails = await fetchEmployeeDetails(empIDs);
    // Map empID to name and schedule
    const empIdToDetails = {};
    employeeDetails.forEach(emp => {
      empIdToDetails[emp.employeeID] = {
        name: `${emp.firstName} ${emp.lastName}`,
        schedule: emp.schedule || {}
      };
    });
    return groupAndRemarkAttendance(attendanceArr, empIdToDetails);
  };

  // Send attendance data to backend and update local state
  const sendAttendanceToServer = async (data) => {
    try {
      const response = await fetch("/api/attendance/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      if (!response.ok) throw new Error("Failed to import attendance data");
      // Enrich with names and schedule after import
      const enriched = await enrichAttendanceWithNamesAndSchedule(data);
      setAttendanceData(enriched); // Update local state for UI
      alert("Attendance data imported successfully.");
    } catch (err) {
      alert("Error importing attendance data: " + err.message);
    }
  };

  // Helper to check if a date is within the range
  const isWithinDateRange = (dateStr) => {
    if (!dateStr) return false;
    if (!startDate && !endDate) return true;
    const entryDate = new Date(dateStr);
    if (isNaN(entryDate)) return false;
    if (startDate && entryDate < new Date(startDate)) return false;
    if (endDate && entryDate > new Date(endDate)) return false;
    return true;
  };

  // Filtered attendance data by empID or name and date range
  const filteredAttendance = attendanceData.filter(entry => {
    const empIdMatch = entry.empID?.toLowerCase().includes(search.toLowerCase());
    const nameMatch = entry.name?.toLowerCase().includes(search.toLowerCase());
    const dateMatch = isWithinDateRange(entry.date);
    return (empIdMatch || nameMatch) && dateMatch;
  });

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
    // Always show 2 preceding, current, and 2 succeeding
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    // Adjust if at start or end
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

  // Reset page to 1 when search or date filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate]);

  // On mount, fetch attendance data from backend if available
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance");
        if (!response.ok) throw new Error("Failed to fetch attendance data");
        const data = await response.json();
        // Enrich with names and schedule for display
        const empIDs = Array.from(new Set(data.map(a => a.empID)));
        const employeeDetails = await fetchEmployeeDetails(empIDs);
        const empIdToDetails = {};
        employeeDetails.forEach(emp => {
          empIdToDetails[emp.employeeID] = {
            name: `${emp.firstName} ${emp.lastName}`,
            schedule: emp.schedule || {}
          };
        });
        const enriched = groupAndRemarkAttendance(data, empIdToDetails);
        setAttendanceData(enriched);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchAttendance();
  }, []);

  return (
    <>
      <div className="adminviewattendance-banner">
        <h1 className="dashboard-banner-title">ATTENDANCE MANAGEMENT</h1>
      </div>
      <div className="adminviewattendance-import-searchbar-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="adminviewattendance-import-btn-container">
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ padding: "8px 18px", fontWeight: 600, background: "#2583d8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Import File
            </button>
            <input
              type="file"
              accept=".xlsx, .xls, .txt"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImport}
            />
          </div>
          <div className="adminviewattendance-searchbar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              className="adminviewattendance-input"
              type="text"
              placeholder="Search by Employee ID or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <input
              className="adminviewattendance-input"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Start Date"
              style={{ minWidth: 0 }}
            />
            <span style={{ color: '#888', fontWeight: 500 }}>to</span>
            <input
              className="adminviewattendance-input"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="End Date"
              style={{ minWidth: 0 }}
            />
            <button
              className="adminviewattendance-reset-btn"
              title="Reset filters"
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2583d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
          </div>
        </div>
        <div className="adminviewattendance-pagination-bar" style={{ marginLeft: 'auto' }}>
          <button onClick={() => goToPage(Math.max(1, currentPage - 10))} disabled={currentPage === 1} className="adminviewattendance-page-btn">{'<<'}</button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="adminviewattendance-page-btn">{'<'}</button>
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`adminviewattendance-page-btn${page === currentPage ? ' adminviewattendance-page-current' : ''}`}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="adminviewattendance-page-btn">{'>'}</button>
          <button onClick={() => goToPage(Math.min(totalPages, currentPage + 10))} disabled={currentPage === totalPages || totalPages === 0} className="adminviewattendance-page-btn">{'>>'}</button>
        </div>
      </div>
      <div className="adminviewattendance-container">
        <div className="table-container">
          <table className="adminviewattendance-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Schedule</th>
                <th>Date</th>
                <th>Time in/Out</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendance.length === 0 ? (
                <tr><td colSpan={6} className="no-employees">No records found.</td></tr>
              ) : (
                paginatedAttendance.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{entry.empID}</td>
                    <td>{entry.name}</td>
                    <td>{entry.schedule}</td>
                    <td>{entry.date}</td>
                    <td>{entry.time}</td>
                    <td>{entry.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminViewAttendance;