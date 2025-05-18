import React, { useState } from "react";
import axios from "axios";
import "./AdminAccountCreation.css";

const AdminAccountCreation = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    civilStatus: "",
    nationality: "",
    email: "",
    mobileNumber: "",
    homeAddress: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelation: "",
    employeeID: "",
    jobTitle: "",
    department: "",
    campusBranch: "",
    employmentType: "Full-Time",
    startDate: "",
    employmentStatus: "Active",
    username: "",
    temporaryPassword: "",
    role: "employee",
    sendCredentials: false,
  });
  const [modal, setModal] = useState({ open: false, success: true, message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.email ||
      !formData.mobileNumber ||
      !formData.employeeID ||
      !formData.username ||
      !formData.temporaryPassword
    ) {
      setModal({ open: true, success: false, message: "Please fill in all required fields." });
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/create-employee",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 201) {
        setModal({ open: true, success: true, message: "Employee account created successfully!" });
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          civilStatus: "",
          nationality: "",
          email: "",
          mobileNumber: "",
          homeAddress: "",
          emergencyContactName: "",
          emergencyContactNumber: "",
          emergencyContactRelation: "",
          employeeID: "",
          jobTitle: "",
          department: "",
          campusBranch: "",
          employmentType: "Full-Time",
          startDate: "",
          employmentStatus: "Active",
          username: "",
          temporaryPassword: "",
          role: "employee",
          sendCredentials: false,
        });
      }
    } catch (error) {
      let msg = "Failed to create employee account. Please try again.";
      if (error.response && error.response.status === 400) {
        msg = `Error: ${error.response.data.message}`;
      }
      setModal({ open: true, success: false, message: msg });
    }
  };

  const closeModal = () => setModal({ ...modal, open: false });

  return (
    <div className="admin-account-creation">
      <h1>Employee Account Creation Form</h1>
      <form onSubmit={handleSubmit} className="account-creation-form">
        <h2>Personal Information</h2>
        <div className="form-group">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={formData.middleName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="text"
            name="civilStatus"
            placeholder="Civil Status"
            value={formData.civilStatus}
            onChange={handleChange}
          />
          <input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
        </div>

        <h2>Contact Information</h2>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="homeAddress"
            placeholder="Home Address"
            value={formData.homeAddress}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="emergencyContactName"
            placeholder="Emergency Contact Name"
            value={formData.emergencyContactName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="emergencyContactNumber"
            placeholder="Emergency Contact Number"
            value={formData.emergencyContactNumber}
            onChange={handleChange}
          />
          <input
            type="text"
            name="emergencyContactRelation"
            placeholder="Relationship to Emergency Contact"
            value={formData.emergencyContactRelation}
            onChange={handleChange}
          />
        </div>

        <h2>Employment Details</h2>
        <div className="form-group">
          <input
            type="text"
            name="employeeID"
            placeholder="Employee ID"
            value={formData.employeeID}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title / Position"
            value={formData.jobTitle}
            onChange={handleChange}
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="campusBranch"
            placeholder="Campus / Branch Location"
            value={formData.campusBranch}
            onChange={handleChange}
          />
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
          >
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contractual">Contractual</option>
          </select>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <h2>Account Credentials</h2>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="temporaryPassword"
            placeholder="Temporary Password"
            value={formData.temporaryPassword}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="supervisor">Supervisor</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="sendCredentials"
              checked={formData.sendCredentials}
              onChange={handleChange}
            />
            Send login credentials via email?
          </label>
        </div>

        <button type="submit" className="account-creation-submit-button">
          Create Employee Account
        </button>
      </form>
      {modal.open && (
        <div className="account-creation-modal-overlay" onClick={closeModal}>
          <div className="account-creation-modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.success ? "Success" : "Error"}</h2>
            <p>{modal.message}</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountCreation;
