import React, { useState } from "react";
import "./AdminLeaveRequest.css";

const AdminLeaveRequest = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    purpose: "",
    startDate: "",
    endDate: "",
    time: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert("Leave request submitted successfully!");
        setFormData({
          leaveType: "",
          purpose: "",
          startDate: "",
          endDate: "",
          time: "",
          reason: "",
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
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="leaveType">Leave Type</label>
            <select
              name="leaveType"
              id="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
            >
              <option value="">Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation Leave">Vacation Leave</option>
            </select>
          </div>
          <div>
            <label htmlFor="purpose">Purpose</label>
            <select
              name="purpose"
              id="purpose"
              value={formData.purpose}
              onChange={handleChange}
            >
              <option value="">Purpose</option>
              <option value="Medical">Medical</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="time">Time</label>
            <input
              type="time"
              name="time"
              id="time"
              value={formData.time}
              onChange={handleChange}
            />
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
