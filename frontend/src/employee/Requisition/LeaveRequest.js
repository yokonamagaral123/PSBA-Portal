import React, { useState } from "react";
import "./LeaveRequest.css";

const LeaveRequest = () => {
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
    const response = await fetch("http://localhost:5000/api/requisitions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token for authentication
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
      {/* Leave Request Banner */}
      <div className="leave-request-banner">
        <h1 className="leave-request-banner-title">LEAVE REQUEST</h1>
      </div>

      {/* Leave Request Content */}
      <div className="content">
        <h1>Leave Request</h1>
        <form onSubmit={handleSubmit}>
          <select name="leaveType" value={formData.leaveType} onChange={handleChange}>
            <option value="">Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Vacation Leave">Vacation Leave</option>
          </select>
          <select name="purpose" value={formData.purpose} onChange={handleChange}>
            <option value="">Purpose</option>
            <option value="Medical">Medical</option>
            <option value="Personal">Personal</option>
          </select>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          <input type="time" name="time" value={formData.time} onChange={handleChange} />
          <textarea
            name="reason"
            placeholder="Reason..."
            value={formData.reason}
            onChange={handleChange}
          ></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default LeaveRequest;