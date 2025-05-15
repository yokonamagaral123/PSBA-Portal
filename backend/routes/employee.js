const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const EmployeeDetails = require("../models/EmployeeDetails");

// Fetch employee details using the token
router.get("/details", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    console.error("Authorization token is missing.");
    return res.status(401).json({ success: false, message: "Authorization token is required" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in your .env file
    console.log("Decoded token:", decoded);

    const email = decoded.email; // Extract email from the token payload
    if (!email) {
      console.error("Email is missing in the token.");
      return res.status(400).json({ success: false, message: "Email is missing in the token" });
    }

    // Fetch employee details from the database
    const employee = await EmployeeDetails.findOne({ email });
    if (!employee) {
      console.error(`Employee not found for email: ${email}`);
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    console.log("Employee details fetched successfully:", employee);
    res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch employee details by employeeID
router.get("/details/:employeeID", async (req, res) => {
  try {
    const employee = await EmployeeDetails.findOne({ employeeID: req.params.employeeID });
    if (!employee) {
      console.error(`Employee not found for ID: ${req.params.employeeID}`);
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    console.log("Employee details fetched successfully:", employee);
    res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee details by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;