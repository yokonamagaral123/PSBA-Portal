const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Routes
const authRoutes = require("./routes/auth");
const requisitionRoutes = require("./routes/requisition");
const adminRoutes = require("./routes/admin");
const employeeRoutes = require("./routes/employee");
const announcementsRoutes = require("./routes/announcements"); 
const todoRoutes = require("./routes/todo");
const userRoutes = require("./routes/user"); // <-- Add this line

app.use("/api", authRoutes);
app.use("/api/requisitions", requisitionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/announcements", announcementsRoutes); 
app.use("/api/todos", todoRoutes);
app.use("/api/user", userRoutes); // <-- Add this line

// Test route
app.get("/test", (req, res) => {
  res.send("Test route works!");
});

// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));