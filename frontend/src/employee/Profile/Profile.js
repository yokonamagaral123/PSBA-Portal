import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import profileImage from "../../assets/profile.png";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
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
    const fetchEmployeeDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage

        if (!token) {
          console.error("Authorization token is missing.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/employee/details", {
          headers: { Authorization: `Bearer ${token}` }, // Send token in the Authorization header
        });

        if (response.data.success) {
          setInfo(response.data.employee);
        } else {
          console.error("Failed to fetch employee details:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };

    fetchEmployeeDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="profile-main">
      <div className="profile-banner">
        <img src={profileImage} alt="Profile" className="profile-image" />
        <div className="profile-info">
          <h2>
            {info.firstName} {info.middleName} {info.lastName}
          </h2>
          <p>{info.location || "Philippine School of Business and Administration"}</p>
        </div>
      </div>

      <div className="profile-details">
        <h3>My Info:</h3>
        <ul>
          <li><strong>First Name:</strong> {info.firstName || "N/A"}</li>
          <li><strong>Middle Name:</strong> {info.middleName || "N/A"}</li>
          <li><strong>Last Name:</strong> {info.lastName || "N/A"}</li>
          <li><strong>Date of Birth:</strong> {info.dateOfBirth || "N/A"}</li>
          <li><strong>Gender:</strong> {info.gender || "N/A"}</li>
          <li><strong>Civil Status:</strong> {info.civilStatus || "N/A"}</li>
          <li><strong>Nationality:</strong> {info.nationality || "N/A"}</li>
          <li><strong>Campus Branch:</strong> {info.campusBranch || "N/A"}</li>
          <li><strong>Job Title/Position:</strong> {info.jobTitle || "N/A"}</li>
          <li><strong>Department:</strong> {info.department || "N/A"}</li>
          <li><strong>Employee ID:</strong> {info.employeeID || "N/A"}</li>
          <li><strong>Employment Type:</strong> {info.employmentType || "N/A"}</li>
          <li><strong>Start Date:</strong> {info.startDate || "N/A"}</li>
          <li><strong>Employment Status:</strong> {info.employmentStatus || "N/A"}</li>
          <li><strong>Username:</strong> {info.username || "N/A"}</li>
        </ul>

        <h3>Contact:</h3>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={info.email}
                onChange={handleChange}
              />
            ) : (
              info.email || "N/A"
            )}
          </li>
          <li>
            <strong>Mobile Number:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="mobileNumber"
                value={info.mobileNumber}
                onChange={handleChange}
              />
            ) : (
              info.mobileNumber || "N/A"
            )}
          </li>
          <li>
            <strong>Home Address:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="homeAddress"
                value={info.homeAddress}
                onChange={handleChange}
              />
            ) : (
              info.homeAddress || "N/A"
            )}
          </li>
          <li>
            <strong>Emergency Contact Name:</strong> {info.emergencyContactName || "N/A"}
          </li>
          <li>
            <strong>Emergency Contact Number:</strong> {info.emergencyContactNumber || "N/A"}
          </li>
          <li>
            <strong>Emergency Contact Relation:</strong> {info.emergencyContactRelation || "N/A"}
          </li>
        </ul>

        <button className="edit-button" onClick={toggleEdit}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
    </div>
  );
};

export default Profile;