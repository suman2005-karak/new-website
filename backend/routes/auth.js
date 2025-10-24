// const express = require("express");
// const { googleLogin } = require("../controllers/authController");


// router.post("/google", googleLogin);
// module.exports = router;
// // routes/auth.js
// import express from "express";
// import { OAuth2Client } from "google-auth-library";
// import { google } from "googleapis";
// import User from "../models/User.js";

// const router = express.Router();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Google login + fetch steps
// router.post("/google", async (req, res) => {
//   const { idToken } = req.body;
//   try {
//     // Verify token
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     const email = payload.email;

//     // Setup Fitness API
//     const oauth2Client = new google.auth.OAuth2();
//     oauth2Client.setCredentials({ access_token: idToken });
//     const fitness = google.fitness({ version: "v1", auth: oauth2Client });

//     const endTime = Date.now();
//     const startTime = endTime - 24 * 60 * 60 * 1000;

//     const result = await fitness.users.dataset.aggregate({
//       userId: "me",
//       requestBody: {
//         aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
//         bucketByTime: { durationMillis: 86400000 },
//         startTimeMillis: startTime,
//         endTimeMillis: endTime,
//       },
//     });

//     const steps =
//       result.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;

//     // Save user
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = new User({ name: payload.name, email, steps });
//     } else {
//       user.steps = steps;
//     }
//     await user.save();

//     res.json({ user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Google login failed" });
//   }
// });

// export default router;
// routes/auth.js
// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// // ============================================
// // Basic Auth Routes
// // ============================================
// router.post("/signup", authController.signup);
// router.post("/login", authController.login);
// router.post("/google", authController.googleLogin); // ✅ Main Google login with activity tracking

// // ============================================
// // Login History Routes
// // ============================================
// router.get("/user/:userId/login-history", authController.getUserLoginHistory);
// router.get("/admin/login-history", authController.getAllLoginHistory);
// router.get("/admin/failed-logins", authController.getFailedLogins);
// router.get("/admin/login-stats", authController.getLoginStats);

// module.exports = router;
// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ============================================
// Authentication Routes
// ============================================
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);

// ============================================
// View All Users (Admin/Testing)
// ============================================
router.get("/users", async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({}).select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ============================================
// Login History Routes
// ============================================
router.get("/user/:userId/login-history", authController.getUserLoginHistory);
router.get("/admin/login-history", authController.getAllLoginHistory);
router.get("/admin/failed-logins", authController.getFailedLogins);
router.get("/admin/login-stats", authController.getLoginStats);

module.exports = router;
