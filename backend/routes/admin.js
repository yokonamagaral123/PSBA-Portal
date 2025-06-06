const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const EmployeeDetails = require("../models/EmployeeDetails");
const User = require("../models/User");

const router = express.Router(); // Initialize the router

// User count route (fix: move to top level)
router.get("/user-count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create employee route
router.post("/create-employee", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Debug: Log the incoming request body
    console.log("Received employee data:", req.body);

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
      temporaryPassword,
      role,
      spouseFullName,
      numberOfChildren,
      childrenNames,
      motherMaidenName,
      fatherFullName,
      deceasedSpouseName,
      sssNumber,
      pagibigNumber,
      philhealthNumber,
      tinNumber,
      highestEducationalAttainment,
      schoolName,
      schoolYearFrom,
      schoolYearTo,
      yearGraduated,
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
      !temporaryPassword
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Check for duplicate keys in EmployeeDetails
    const existingEmployee = await EmployeeDetails.findOne({
      $or: [{ email }, { employeeID }],
    }).session(session);
    if (existingEmployee) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Employee with the same email or employee ID already exists.",
      });
    }

    // Check for duplicate keys in User collection
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
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
    await user.save({ session });

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
      spouseFullName,
      numberOfChildren,
      childrenNames,
      motherMaidenName,
      fatherFullName,
      deceasedSpouseName,
      sssNumber,
      pagibigNumber,
      philhealthNumber,
      tinNumber,
      highestEducationalAttainment,
      schoolName,
      schoolYearFrom,
      schoolYearTo,
      yearGraduated,
    });
    await employeeDetails.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Employee account created successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Handle duplicate key errors
    if (error.code === 11000) {
      // Find which field is duplicated
      let duplicateField = 'unknown';
      if (error.keyPattern) {
        if (error.keyPattern.email) duplicateField = 'email';
        else if (error.keyPattern.employeeID) duplicateField = 'employeeID';
      } else if (error.keyValue) {
        if (error.keyValue.email) duplicateField = 'email';
        else if (error.keyValue.employeeID) duplicateField = 'employeeID';
      }
      // Log the full error for debugging
      console.error('Duplicate key error:', error);
      // If still unknown, return the full error object for debugging
      return res.status(400).json({
        message: `Duplicate ${duplicateField} error`,
        details: error.keyValue,
        fullError: error
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.errors,
      });
    }

    // Log the error for debugging
    console.error("Create employee error:", error);
    res.status(500).json({ message: "Failed to create employee account.", error: error.message });
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

// Get an employee's schedule
router.get("/employees/:id/schedule", async (req, res) => {
  try {
    const employee = await EmployeeDetails.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ schedule: employee.schedule || {} });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Failed to fetch schedule." });
  }
});

// Update an employee's schedule
router.put("/employees/:id/schedule", async (req, res) => {
  try {
    const { schedule } = req.body;
    const employee = await EmployeeDetails.findByIdAndUpdate(
      req.params.id,
      { schedule },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ schedule: employee.schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Failed to update schedule." });
  }
});

module.exports = router; // Export the router