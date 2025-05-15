import React from "react";
import "./Attendance.css";

const Attendance = () => {
  const attendanceData = [
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
  ];

  return (
    <>
      {/* Attendance Banner */}
      <div className="attendance-banner">
        <h1 className="attendance-banner-title">ATTENDANCE</h1>
      </div>

      {/* Attendance Content */}
      <div className="attendance-main">
        <h1 className="attendance-title">Attendance</h1>
        <table className="attendance-table">
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

export default Attendance;