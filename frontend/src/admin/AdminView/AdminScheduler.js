import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminScheduler.css";

const AdminScheduler = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState(""); 
  const [schedule, setSchedule] = useState({
    Sunday: { start: "", end: "" },
    Monday: { start: "", end: "" },
    Tuesday: { start: "", end: "" },
    Wednesday: { start: "", end: "" },
    Thursday: { start: "", end: "" },
    Friday: { start: "", end: "" },
    Saturday: { start: "", end: "" },
  });
  const [saving, setSaving] = useState(false);
  const [checkedDays, setCheckedDays] = useState([]); // Array of days with checkmark

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

  // Fetch schedule for selected employee
  const fetchEmployeeSchedule = async (emp) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/admin/employees/${emp._id}/schedule`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.schedule) {
        setSchedule({
          Sunday: res.data.schedule.Sunday || { start: "", end: "" },
          Monday: res.data.schedule.Monday || { start: "", end: "" },
          Tuesday: res.data.schedule.Tuesday || { start: "", end: "" },
          Wednesday: res.data.schedule.Wednesday || { start: "", end: "" },
          Thursday: res.data.schedule.Thursday || { start: "", end: "" },
          Friday: res.data.schedule.Friday || { start: "", end: "" },
          Saturday: res.data.schedule.Saturday || { start: "", end: "" },
        });
      } else {
        setSchedule({
          Sunday: { start: "", end: "" },
          Monday: { start: "", end: "" },
          Tuesday: { start: "", end: "" },
          Wednesday: { start: "", end: "" },
          Thursday: { start: "", end: "" },
          Friday: { start: "", end: "" },
          Saturday: { start: "", end: "" },
        });
      }
      setCheckedDays([]);
      setSelectedEmployee(emp);
    } catch (err) {
      setSchedule({
        Sunday: { start: "", end: "" },
        Monday: { start: "", end: "" },
        Tuesday: { start: "", end: "" },
        Wednesday: { start: "", end: "" },
        Thursday: { start: "", end: "" },
        Friday: { start: "", end: "" },
        Saturday: { start: "", end: "" },
      });
      setCheckedDays([]);
      setSelectedEmployee(emp);
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

  // Handle tickbox check/uncheck
  const handleCheckboxChange = (day) => {
    setCheckedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Universal copy: copy the first filled time (from ticked boxes only) to all ticked days
  const handleUniversalCopy = () => {
    // Only consider ticked days for the "first filled" rule
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let source = null;
    for (let day of days) {
      if (
        checkedDays.includes(day) &&
        schedule[day].start &&
        schedule[day].end
      ) {
        source = schedule[day];
        break;
      }
    }
    if (!source) {
      alert("Please fill in a start and end time for at least one ticked day.");
      return;
    }
    setSchedule(prev => {
      const updated = { ...prev };
      checkedDays.forEach(day => {
        updated[day] = { start: source.start, end: source.end };
      });
      return updated;
    });
  };

  // Save schedule to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setSaving(true);

    // Set REST DAY for days with no time
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const scheduleWithRest = { ...schedule };
    days.forEach(day => {
      if (!scheduleWithRest[day].start && !scheduleWithRest[day].end) {
        scheduleWithRest[day] = { start: "REST", end: "DAY" };
      }
    });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/employees/${selectedEmployee._id}/schedule`,
        { schedule: scheduleWithRest },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Schedule updated!");
      setSelectedEmployee(null);
    } catch (err) {
      alert("Failed to update schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-scheduler-banner">
        <h1 className="admin-scheduler-banner-title">SCHEDULER</h1>
      </div>

      <div className="admin-scheduler-main">
        <h1 className="admin-scheduler-title">Select Employee to Set Schedule</h1>
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
                        onClick={() => fetchEmployeeSchedule(emp)}
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
                  <span className="scheduler-time-label scheduler-copy-label" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Copy
                    <button
                      type="button"
                      className="scheduler-copy-btn"
                      onClick={handleUniversalCopy}
                      title="Copy the first filled time to all ticked days"
                      style={{ marginLeft: 6 }}
                    >
                      &#x2398;
                    </button>
                  </span>
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
                    <input
                      type="checkbox"
                      className="scheduler-copy-checkbox"
                      checked={checkedDays.includes(day)}
                      onChange={() => handleCheckboxChange(day)}
                      title="Tick to include this day as a copy target"
                    />
                    <button
                      type="button"
                      className="scheduler-reset-btn"
                      title="Reset this day's time"
                      onClick={() => setSchedule(prev => ({
                        ...prev,
                        [day]: { start: "", end: "" }
                      }))}
                      tabIndex={-1}
                    >
                      &#10006;
                    </button>
                  </div>
                ))}
                <button type="submit" className="scheduler-submit-btn" disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>
              </form>
              <div style={{ marginTop: 10, fontSize: "0.95rem", color: "#1976d2" }}>
                <span>
                  Tick the days you want to copy to, fill a time on any ticked day, then click the copy button (⎘).
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminScheduler;