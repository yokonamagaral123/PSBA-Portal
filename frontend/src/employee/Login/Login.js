import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ setUserRole }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loginType, setLoginType] = useState("employee"); // Default to employee login
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const endpoint = isAdminLogin
        ? "http://localhost:5000/api/admin/login"
        : loginType === "hr"
        ? "http://localhost:5000/api/hr/login"
        : "http://localhost:5000/api/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user role to localStorage
        const userRole = data.user?.role;
        const token = data.token;

        if (!userRole || !token) {
          throw new Error("User role or token is missing in the response");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", userRole);

        setUserRole(userRole);

        // Redirect based on role
        if (userRole === "admin") {
          navigate("/admin-dashboard");
        } else if (userRole === "hr") {
          navigate("/hr-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Invalid email or password!");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-page">
      <div className="header">
        <img src={logo} alt="School Logo" className="school-logo" />
        <h1 className="school-name">PHILIPPINE SCHOOL OF BUSINESS ADMINISTRATION</h1>
      </div>

      <div className="login-container">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
          alt="User Icon"
          className="user-icon"
        />
        <h2 className="login-title">{isAdminLogin ? "Admin Log In" : "Log In"}</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={e => { e.preventDefault(); handleLogin(); }}>
          <div className="input-container">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-container password-group">
            <label>Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="eye-icon"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {!isAdminLogin && (
            <div className="input-container">
              <label>Login as:</label>
              <select
                className="login-type-selector"
                value={loginType}
                onChange={(e) => setLoginType(e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="hr">Supervisor</option>
              </select>
            </div>
          )}

          <div className="options">
            <div className="remember-me">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">Keep me logged in</label>
            </div>
            <button type="button" onClick={handleForgotPassword} className="forgot-password">
              Forgot Password?
            </button>
          </div>

          <button className="login-button" type="submit">
            {isAdminLogin ? "Admin Login" : "Login"}
          </button>
        </form>

        {!isAdminLogin ? (
          <button
            className="toggle-login-button"
            onClick={() => setIsAdminLogin(true)}
          >
            Admin Login
          </button>
        ) : (
          <button
            className="toggle-login-button"
            onClick={() => setIsAdminLogin(false)}
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;