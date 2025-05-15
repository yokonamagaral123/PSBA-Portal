import React, { useState } from "react";
import "./Settings.css";

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordSave = () => {
    if (oldPassword === newPassword) {
      setPasswordError("");
      // Add API call to update password
    } else {
      setPasswordError("*Password not matching");
    }
  };

  const handleContactSave = () => {
    // Add API call to update contact
  };

  return (
    <>
      {/* Settings Banner */}
      <div className="settings-banner">
        <h1 className="settings-banner-title">SETTINGS</h1>
      </div>

      {/* Settings Content */}
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-section">
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {passwordError && (
            <span style={{ color: "red", marginLeft: "10px" }}>{passwordError}</span>
          )}
          <br />
          <button onClick={handlePasswordSave}>Save</button>
        </div>

        <div className="settings-section">
          <h3>Change Contact No.</h3>
          <input
            type="text"
            placeholder="09123456789"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          <br />
          <small>*Use valid and active number</small>
          <br />
          <button onClick={handleContactSave}>Save</button>
        </div>
      </div>
    </>
  );
};

export default Settings;