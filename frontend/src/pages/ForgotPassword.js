import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for redirection
import "../employee/Login/Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Simulated user data
  const [user, setUser] = useState({
    email: "arvingeguna123@gmail.com",
    password: "password123",
  });

  const handleResetPassword = () => {
    if (email === user.email) {
      setUser({ ...user, password: newPassword });
      setMessage("Password changed successfully! You can now log in.");
      setTimeout(() => navigate("/"), 2000); // Redirect to login page after 2 sec
    } else {
      setMessage("Email not found! Please enter the correct email.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Reset Password</h2>

        {message && <p className="success-message">{message}</p>} {/* Success/Error message */}

        <div className="input-container">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-container">
          <label>New Password</label>
          <input 
            type="password" 
            placeholder="Enter new password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <button className="login-button" onClick={handleResetPassword}>Reset Password</button>
      </div>
    </div>
  );
};

export default ForgotPassword;
