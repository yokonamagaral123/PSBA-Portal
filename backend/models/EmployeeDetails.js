const mongoose = require("mongoose");

// Define the schedule sub-schema
const scheduleSchema = new mongoose.Schema({
  Sunday: { start: String, end: String },
  Monday: { start: String, end: String },
  Tuesday: { start: String, end: String },
  Wednesday: { start: String, end: String },
  Thursday: { start: String, end: String },
  Friday: { start: String, end: String },
  Saturday: { start: String, end: String },
}, { _id: false });

// Define the EmployeeDetails schema
const employeeDetailsSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  civilStatus: { type: String },
  nationality: { type: String },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  homeAddress: { type: String },
  emergencyContactName: { type: String },
  emergencyContactNumber: { type: String },
  emergencyContactRelation: { type: String },
  employeeID: { type: String, required: true, unique: true },
  jobTitle: { type: String },
  department: { type: String },
  campusBranch: { type: String },
  employmentType: { type: String },
  startDate: { type: Date },
  employmentStatus: { type: String },
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  spouseFullName: { type: String },
  numberOfChildren: { type: Number },
  childrenNames: [{ type: String }],
  motherMaidenName: { type: String },
  fatherFullName: { type: String },
  deceasedSpouseName: { type: String },
  sssNumber: { type: String },
  pagibigNumber: { type: String },
  philhealthNumber: { type: String },
  tinNumber: { type: String },
  highestEducationalAttainment: { type: String },
  schoolName: { type: String },
  schoolYearFrom: { type: String },
  schoolYearTo: { type: String },
  yearGraduated: { type: String },
  // --- Add schedule field here ---
  schedule: scheduleSchema,
});

const EmployeeDetails = mongoose.model("EmployeeDetails", employeeDetailsSchema);

module.exports = EmployeeDetails;