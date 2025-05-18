import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import profileImage from "../../assets/profile.png";

const Profile = () => {
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
  const [editForm, setEditForm] = useState({ ...info });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

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
          setEditForm(response.data.employee);
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
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = () => {
    setEditForm(info);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Add this function for Cloudinary upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedImageUrl(""); // Reset uploaded image URL
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert("Please select an image first.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "psba-portal-upload");
      formData.append("folder", "employee-profiles"); // Upload to 'employee-profiles' folder
      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dlnvuvomj/image/upload",
        formData
      );
      setUploadedImageUrl(cloudinaryRes.data.secure_url);
      alert("Image uploaded successfully!");
    } catch (error) {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = uploadedImageUrl || info.profileImage;
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authorization token is missing.");
        return;
      }
      const response = await axios.put(
        "http://localhost:5000/api/employee/details",
        { ...editForm, profileImage: finalImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setInfo({ ...editForm, profileImage: finalImageUrl });
        setShowModal(false);
        setImageFile(null);
        setImagePreview("");
        setUploadedImageUrl("");
        alert("Profile updated successfully!");
      } else {
        alert(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  return (
    <div className="profile-main">
      <div className="profile-banner">
        <img
          src={info.profileImage || profileImage}
          alt="Profile"
          className="profile-image"
        />
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
          <li><strong>Date of Birth:</strong> {info.dateOfBirth ? info.dateOfBirth.slice(0,10) : "N/A"}</li>
          <li><strong>Gender:</strong> {info.gender || "N/A"}</li>
          <li><strong>Civil Status:</strong> {info.civilStatus || "N/A"}</li>
          <li><strong>Nationality:</strong> {info.nationality || "N/A"}</li>
          <li><strong>Campus Branch:</strong> {info.campusBranch || "N/A"}</li>
          <li><strong>Job Title/Position:</strong> {info.jobTitle || "N/A"}</li>
          <li><strong>Department:</strong> {info.department || "N/A"}</li>
          <li><strong>Employee ID:</strong> {info.employeeID || "N/A"}</li>
          <li><strong>Employment Type:</strong> {info.employmentType || "N/A"}</li>
          <li><strong>Start Date:</strong> {info.startDate ? info.startDate.slice(0,10) : "N/A"}</li>
          <li><strong>Employment Status:</strong> {info.employmentStatus || "N/A"}</li>
          <li><strong>Username:</strong> {info.username || "N/A"}</li>
        </ul>

        <h3>Contact:</h3>
        <ul>
          <li><strong>Email:</strong> {info.email || "N/A"}</li>
          <li><strong>Mobile Number:</strong> {info.mobileNumber || "N/A"}</li>
          <li><strong>Home Address:</strong> {info.homeAddress || "N/A"}</li>
          <li><strong>Emergency Contact Name:</strong> {info.emergencyContactName || "N/A"}</li>
          <li><strong>Emergency Contact Number:</strong> {info.emergencyContactNumber || "N/A"}</li>
          <li><strong>Emergency Contact Relation:</strong> {info.emergencyContactRelation || "N/A"}</li>
        </ul>

        <button className="edit-button" onClick={openEditModal}>
          Edit
        </button>
      </div>

      {/* Modal Popup for Editing */}
      {showModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal modern-modal">
            <button className="profile-modal-close" onClick={closeModal}>&times;</button>
            <h2>Edit Profile</h2>
            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="profile-edit-grid">
                <label>Profile Image:
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <button type="button" className="edit-button" onClick={handleImageUpload} disabled={!imageFile || uploading} style={{marginLeft:8}}>
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }} />
                  )}
                  {uploadedImageUrl && (
                    <div style={{color:'green',marginTop:4}}>Image uploaded!</div>
                  )}
                </label>
                <label>First Name:<input name="firstName" value={editForm.firstName} onChange={handleChange} required /></label>
                <label>Middle Name:<input name="middleName" value={editForm.middleName} onChange={handleChange} /></label>
                <label>Last Name:<input name="lastName" value={editForm.lastName} onChange={handleChange} required /></label>
                <label>Date of Birth:<input type="date" name="dateOfBirth" value={editForm.dateOfBirth ? editForm.dateOfBirth.slice(0,10) : ""} onChange={handleChange} required /></label>
                <label>Gender:<input name="gender" value={editForm.gender} onChange={handleChange} required /></label>
                <label>Civil Status:<input name="civilStatus" value={editForm.civilStatus} onChange={handleChange} /></label>
                <label>Nationality:<input name="nationality" value={editForm.nationality} onChange={handleChange} /></label>
                <label>Email:<input type="email" name="email" value={editForm.email} onChange={handleChange} required /></label>
                <label>Mobile Number:<input name="mobileNumber" value={editForm.mobileNumber} onChange={handleChange} required /></label>
                <label>Home Address:<input name="homeAddress" value={editForm.homeAddress} onChange={handleChange} /></label>
                <label>Emergency Contact Name:<input name="emergencyContactName" value={editForm.emergencyContactName} onChange={handleChange} /></label>
                <label>Emergency Contact Number:<input name="emergencyContactNumber" value={editForm.emergencyContactNumber} onChange={handleChange} /></label>
                <label>Emergency Contact Relation:<input name="emergencyContactRelation" value={editForm.emergencyContactRelation} onChange={handleChange} /></label>
                <label>Job Title:<input name="jobTitle" value={editForm.jobTitle} onChange={handleChange} /></label>
                <label>Department:<input name="department" value={editForm.department} onChange={handleChange} /></label>
                <label>Campus Branch:<input name="campusBranch" value={editForm.campusBranch} onChange={handleChange} /></label>
                <label>Employment Type:<input name="employmentType" value={editForm.employmentType} onChange={handleChange} /></label>
                <label>Start Date:<input type="date" name="startDate" value={editForm.startDate ? editForm.startDate.slice(0,10) : ""} onChange={handleChange} /></label>
                <label>Employment Status:<input name="employmentStatus" value={editForm.employmentStatus} onChange={handleChange} /></label>
                <label>Username:<input name="username" value={editForm.username} onChange={handleChange} required /></label>
              </div>
              <div className="profile-modal-actions">
                <button type="submit" className="edit-button">Save</button>
                <button type="button" className="edit-button" onClick={closeModal} style={{background:'#ccc',color:'#222'}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;