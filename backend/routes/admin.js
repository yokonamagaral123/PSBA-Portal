const express = require("express");
const bcrypt = require("bcrypt");
const EmployeeDetails = require("../models/EmployeeDetails");
const User = require("../models/User");

const router = express.Router(); // Initialize the router

// Create employee route
router.post("/create-employee", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      civilStatus,
      nationality,
      email,
      mobileNumber,
      homeAddress,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      employeeID,
      jobTitle,
      department,
      campusBranch,
      employmentType,
      startDate,
      employmentStatus,
      username,
      temporaryPassword,
      role,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !email ||
      !mobileNumber ||
      !employeeID ||
      !username ||
      !temporaryPassword
    ) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Check for duplicate keys in EmployeeDetails
    const existingEmployee = await EmployeeDetails.findOne({
      $or: [{ email }, { employeeID }, { username }],
    });
    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee with the same email, employee ID, or username already exists.",
      });
    }

    // Check for duplicate keys in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "A user with the same email already exists.",
      });
    }

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Save to User collection
    const user = new User({
      email,
      password: hashedPassword,
      role: role || "employee", // Default role is 'employee'
    });
    await user.save();

    // Save to EmployeeDetails collection
    const employeeDetails = new EmployeeDetails({
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      civilStatus,
      nationality,
      email,
      mobileNumber,
      homeAddress,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      employeeID,
      jobTitle,
      department,
      campusBranch,
      employmentType,
      startDate,
      employmentStatus,
      username,
      
    });
    await employeeDetails.save();

    res.status(201).json({ message: "Employee account created successfully!" });
  } catch (error) {
    console.error("Error creating employee account:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error",
        details: error.keyValue, // This will show which field caused the error
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ message: "Failed to create employee account." });
  }
});

// Get all employees (for admin manage employees page)
router.get("/employees", async (req, res) => {
  try {
    // Optionally, add authentication/authorization here
    const employees = await EmployeeDetails.find({});
    res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees." });
  }
});

// Update employee by ID (for admin manage employees page)
router.put("/employees/:id", async (req, res) => {
  try {
    const updated = await EmployeeDetails.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ employee: updated });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Failed to update employee." });
  }
});

// Delete employee by ID (for admin manage employees page)
router.delete("/employees/:id", async (req, res) => {
  try {
    const deleted = await EmployeeDetails.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee removed successfully." });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Failed to remove employee." });
  }
});

module.exports = router; // Export the router