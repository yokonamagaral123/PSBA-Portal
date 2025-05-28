import React, { useState, useEffect } from "react";
import "./AdminLeaveRequest.css";

const AdminLeaveRequest = () => {
  const [formData, setFormData] = useState({
    category: "",
    startDate: "",
    endDate: "",
    time: "",
    reason: "",
    dayType: "whole day",
  });

  // Leave credits state (fetched from backend)
  const [leaveCredits, setLeaveCredits] = useState({
    "Sick Leave": 0,
    "Vacation Leave": 0,
  });

  // Business rule warning state
  const [warning, setWarning] = useState("");

  // Fetch leave credits from backend
  const fetchCredits = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch("http://localhost:5000/api/user/leave-credits", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setLeaveCredits({
        "Sick Leave": data.sick,
        "Vacation Leave": data.vacation
      });
    }
  };

  // Fetch leave credits on mount
  useEffect(() => {
    fetchCredits();
  }, []);

  // Validate vacation leave rule
  useEffect(() => {
    let warn = "";
    if (formData.category === "Vacation Leave" && formData.startDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = new Date(formData.startDate);
      start.setHours(0,0,0,0);
      const diffDays = Math.round((start - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 3) {
        warn = "Vacation Leave must be filed at least 3 days in advance.";
      }
    }
    setWarning(warn);
  }, [formData.category, formData.startDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent submit if vacation leave rule is violated
    if (warning) {
      alert(warning);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please log in first.");
        return;
      }
      const response = await fetch("http://localhost:5000/api/requisitions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, type: "Leave Request" }),
      });

      const data = await response.json();
      if (response.ok) {
        // Fetch updated leave credits from backend
        await fetchCredits();
        alert("Leave request submitted successfully!");
        setFormData({
          category: "",
          startDate: "",
          endDate: "",
          time: "",
          reason: "",
          dayType: "whole day",
        });
      } else {
        alert(data.message || "Failed to submit leave request");
      }
    } catch (err) {
      console.error("Error submitting leave request:", err);
      alert("Error connecting to server");
    }
  };

  return (
    <>
      <div className="admin-leave-request-banner">
        <h1 className="admin-leave-request-banner-title">ADMIN LEAVE REQUEST</h1>
      </div>
      <div className="admin-leave-request-content">
        <h1>Admin Leave Request</h1>
        {/* Leave Credits Icons BELOW the heading */}
        <div style={{ display: "flex", gap: "30px", margin: "20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span role="img" aria-label="Vacation">🌴</span>
            <span>Vacation Leave: <b>{leaveCredits["Vacation Leave"]}</b></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span role="img" aria-label="Sick">🤒</span>
            <span>Sick Leave: <b>{leaveCredits["Sick Leave"]}</b></span>
          </div>
        </div>
        {/* Business Rule Warning */}
        {warning && (
          <div className="admin-leave-warning" style={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: 16, fontSize: 16, border: '1px solid #d32f2f', background: '#fff6f6', padding: 10, borderRadius: 6 }}>
            {warning}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="admin-leave-request-row">
            <div className="admin-leave-request-field">
              <label htmlFor="category">Category</label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Category</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Vacation Leave">Vacation Leave</option>
              </select>
            </div>
            <div className="admin-leave-request-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="admin-leave-request-field">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
            <div className="admin-leave-request-field">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                name="time"
                id="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
            <div className="admin-leave-request-field">
              <label htmlFor="dayType">Day Type</label>
              <select
                name="dayType"
                id="dayType"
                value={formData.dayType}
                onChange={handleChange}
              >
                <option value="whole day">Whole Day</option>
                <option value="half day">Half Day</option>
              </select>
            </div>
          </div>

          {/* Reason Field */}
          <div className="reason-container">
            <label htmlFor="reason">Reason</label>
            <textarea
              name="reason"
              id="reason"
              placeholder="Enter your reason..."
              value={formData.reason}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="submit-container">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminLeaveRequest;
