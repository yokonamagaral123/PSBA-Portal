import React, { useState } from "react";
import "./AdminGeneralRequest.css";

const AdminGeneralRequest = () => {
  const [formData, setFormData] = useState({
    department: "",
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
        body: JSON.stringify({ ...formData, type: "General Request" }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Request submitted successfully!");
        setFormData({
          department: "",
          purpose: "",
          startDate: "",
          endDate: "",
          time: "",
          reason: "",
        });
      } else {
        alert(data.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error connecting to server");
    }
  };

  return (
    <>
      <div className="admin-general-request-banner">
        <h1 className="admin-general-request-banner-title">ADMIN GENERAL REQUEST</h1>
      </div>
      <div className="admin-general-request-content">
        <h1>Admin General Request</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
            </select>
          </div>
          <div>
            <label htmlFor="purpose">Purpose</label>
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
            >
              <option value="">Select Purpose</option>
              <option value="Equipment Request">Equipment Request</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
            />
          </div>

          {/* Reason Field */}
          <div className="reason-container">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
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

export default AdminGeneralRequest;
