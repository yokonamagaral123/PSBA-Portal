const mongoose = require("mongoose");

// Define the EmployeeDetails schema
const employeeDetailsSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  civilStatus: { type: String },
  nationality: { type: String },
  email: { type: String, required: true, unique: true }, // Must match the User email
  mobileNumber: { type: String, required: true },
  homeAddress: { type: String },
  emergencyContactName: { type: String },
  emergencyContactNumber: { type: String },
  emergencyContactRelation: { type: String },
  employeeID: { type: String, required: true, unique: true }, // Unique employee ID
  jobTitle: { type: String },
  department: { type: String },
  campusBranch: { type: String },
  employmentType: { type: String }, // Full-Time, Part-Time, etc.
  startDate: { type: Date },
  employmentStatus: { type: String }, // Active, On Leave, etc.
  username: { type: String, required: true, unique: true }, // Must match the User username
  profileImage: { type: String }, // Cloudinary image URL
  spouseFullName: { type: String },
  numberOfChildren: { type: Number },
  childrenNames: [{ type: String }],
  motherMaidenName: { type: String },
  fatherFullName: { type: String },
  deceasedSpouseName: { type: String },

  // Government-Mandated Contributions
  sssNumber: { type: String },
  pagibigNumber: { type: String },
  philhealthNumber: { type: String },
  tinNumber: { type: String },

  // Educational Background
  highestEducationalAttainment: { type: String },
  schoolName: { type: String },
  schoolYearFrom: { type: String },
  schoolYearTo: { type: String },
  yearGraduated: { type: String },
});

// Create and export the EmployeeDetails model
const EmployeeDetails = mongoose.model("EmployeeDetails", employeeDetailsSchema);

module.exports = EmployeeDetails;