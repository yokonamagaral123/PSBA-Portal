import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import profileImage from "../../assets/profile.png";

const Profile = () => {
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
    profileImage: "",
    spouseFullName: "",
    numberOfChildren: "",
    childrenNames: [],
    motherMaidenName: "",
    fatherFullName: "",
    deceasedSpouseName: "",
    highestEducationalAttainment: "",
    schoolName: "",
    schoolYearFrom: "",
    schoolYearTo: "",
    yearGraduated: "",
    sssNumber: "",
    pagibigNumber: "",
    philhealthNumber: "",
    tinNumber: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
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
          console.error("Failed to fetch employee details:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };
    fetchEmployeeDetails();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (!validTypes.includes(file.type)) {
        setImageError("Only .jpg, .jpeg, .png files are allowed.");
        setImageFile(null);
        setImagePreview("");
        return;
      }
      if (file.size > maxSize) {
        setImageError("File size must be 15MB or less.");
        setImageFile(null);
        setImagePreview("");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedImageUrl("");
      setImageError("");
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
      formData.append("folder", "employee-profiles");
      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dlnvuvomj/image/upload",
        formData
      );
      setUploadedImageUrl(cloudinaryRes.data.secure_url);
      // Update profile image in backend
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/employee/details",
        { ...info, profileImage: cloudinaryRes.data.secure_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfo((prev) => ({ ...prev, profileImage: cloudinaryRes.data.secure_url }));
      alert("Profile picture updated successfully!");
      setImageFile(null);
      setImagePreview("");
      setShowModal(false);
    } catch (error) {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
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
        <div className="profile-picture-edit-row">
          <button
            type="button"
            className="modern-profile-img-btn"
            onClick={() => setShowModal(true)}
            disabled={uploading}
          >
            <span className="profile-img-btn-icon">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="7" width="18" height="14" rx="3" fill="#eaf2fb" stroke="#235390" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3.5" stroke="#235390" strokeWidth="2" fill="#fff"/>
                <path d="M12 10.5v3M13.5 12H12" stroke="#235390" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="8" y="3" width="8" height="4" rx="2" fill="#235390"/>
              </svg>
            </span>
            <span className="profile-img-btn-text">Update Photo</span>
          </button>
        </div>
      </div>

      {/* Modal for changing profile picture */}
      {showModal && (
        <div className="modal-blur-overlay">
          <div className="modal-popup-window modern-profile-modal">
            <button className="modal-close" onClick={() => {
              setShowModal(false);
              setImageFile(null);
              setImagePreview("");
              setImageError("");
            }}>&times;</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <img
                src={imagePreview || info.profileImage || profileImage}
                alt="Preview"
                style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: '3px solid #235390', boxShadow: '0 2px 12px rgba(79,140,255,0.10)' }}
              />
              <h2 style={{margin: '10px 0 0 0', color: '#235390', fontWeight: 700, fontSize: '1.3rem'}}>Change Profile Picture</h2>
              <div style={{ color: '#666', fontSize: '1rem', marginBottom: 10, marginTop: 2, textAlign: 'center' }}>
                {info.firstName} {info.middleName} {info.lastName}<br/>
                <span style={{ fontSize: '0.95rem', color: '#888' }}>{info.email}</span>
              </div>
              <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 10 }}>
                Only .jpg, .jpeg, .png files are allowed. Max size: 15MB.
              </div>
              {imageError && (
                <div style={{ color: 'red', fontSize: '0.97rem', marginBottom: 8 }}>{imageError}</div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="profile-image-input-modal"
              />
              <button
                type="button"
                className="modern-profile-btn"
                onClick={() => document.getElementById('profile-image-input-modal').click()}
                disabled={uploading}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{marginRight: 7}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                </svg>
                {imageFile ? "Change Selected Image" : "Select Image"}
              </button>
              {imageFile && !uploading && (
                <button
                  type="button"
                  className="modern-profile-btn upload-btn"
                  onClick={handleImageUpload}
                  style={{ marginTop: 10 }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{marginRight: 6}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Upload
                </button>
              )}
              {uploading && <div style={{ marginTop: 10, color: '#235390', fontWeight: 500 }}>Uploading...</div>}
              {uploadedImageUrl && (
                <div style={{ color: 'green', marginTop: 6 }}>Image uploaded!</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="profile-details compact-layout">
        <div className="profile-sections-flex align-containers">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <ul>
              <li><strong>First Name:</strong> {info.firstName || "N/A"}</li>
              <li><strong>Middle Name:</strong> {info.middleName || "N/A"}</li>
              <li><strong>Last Name:</strong> {info.lastName || "N/A"}</li>
              <li><strong>Date of Birth:</strong> {info.dateOfBirth ? info.dateOfBirth.slice(0,10) : "N/A"}</li>
              <li><strong>Gender:</strong> {info.gender || "N/A"}</li>
              <li><strong>Civil Status:</strong> {info.civilStatus || "N/A"}</li>
              {info.civilStatus === "Married" && (
                <>
                  <li><strong>Spouse's Full Name:</strong> {info.spouseFullName || "N/A"}</li>
                  <li><strong>Number of Children:</strong> {info.numberOfChildren || "N/A"}</li>
                  {info.childrenNames && info.childrenNames.length > 0 && (
                    <li>
                      <strong>Children:</strong>
                      <ul>
                        {info.childrenNames.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                    </li>
                  )}
                </>
              )}
              {info.civilStatus === "Single" && (
                <>
                  <li><strong>Mother’s Maiden Name:</strong> {info.motherMaidenName || "N/A"}</li>
                  <li><strong>Father’s Full Name:</strong> {info.fatherFullName || "N/A"}</li>
                </>
              )}
              {info.civilStatus === "Widowed" && (
                <>
                  <li><strong>Name of Deceased Spouse:</strong> {info.deceasedSpouseName || "N/A"}</li>
                  <li><strong>Number of Children:</strong> {info.numberOfChildren || "N/A"}</li>
                  {info.childrenNames && info.childrenNames.length > 0 && (
                    <li>
                      <strong>Children:</strong>
                      <ul>
                        {info.childrenNames.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                    </li>
                  )}
                </>
              )}
              <li><strong>Nationality:</strong> {info.nationality || "N/A"}</li>
            </ul>
          </div>
          <div className="profile-section">
            <h3>Contact Information</h3>
            <ul>
              <li><strong>Email:</strong> {info.email || "N/A"}</li>
              <li><strong>Mobile Number:</strong> {info.mobileNumber || "N/A"}</li>
              <li><strong>Home Address:</strong> {info.homeAddress || "N/A"}</li>
              <li><strong>Emergency Contact Name:</strong> {info.emergencyContactName || "N/A"}</li>
              <li><strong>Emergency Contact Number:</strong> {info.emergencyContactNumber || "N/A"}</li>
              <li><strong>Emergency Contact Relation:</strong> {info.emergencyContactRelation || "N/A"}</li>
            </ul>
          </div>
          <div className="profile-section">
            <h3>Employment Details</h3>
            <ul>
              <li><strong>Campus Branch:</strong> {info.campusBranch || "N/A"}</li>
              <li><strong>Job Title/Position:</strong> {info.jobTitle || "N/A"}</li>
              <li><strong>Department:</strong> {info.department || "N/A"}</li>
              <li><strong>Employee ID:</strong> {info.employeeID || "N/A"}</li>
              <li><strong>Employment Type:</strong> {info.employmentType || "N/A"}</li>
              <li><strong>Start Date:</strong> {info.startDate ? info.startDate.slice(0,10) : "N/A"}</li>
              <li><strong>Employment Status:</strong> {info.employmentStatus || "N/A"}</li>
              <li><strong>Username:</strong> {info.username || "N/A"}</li>
            </ul>
          </div>
          <div className="profile-section">
            <h3>Educational Background</h3>
            <ul>
              <li><strong>Highest Educational Attainment:</strong> {info.highestEducationalAttainment || "N/A"}</li>
              <li><strong>Name of School:</strong> {info.schoolName || "N/A"}</li>
              <li><strong>School Year From:</strong> {info.schoolYearFrom || "N/A"}</li>
              <li><strong>School Year To:</strong> {info.schoolYearTo || "N/A"}</li>
              <li><strong>Year Graduated:</strong> {info.yearGraduated || "N/A"}</li>
            </ul>
          </div>
          <div className="profile-section">
            <h3>Government-Mandated Contributions</h3>
            <ul>
              <li><strong>SSS Number:</strong> {info.sssNumber || "N/A"}</li>
              <li><strong>Pag-IBIG MID Number:</strong> {info.pagibigNumber || "N/A"}</li>
              <li><strong>PhilHealth ID Number:</strong> {info.philhealthNumber || "N/A"}</li>
              <li><strong>TIN:</strong> {info.tinNumber || "N/A"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;