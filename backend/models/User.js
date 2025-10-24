// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true
  },
  password: String,
  googleSub: String,
  googleAccessToken: String,
  googleRefreshToken: String,
  googleFitConnected: { type: Boolean, default: false },
  
  // Profile fields
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  fitnessGoal: String,
  avatar: { type: String, default: null } // Store as a URL or base64 string
  ,

  // Login tracking
  lastLogin: { type: Date, default: null },
  loginCount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
