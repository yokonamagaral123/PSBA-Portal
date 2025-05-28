import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import "./AdminViewAttendance.css";

const AdminViewAttendance = () => {
  const fileInputRef = useRef();
  const [attendanceData, setAttendanceData] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    // Merge name and schedule into attendance, and add remarks for LATE/OVERTIME
    return attendanceArr.map(a => {
      const details = empIdToDetails[a.empID] || {};
      let scheduleStr = '';
      let remarks = '';
      let schedStart = '', schedEnd = '';
      if (details.schedule && a.date) {
        // Get day of week from date
        const dayOfWeek = new Date(a.date).toLocaleDateString('en-US', { weekday: 'long' });
        const sched = details.schedule[dayOfWeek];
        if (sched && sched.start && sched.end) {
          scheduleStr = `${sched.start} - ${sched.end}`;
          schedStart = sched.start;
          schedEnd = sched.end;
        }
      }
      // Parse times for logic
      if (schedStart && schedEnd && a.time) {
        // Convert to minutes for comparison
        const toMinutes = t => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        const startMins = toMinutes(schedStart);
        const endMins = toMinutes(schedEnd);
        // Support time in/out as e.g. '07:15', '18:30', etc.
        const entryMins = toMinutes(a.time);
        if (entryMins > startMins && entryMins <= endMins) {
          remarks = 'LATE';
        } else if (entryMins > endMins) {
          remarks = 'OVERTIME';
        } else {
          remarks = '';
        }
      }
      return {
        ...a,
        name: details.name || '',
        schedule: scheduleStr,
        remarks
      };
    });
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

  return (
    <>
      <div className="adminviewattendance-banner">
        <h1 className="dashboard-banner-title">ATTENDANCE MANAGEMENT</h1>
      </div>
      <div className="adminviewattendance-import-searchbar-row">
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
              {filteredAttendance.length === 0 ? (
                <tr><td colSpan={6} className="no-employees">No records found.</td></tr>
              ) : (
                filteredAttendance.map((entry, idx) => (
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