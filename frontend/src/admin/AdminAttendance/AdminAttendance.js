import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import "./AdminAttendance.css";

const AdminAttendance = () => {
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
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Find header row
      const headers = data[0];
      const rows = data.slice(1).filter(row => row.length > 0);
      const mapped = rows.map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] || "";
        });
        // Auto-remarks
        obj.remarks = getRemarks(obj["Time In"], obj["Work Schedule"]);
        return {
          id: obj["Employee ID"] || obj["id"] || "",
          date: obj["Date"] || obj["date"] || "",
          name: obj["Employee"] || obj["Name"] || obj["name"] || "",
          schedule: obj["Work Schedule"] || obj["schedule"] || "",
          timeIn: obj["Time In"] || obj["timeIn"] || "",
          timeOut: obj["Time Out"] || obj["timeOut"] || "",
          remarks: obj.remarks || "",
        };
      });
      setAttendanceData(mapped);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      {/* Attendance Banner */}
      <div className="admin-attendance-banner">
        <h1 className="admin-attendance-banner-title">ATTENDANCE</h1>
      </div>

      {/* Import Excel Button */}
      <div style={{ margin: "20px 0" }}>
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

      {/* Attendance Content */}
      <div className="admin-attendance-main">
        <h1 className="admin-attendance-title">Attendance</h1>
        <table className="admin-attendance-table">
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

export default AdminAttendance;