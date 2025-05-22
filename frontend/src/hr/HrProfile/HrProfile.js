import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HrProfile.css";
import profileImage from "../../assets/profile.png";

const HrProfile = () => {
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
  const [editForm, setEditForm] = useState({ ...info });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authorization token is missing.");
          return;
        }
        // Use the shared employee profile endpoint
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
    setEditForm(info);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedImageUrl("");
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
      formData.append("folder", "hr-profiles");
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
    <div className="hrprofile-main">
      <div className="hrprofile-banner">
        <img src={info.profileImage || profileImage} alt="Profile" className="hrprofile-image" />
        <div className="hrprofile-info">
          <h2>
            {info.firstName} {info.middleName} {info.lastName}
          </h2>
          <p>{info.location || "Philippine School of Business and Administration"}</p>
        </div>
      </div>

      <div className="hrprofile-details compact-layout">
        <div className="hrprofile-sections-flex align-containers">
          <div className="hrprofile-section">
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
          <div className="hrprofile-section">
            <h3>Educational Background</h3>
            <ul>
              <li><strong>Highest Educational Attainment:</strong> {info.highestEducationalAttainment || "N/A"}</li>
              <li><strong>Name of School:</strong> {info.schoolName || "N/A"}</li>
              <li><strong>School Year From:</strong> {info.schoolYearFrom || "N/A"}</li>
              <li><strong>School Year To:</strong> {info.schoolYearTo || "N/A"}</li>
              <li><strong>Year Graduated:</strong> {info.yearGraduated || "N/A"}</li>
            </ul>
          </div>
          <div className="hrprofile-section">
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
          <div className="hrprofile-section">
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
          <div className="hrprofile-section">
            <h3>Government-Mandated Contributions</h3>
            <ul>
              <li><strong>SSS Number:</strong> {info.sssNumber || "N/A"}</li>
              <li><strong>Pag-IBIG MID Number:</strong> {info.pagibigNumber || "N/A"}</li>
              <li><strong>PhilHealth ID Number:</strong> {info.philhealthNumber || "N/A"}</li>
              <li><strong>TIN:</strong> {info.tinNumber || "N/A"}</li>
            </ul>
          </div>
        </div>
        <div className="hrprofile-edit-btn-row">
          <button className="hrprofile-edit-button" onClick={openEditModal}>
            Edit
          </button>
        </div>
      </div>

      {/* Modal Popup for Editing */}
      {showModal && (
        <div className={"hrprofile-modal-overlay active"}>
          <div className="hrprofile-modal modern-modal">
            <button className="hrprofile-modal-close" onClick={closeModal}>&times;</button>
            <h2>Edit Profile</h2>
            <form className="hrprofile-edit-form" onSubmit={handleSave}>
              <div className="hrprofile-edit-grid">
                <label>Profile Image:
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <button type="button" className="hrprofile-edit-button" onClick={handleImageUpload} disabled={!imageFile || uploading} style={{marginLeft:8}}>
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }} />
                  )}
                  {uploadedImageUrl && (
                    <div style={{color:'green',marginTop:4}}>Image uploaded!</div>
                  )}
                </label>
                <label>First Name:<input name="firstName" value={editForm.firstName} onChange={handleEditFormChange} required /></label>
                <label>Middle Name:<input name="middleName" value={editForm.middleName} onChange={handleEditFormChange} /></label>
                <label>Last Name:<input name="lastName" value={editForm.lastName} onChange={handleEditFormChange} required /></label>
                <label>Date of Birth:<input type="date" name="dateOfBirth" value={editForm.dateOfBirth ? editForm.dateOfBirth.slice(0,10) : ""} onChange={handleEditFormChange} required /></label>
                <label>Gender:<input name="gender" value={editForm.gender} onChange={handleEditFormChange} required /></label>
                <label>
                  Civil Status:
                  <select name="civilStatus" value={editForm.civilStatus} onChange={handleEditFormChange}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </label>
                {editForm.civilStatus === "Married" && (
                  <>
                    <label>Spouse's Full Name:
                      <input name="spouseFullName" value={editForm.spouseFullName || ""} onChange={handleEditFormChange} />
                    </label>
                    <label>Number of Children:
                      <input type="number" name="numberOfChildren" value={editForm.numberOfChildren || ""} onChange={handleEditFormChange} />
                    </label>
                    {/* Optionally add children names fields */}
                  </>
                )}
                {editForm.civilStatus === "Single" && (
                  <>
                    <label>Mother’s Maiden Name:
                      <input name="motherMaidenName" value={editForm.motherMaidenName || ""} onChange={handleEditFormChange} />
                    </label>
                    <label>Father’s Full Name:
                      <input name="fatherFullName" value={editForm.fatherFullName || ""} onChange={handleEditFormChange} />
                    </label>
                  </>
                )}
                {editForm.civilStatus === "Widowed" && (
                  <>
                    <label>Name of Deceased Spouse:
                      <input name="deceasedSpouseName" value={editForm.deceasedSpouseName || ""} onChange={handleEditFormChange} />
                    </label>
                    <label>Number of Children:
                      <input type="number" name="numberOfChildren" value={editForm.numberOfChildren || ""} onChange={handleEditFormChange} />
                    </label>
                    {/* Optionally add children names fields */}
                  </>
                )}
                <label>Nationality:<input name="nationality" value={editForm.nationality} onChange={handleEditFormChange} /></label>
                {/* Educational Background */}
                <label>Highest Educational Attainment:<input name="highestEducationalAttainment" value={editForm.highestEducationalAttainment} onChange={handleEditFormChange} /></label>
                <label>Name of School:<input name="schoolName" value={editForm.schoolName} onChange={handleEditFormChange} /></label>
                <label>School Year From:<input name="schoolYearFrom" value={editForm.schoolYearFrom} onChange={handleEditFormChange} /></label>
                <label>School Year To:<input name="schoolYearTo" value={editForm.schoolYearTo} onChange={handleEditFormChange} /></label>
                <label>Year Graduated:<input name="yearGraduated" value={editForm.yearGraduated} onChange={handleEditFormChange} /></label>
                {/* Government IDs */}
                <label>SSS Number:<input name="sssNumber" value={editForm.sssNumber} onChange={handleEditFormChange} /></label>
                <label>Pag-IBIG MID Number:<input name="pagibigNumber" value={editForm.pagibigNumber} onChange={handleEditFormChange} /></label>
                <label>PhilHealth ID Number:<input name="philhealthNumber" value={editForm.philhealthNumber} onChange={handleEditFormChange} /></label>
                <label>TIN:<input name="tinNumber" value={editForm.tinNumber} onChange={handleEditFormChange} /></label>
              </div>
              <div className="hrprofile-modal-actions">
                <button type="submit" className="hrprofile-edit-button">Save</button>
                <button type="button" className="hrprofile-edit-button" onClick={closeModal} style={{background:'#ccc',color:'#222'}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrProfile;