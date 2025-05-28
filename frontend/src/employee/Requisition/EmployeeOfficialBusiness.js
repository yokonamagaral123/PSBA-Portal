import React, { useState } from "react";
import "./EmployeeOfficialBusiness.css";

const EmployeeOfficialBusiness = () => {
  const [formData, setFormData] = useState({
    category: "",
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
        body: JSON.stringify({ ...formData, type: "Official Business" }),
      });
      if (response.ok) {
        alert("Official Business request submitted!");
        setFormData({
          category: "",
          startDate: "",
          endDate: "",
          time: "",
          reason: "",
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit request.");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <div className="employee-ob-banner">
        <h1 className="employee-ob-banner-title">OFFICIAL BUSINESS</h1>
      </div>
      <div className="employee-ob-content">
        <h1>Official Business</h1>
        <form onSubmit={handleSubmit}>
          <div className="employee-ob-row">
            <div className="employee-ob-field">
              <label htmlFor="category">Category</label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Category</option>
                <option value="Outside OB">Outside OB</option>
                <option value="Overtime">Overtime</option>
                <option value="Offsetting">Offsetting</option>
              </select>
            </div>
            <div className="employee-ob-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="employee-ob-field">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
            <div className="employee-ob-field">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                name="time"
                id="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="employee-ob-reason-container">
            <label htmlFor="reason">Reason</label>
            <textarea
              name="reason"
              id="reason"
              placeholder="Enter your reason..."
              value={formData.reason}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="employee-ob-submit-container">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EmployeeOfficialBusiness;
