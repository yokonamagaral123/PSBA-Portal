import React, { useState } from "react";
import "./GeneralRequest.css";

const GeneralRequest = () => {
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
      <div className="general-request-banner">
        <h1 className="general-request-banner-title">GENERAL REQUEST</h1>
      </div>
      <div className="content">
        <h1>General Request</h1>
        <form onSubmit={handleSubmit}>
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="">Department</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
          </select>
          <select name="purpose" value={formData.purpose} onChange={handleChange}>
            <option value="">Purpose</option>
            <option value="Equipment Request">Equipment Request</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          <input type="time" name="time" value={formData.time} onChange={handleChange} />
          <textarea name="reason" placeholder="Reason..." value={formData.reason} onChange={handleChange}></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default GeneralRequest;