import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminScheduler.css";

const AdminScheduler = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState(""); // For search filter
  const [schedule, setSchedule] = useState({
    Sunday: { start: "", end: "" },
    Monday: { start: "", end: "" },
    Tuesday: { start: "", end: "" },
    Wednesday: { start: "", end: "" },
    Thursday: { start: "", end: "" },
    Friday: { start: "", end: "" },
    Saturday: { start: "", end: "" },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.employees || []);
    } catch (err) {
      alert("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // Filter employees by name, employeeID, or department
  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.middleName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (emp.employeeID && emp.employeeID.toLowerCase().includes(search.toLowerCase())) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  const handleScheduleChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    alert("Schedule submitted:\n" + JSON.stringify(schedule, null, 2));
    // Optionally reset or close modal
  };

  return (
    <>
      <div className="admin-attendance-banner">
        <h1 className="admin-attendance-banner-title">SCHEDULER</h1>
      </div>

      <div className="admin-attendance-main">
        <h1 className="admin-attendance-title">Select Employee to Set Schedule</h1>
        <div className="scheduler-filter-bar">
          <input
            className="scheduler-filter-input"
            type="text"
            placeholder="Search employee by name or ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="scheduler-list-container" style={{ boxShadow: "none", margin: 0, padding: 0, background: "none" }}>
          {loading ? (
            <div className="scheduler-list-loading">Loading...</div>
          ) : (
            <table className="scheduler-list-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>
                    <span style={{ display: "block" }}>Action</span>
                  </th>
                </tr>
                <tr>
                  <th colSpan={5} style={{ padding: 0, background: "transparent" }}>
                    {/* Search bar is already above, so nothing here */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp._id}>
                    <td>{idx + 1}</td>
                    <td>{emp.firstName} {emp.middleName} {emp.lastName}</td>
                    <td>{emp.employeeID}</td>
                    <td>{emp.department}</td>
                    <td>
                      <button
                        className="scheduler-list-view-btn"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSchedule({
                            Sunday: { start: "", end: "" },
                            Monday: { start: "", end: "" },
                            Tuesday: { start: "", end: "" },
                            Wednesday: { start: "", end: "" },
                            Thursday: { start: "", end: "" },
                            Friday: { start: "", end: "" },
                            Saturday: { start: "", end: "" },
                          });
                        }}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {selectedEmployee && (
          <div className="scheduler-list-modal-overlay" onClick={() => setSelectedEmployee(null)}>
            <div className="scheduler-list-modal" onClick={e => e.stopPropagation()}>
              <button className="scheduler-list-modal-close" onClick={() => setSelectedEmployee(null)}>&times;</button>
              <h2>Set Schedule for {selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
              <ul className="scheduler-list-profile-list">
                <li><strong>Employee ID:</strong> {selectedEmployee.employeeID}</li>
                <li><strong>Department:</strong> {selectedEmployee.department}</li>
                <li><strong>Email:</strong> {selectedEmployee.email}</li>
                <li><strong>Job Title:</strong> {selectedEmployee.jobTitle}</li>
              </ul>
              <form className="scheduler-days-form" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
                <div className="scheduler-time-label-row">
                  <span className="scheduler-time-label"></span>
                  <span className="scheduler-time-label">Start time</span>
                  <span className="scheduler-time-label">End time</span>
                </div>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                  <div className="scheduler-day-input-row" key={day}>
                    <label className="scheduler-day-label" htmlFor={`schedule-${day}`}>{day}:</label>
                    <input
                      className="scheduler-day-input"
                      type="time"
                      id={`schedule-${day}-start`}
                      name={`${day}-start`}
                      value={schedule[day].start}
                      onChange={e => handleScheduleChange(day, "start", e.target.value)}
                    />
                    <span className="scheduler-time-separator">to</span>
                    <input
                      className="scheduler-day-input"
                      type="time"
                      id={`schedule-${day}-end`}
                      name={`${day}-end`}
                      value={schedule[day].end}
                      onChange={e => handleScheduleChange(day, "end", e.target.value)}
                    />
                  </div>
                ))}
                <button type="submit" className="scheduler-submit-btn">
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminScheduler;