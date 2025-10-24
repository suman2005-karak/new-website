// const mongoose = require("mongoose");

// const LoginActivitySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   name: String,
//   email: String,
//   loginTime: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("LoginActivity", LoginActivitySchema);
// backend/models/LoginActivity.js
const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    index: true // ✅ For faster queries
  },
  name:{type : String},
  email: { 
    type: String, 
    required: true,
    index: true 
  },
  loginTime: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  ipAddress: String,
  userAgent: String,
  success: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  loginMethod: { 
    type: String, 
    enum: ['email', 'google', 'google-fit'],
    default: 'email' 
  },
  failureReason: String // Optional: to track why login failed
}, { 
  timestamps: true 
});

// ✅ Add indexes for common queries
loginActivitySchema.index({ userId: 1, loginTime: -1 });
loginActivitySchema.index({ email: 1, success: 1 });

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
