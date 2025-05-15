require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const User = require("../models/User"); // Adjust the path if necessary

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI; // Use MONGO_URI from .env

const addUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Hash passwords
    const employeePassword = await bcrypt.hash("employee123", 10); // Hash employee password
    const adminPassword = await bcrypt.hash("admin123", 10); // Hash admin password
    const hrPassword = await bcrypt.hash("hr123", 10); // Hash HR password

    // Add an employee user
    const employee = new User({
      email: "employee@example.com",
      password: employeePassword, // Use hashed password
      role: "employee",
    });

    // Add an admin user
    const admin = new User({
      email: "admin@example.com",
      password: adminPassword, // Use hashed password
      role: "admin",
    });

    // Add an HR user
    const hr = new User({
      email: "hr@example.com",
      password: hrPassword, // Use hashed password
      role: "hr",
    });

    // Save users to the database
    await employee.save();
    await admin.save();
    await hr.save();

    console.log("Users added successfully");
  } catch (error) {
    console.error("Error adding users:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the script
addUsers();