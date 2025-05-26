import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import "./AdminViewAttendance.css";

const AdminViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([
    {
      id: "EMP001",
      date: "2025-04-10",
      name: "John Doe",
      schedule: "9:00 AM - 6:00 PM",
      timeIn: "9:01 AM",
      timeOut: "6:00 PM",
      remarks: "Present",
    },
    {
      id: "EMP002",
      date: "2025-04-10",
      name: "Jane Smith",
      schedule: "9:00 AM - 6:00 PM",
      timeIn: "9:05 AM",
      timeOut: "5:58 PM",
      remarks: "Late",
    },
    {
      id: "EMP003",
      date: "2025-04-10",
      name: "Mark Lee",
      schedule: "8:00 AM - 5:00 PM",
      timeIn: "8:00 AM",
      timeOut: "5:01 PM",
      remarks: "Present",
    },
  ]);
  const fileInputRef = useRef();

  // Helper to parse time string to Date object (today's date)
  function parseTime(timeStr) {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier && modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier && modifier.toLowerCase() === "am" && hours === 12) hours = 0;
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
  }

  // Compare timeIn with schedule start
  function getRemarks(timeIn, schedule) {
    if (!timeIn || !schedule) return "";
    // Defensive: ensure timeIn and schedule are strings
    if (typeof timeIn !== "string") timeIn = String(timeIn || "");
    if (typeof schedule !== "string") schedule = String(schedule || "");
    const [start] = schedule.split("-");
    const schedStart = parseTime(start.trim());
    const inTime = parseTime(timeIn.trim());
    if (!schedStart || !inTime) return "";
    return inTime > schedStart ? "Late" : "On Time";
  }

  // Handle Excel import
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        console.log("Raw Excel data:", data);
        // Find the first non-empty row as header
        let headerRowIdx = data.findIndex(row => Array.isArray(row) && row.some(cell => cell && cell.toString().trim() !== ""));
        if (headerRowIdx === -1) {
          alert("No header row found in Excel file. Please check your file format.");
          return;
        }
        const headers = data[headerRowIdx];
        // Normalize headers: trim and lowercase
        const normalizedHeaders = headers.map(h => (h || "").toString().trim().toLowerCase());
        // Map normalized header names to expected keys
        const headerKeyMap = {
          "employee id": "id",
          "date": "date",
          "employee": "name",
          "work schedule": "schedule",
          "time in": "timeIn",
          "time out": "timeOut",
          "remarks": "remarks"
        };
        // All rows after header
        const rows = data.slice(headerRowIdx + 1).filter(row => Array.isArray(row) && row.some(cell => cell && cell.toString().trim() !== ""));
        if (rows.length === 0) {
          alert("No data rows found in Excel file. Please check your file format.");
          return;
        }
        const mapped = rows.map(row => {
          const obj = {};
          normalizedHeaders.forEach((h, i) => {
            const key = headerKeyMap[h];
            if (key) obj[key] = row[i] || "";
          });
          // Convert Excel date serial to yyyy-mm-dd if needed
          let dateVal = obj.date;
          if (!isNaN(dateVal) && dateVal !== "") {
            // Excel date serial to JS date
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const jsDate = new Date(excelEpoch.getTime() + (Number(dateVal) * 86400000));
            obj.date = jsDate.toISOString().slice(0, 10);
          }
          // Convert Excel time serials to HH:MM AM/PM if needed
          function excelTimeToString(val) {
            if (typeof val === "number") {
              let totalMinutes = Math.round(val * 24 * 60);
              let hours = Math.floor(totalMinutes / 60);
              let minutes = totalMinutes % 60;
              let ampm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12;
              if (hours === 0) hours = 12;
              return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }
            return val;
          }
          obj.timeIn = excelTimeToString(obj.timeIn);
          obj.timeOut = excelTimeToString(obj.timeOut);
          // Auto-remarks
          obj.remarks = getRemarks(obj.timeIn, obj.schedule);
          return {
            id: obj.id || "",
            date: obj.date || "",
            name: obj.name || "",
            schedule: obj.schedule || "",
            timeIn: obj.timeIn || "",
            timeOut: obj.timeOut || "",
            remarks: obj.remarks || "",
          };
        });
        console.log("Mapped data:", mapped);
        setAttendanceData(mapped);
      } catch (err) {
        alert("Failed to parse Excel file. Please check the file format.\n" + err);
        console.error("Excel import error:", err);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <div className="adminviewattendance-banner">
        <h1 className="dashboard-banner-title">ADMIN VIEW ATTENDANCE</h1>
      </div>
      {/* Import Excel Button */}
      <div className="adminviewattendance-import-btn-container">
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{ padding: "8px 18px", fontWeight: 600, background: "#2583d8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          Import Excel
        </button>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImport}
        />
      </div>
      <div className="adminviewattendance-container">
        <table className="adminviewattendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Employee</th>
              <th>Work Schedule</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.id}</td>
                <td>{entry.date}</td>
                <td>{entry.name}</td>
                <td>{entry.schedule}</td>
                <td>{entry.timeIn}</td>
                <td>{entry.timeOut}</td>
                <td>{entry.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminViewAttendance;
