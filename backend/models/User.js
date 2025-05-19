const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' }, // Default role is 'employee'
   leaveCredits: {
    sick: { type: Number, default: 10 },
    vacation: { type: Number, default: 10 }
  }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

