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
    confirmPassword: "",
    role: "employee",
    sendCredentials: false,
  });
  const [modal, setModal] = useState({ open: false, success: true, message: "" });
  const [step, setStep] = useState(1);
  const [reviewModal, setReviewModal] = useState(false);
  const [stepTouched, setStepTouched] = useState({ 1: false, 2: false, 3: false });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Validation for each step
  const isStep1Valid = formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender;
  const isStep2Valid = formData.email && formData.mobileNumber;
  const isStep3Valid = formData.employeeID && formData.username && formData.temporaryPassword && formData.confirmPassword && (formData.temporaryPassword === formData.confirmPassword);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) {
      setStepTouched((prev) => ({ ...prev, 1: true }));
      return;
    }
    if (step === 2 && !isStep2Valid) {
      setStepTouched((prev) => ({ ...prev, 2: true }));
      return;
    }
    setStep((prev) => {
      const nextStep = prev + 1;
      setStepTouched((touched) => ({ ...touched, [nextStep]: false }));
      return nextStep;
    });
  };
  const handleBack = () => {
    setStep((prev) => {
      const prevStep = prev - 1;
      setStepTouched((touched) => ({ ...touched, [prev]: false }));
      return prevStep;
    });
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!isStep3Valid) {
      setStepTouched((prev) => ({ ...prev, 3: true }));
      if (formData.temporaryPassword !== formData.confirmPassword) {
        setPasswordMismatch(true);
      }
      return;
    }
    setPasswordMismatch(false);
    setReviewModal(true);
  };

  const handleConfirmCreate = async () => {
    setReviewModal(false);
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
          confirmPassword: "",
          role: "employee",
          sendCredentials: false,
        });
        setStep(1);
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
      <form onSubmit={step === 3 ? handleReview : (e) => e.preventDefault()} className="account-creation-form">
        {step === 1 && (
          <>
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
              <div className="dob-field">
                <label htmlFor="dateOfBirth" className="dob-label">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="dob-input"
                />
              </div>
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
            <div className="account-creation-step-actions">
              <button
                type="button"
                className="account-creation-next-button"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
            {stepTouched[1] && !isStep1Valid && (
              <div className="account-creation-warning">Please fill in all required fields to continue.</div>
            )}
          </>
        )}
        {step === 2 && (
          <>
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
            <div className="account-creation-step-actions">
              <button
                type="button"
                className="account-creation-back-button"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="account-creation-next-button"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
            {stepTouched[2] && !isStep2Valid && (
              <div className="account-creation-warning">Please fill in all required fields to continue.</div>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <h2>Employment Details & Account Credentials</h2>
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
              <div className="form-group startdate-block">
                <label htmlFor="startDate" className="startdate-label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="startdate-input"
                />
              </div>
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
            <h3>Account Credentials</h3>
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
              {passwordMismatch && (
                <div className="account-creation-warning" style={{marginBottom: 8}}>Temporary Password and Confirm Password do not match.</div>
              )}
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
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
            <div className="account-creation-step-actions">
              <button
                type="button"
                className="account-creation-back-button"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="submit"
                className="account-creation-submit-button"
              >
                Review Changes
              </button>
            </div>
            {stepTouched[3] && !isStep3Valid && (
              <div className="account-creation-warning">Please fill in all required fields to continue.</div>
            )}
          </>
        )}
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
      {reviewModal && (
        <div className="account-creation-modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="account-creation-modal" onClick={e => e.stopPropagation()}>
            <h2>Review Employee Details</h2>
            <div className="review-details-list" style={{textAlign:'left',maxHeight:'50vh',overflowY:'auto',marginBottom:18}}>
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                <li><strong>First Name:</strong> {formData.firstName}</li>
                <li><strong>Middle Name:</strong> {formData.middleName}</li>
                <li><strong>Last Name:</strong> {formData.lastName}</li>
                <li><strong>Date of Birth:</strong> {formData.dateOfBirth}</li>
                <li><strong>Gender:</strong> {formData.gender}</li>
                <li><strong>Civil Status:</strong> {formData.civilStatus}</li>
                <li><strong>Nationality:</strong> {formData.nationality}</li>
                <li><strong>Email:</strong> {formData.email}</li>
                <li><strong>Mobile Number:</strong> {formData.mobileNumber}</li>
                <li><strong>Home Address:</strong> {formData.homeAddress}</li>
                <li><strong>Emergency Contact Name:</strong> {formData.emergencyContactName}</li>
                <li><strong>Emergency Contact Number:</strong> {formData.emergencyContactNumber}</li>
                <li><strong>Emergency Contact Relation:</strong> {formData.emergencyContactRelation}</li>
                <li><strong>Employee ID:</strong> {formData.employeeID}</li>
                <li><strong>Job Title:</strong> {formData.jobTitle}</li>
                <li><strong>Department:</strong> {formData.department}</li>
                <li><strong>Campus Branch:</strong> {formData.campusBranch}</li>
                <li><strong>Employment Type:</strong> {formData.employmentType}</li>
                <li><strong>Start Date:</strong> {formData.startDate}</li>
                <li><strong>Employment Status:</strong> {formData.employmentStatus}</li>
                <li><strong>Username:</strong> {formData.username}</li>
                <li><strong>Temporary Password:</strong> {'****'}</li>
                <li><strong>Confirm Password:</strong> {'****'}</li>
                <li><strong>Role:</strong> {formData.role}</li>
                <li><strong>Send Credentials:</strong> {formData.sendCredentials ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
              <button className="account-creation-back-button" onClick={() => setReviewModal(false)}>Back</button>
              <button className="account-creation-submit-button" onClick={handleConfirmCreate}>Confirm & Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountCreation;
