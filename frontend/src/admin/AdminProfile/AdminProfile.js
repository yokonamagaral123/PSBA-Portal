import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminProfile.css";
import profileImage from "../../assets/profile.png";

const AdminProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const [info, setInfo] = useState({
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
    employmentType: "",
    startDate: "",
    employmentStatus: "",
    username: "",
  });

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authorization token is missing.");
          return;
        }
        const response = await axios.get("http://localhost:5000/api/employee/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setInfo(response.data.employee);
        } else {
          console.error("Failed to fetch profile details:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      }
    };

    fetchProfileDetails();
  }, []);

  const openEditModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="adminprofile-main">
      <div className="adminprofile-banner">
        <h1>Admin Profile</h1>
      </div>

      <div className="adminprofile-container">
        {/* Profile Image and Info */}
        <div className="adminprofile-image-container">
          <img
            src={info.profileImage || profileImage}
            alt="Admin Profile"
            className="adminprofile-image"
          />
          <div className="adminprofile-info">
            <h2>
              {info.firstName} {info.middleName} {info.lastName}
            </h2>
            <p>{info.jobTitle || "Administrator"}</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="adminprofile-bottom">
          {/* Personal Information */}
          <div className="adminprofile-card">
            <h3>Personal Information</h3>
            <ul>
              <li><strong>First Name:</strong> {info.firstName || "N/A"}</li>
              <li><strong>Middle Name:</strong> {info.middleName || "N/A"}</li>
              <li><strong>Last Name:</strong> {info.lastName || "N/A"}</li>
              <li><strong>Date of Birth:</strong> {info.dateOfBirth || "N/A"}</li>
              <li><strong>Gender:</strong> {info.gender || "N/A"}</li>
              <li><strong>Civil Status:</strong> {info.civilStatus || "N/A"}</li>
              <li><strong>Nationality:</strong> {info.nationality || "N/A"}</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="adminprofile-card">
            <h3>Contact Information</h3>
            <ul>
              <li><strong>Email:</strong> {info.email || "N/A"}</li>
              <li><strong>Mobile Number:</strong> {info.mobileNumber || "N/A"}</li>
              <li><strong>Home Address:</strong> {info.homeAddress || "N/A"}</li>
            </ul>
          </div>

          {/* Employment Details */}
          <div className="adminprofile-card">
            <h3>Employment Details</h3>
            <ul>
              <li><strong>Job Title:</strong> {info.jobTitle || "N/A"}</li>
              <li><strong>Department:</strong> {info.department || "N/A"}</li>
              <li><strong>Campus Branch:</strong> {info.campusBranch || "N/A"}</li>
              <li><strong>Employment Type:</strong> {info.employmentType || "N/A"}</li>
              <li><strong>Start Date:</strong> {info.startDate || "N/A"}</li>
              <li><strong>Employment Status:</strong> {info.employmentStatus || "N/A"}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="adminprofile-edit-button-container">
        <button className="adminedit-button" onClick={openEditModal}>
          Edit Profile
        </button>
      </div>

      {showModal && (
        <div className="adminprofile-modal-overlay">
          <div className="adminprofile-modal">
            <button className="adminprofile-modal-close" onClick={closeModal}>
              &times;
            </button>
            <h2>Edit Profile</h2>
            {/* Modal Form */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;