import React, { useState, useEffect } from "react";
import "./OfficialBusiness.css";

const OfficialBusiness = () => {
  const [formData, setFormData] = useState({
    category: "",
    startDate: "",
    endDate: "",
    time: "",
    reason: "",
  });

  useEffect(() => {
    // Removed fetchRequisitions function and related code as requested
  }, []);

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
      <div className="officialbusiness-banner">
        <h1 className="officialbusiness-banner-title">OFFICIAL BUSINESS</h1>
      </div>
      <div className="officialbusiness-content">
        <h1>Official Business</h1>
        <form onSubmit={handleSubmit}>
          <div className="officialbusiness-row">
            <div className="officialbusiness-field">
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
            <div className="officialbusiness-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="officialbusiness-field">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
            <div className="officialbusiness-field">
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

          {/* Reason Field */}
          <div className="officialbusiness-reason-container">
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
          <div className="officialbusiness-submit-container">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OfficialBusiness;
