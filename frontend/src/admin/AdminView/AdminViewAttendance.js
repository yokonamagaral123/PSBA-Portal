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
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        const mapped = lines.map(line => {
          const cols = line.trim().split(/\s+/);
          return {
            empID: cols[0] || "",
            date: cols[1] || "",
            time: cols[2] || "",
            // Add more fields if needed
          };
        });
        setAttendanceData(mapped);
        console.log("Parsed TXT data:", mapped);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
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
            "date": "date"
            // Add more mappings if needed
          };
          const rows = data.slice(headerRowIdx + 1).filter(row => Array.isArray(row) && row.some(cell => cell && cell.toString().trim() !== ""));
          const mapped = rows.map(row => {
            const obj = {};
            normalizedHeaders.forEach((h, i) => {
              const key = headerKeyMap[h];
              if (key) obj[key] = row[i] || "";
            });
            return {
              empID: obj.empID || "",
              date: obj.date || ""
            };
          });
          setAttendanceData(mapped);
          console.log("Parsed Excel data:", mapped);
        } catch (err) {
          alert("Failed to parse Excel file. Please check the file format.\n" + err);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file type. Please upload a .xlsx, .xls, or .txt file.");
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
        <h1 className="dashboard-banner-title">ADMIN VIEW ATTENDANCE</h1>
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