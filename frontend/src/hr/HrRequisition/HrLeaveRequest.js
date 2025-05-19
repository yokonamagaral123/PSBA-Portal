import React, { useState, useEffect } from "react";
import "./HrLeaveRequest.css";

const HrLeaveRequest = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    purpose: "",
    startDate: "",
    endDate: "",
    time: "",
    reason: "",
  });

  // Leave credits state (fetched from backend)
  const [leaveCredits, setLeaveCredits] = useState({
    "Sick Leave": 0,
    "Vacation Leave": 0,
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
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
      {/* HR Leave Request Banner */}
      <div className="leave-request-banner">
        <h1 className="leave-request-banner-title">HR LEAVE REQUEST</h1>
      </div>

      {/* HR Leave Request Content */}
      <div className="content">
        <h1>HR Leave Request</h1>
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

export default HrLeaveRequest;