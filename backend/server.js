// import express from "express";
// import session from "express-session";
// import passport from "passport";
// import mongoose from "mongoose";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import axios from "axios";
// import "dotenv/config";

// // ---------------------
// // MongoDB Connection
// // ---------------------
// await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wellnesshub");

// // ---------------------
// // User Schema
// // ---------------------
// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: String,
//     googleId: { type: String, index: true },
//     googleFitConnected: { type: Boolean, default: false },
//     accessToken: String,
//     refreshToken: String,
//     steps: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );
// const User = mongoose.model("User", userSchema);

// // ---------------------
// // Express + Passport
// // ---------------------
// const app = express();

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "change_this_in_production",
//     resave: false,
//     saveUninitialized: true,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (e) {
//     done(e, null);
//   }
// });

// // ---------------------
// // Strategies
// // ---------------------
// function buildUpdatesFromProfile(profile, accessToken, refreshToken, extra = {}) {
//   const updates = {
//     name: profile.displayName,
//     email: profile.emails?.[0]?.value,
//     googleId: profile.id,
//     accessToken,
//     ...extra,
//   };
//   // Only save refreshToken if present (first consent or forced re-consent)
//   if (refreshToken) updates.refreshToken = refreshToken;
//   return updates;
// }

// // 1) Google Login (email + profile) — request offline on first consent
// passport.use(
//   "google-login",
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_LOGIN_CALLBACK || "http://localhost:5000/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const updates = buildUpdatesFromProfile(profile, accessToken, refreshToken);
//         const user = await User.findOneAndUpdate(
//           { googleId: profile.id },
//           { $set: updates },
//           { upsert: true, new: true }
//         );
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // 2) Google Fit Connect (fitness scopes)
// const fitScopes = [
//   "profile",
//   "email",
//   "https://www.googleapis.com/auth/fitness.activity.read",
//   "https://www.googleapis.com/auth/fitness.heart_rate.read",
//   "https://www.googleapis.com/auth/fitness.sleep.read",
// ];

// passport.use(
//   "google-fit",
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL:
//         process.env.GOOGLE_FIT_CALLBACK || "http://localhost:5000/auth/google/fit/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const updates = buildUpdatesFromProfile(profile, accessToken, refreshToken, {
//           googleFitConnected: true,
//         });
//         const user = await User.findOneAndUpdate(
//           { googleId: profile.id },
//           { $set: updates },
//           { new: true, upsert: true }
//         );
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // ---------------------
// // Routes
// // ---------------------
// // Health
// app.get("/", (_req, res) => res.send("WellnessHub API OK"));

// // Login with Google (request offline so first consent can return refresh_token)
// app.get(
//   "/auth/google",
//   passport.authenticate("google-login", {
//     scope: ["profile", "email"],
//     accessType: "offline",
//   })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google-login", { failureRedirect: "/" }),
//   (req, res) => {
//     res.redirect("http://localhost:5173/dashboard");
//   }
// );

// // Connect Google Fit (avoid prompt:'consent' unless a new refresh token is needed)
// app.get(
//   "/auth/google/fit",
//   passport.authenticate("google-fit", {
//     scope: fitScopes,
//     accessType: "offline",
//   })
// );

// app.get(
//   "/auth/google/fit/callback",
//   passport.authenticate("google-fit", { failureRedirect: "/" }),
//   (req, res) => {
//     res.redirect("http://localhost:5173/dashboard?fit=connected");
//   }
// );

// // Dashboard -> fetch today's steps via aggregate API
// app.get("/dashboard", async (req, res) => {
//   if (!req.user) return res.redirect("/auth/google");

//   const token = req.user.accessToken;
//   if (!token) return res.json({ steps: 0 });

//   const now = new Date();
//   const startOfDay = new Date(now);
//   startOfDay.setHours(0, 0, 0, 0);
//   const start = startOfDay.getTime();
//   const end = Date.now();

//   const body = {
//     aggregateBy: [
//       {
//         dataTypeName: "com.google.step_count.delta",
//         dataSourceId:
//           "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
//       },
//     ],
//     bucketByTime: { durationMillis: 86400000 },
//     startTimeMillis: start,
//     endTimeMillis: end,
//   };

//   try {
//     const response = await axios.post(
//       "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json; encoding=utf-8",
//         },
//       }
//     );

//     const steps =
//       response?.data?.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

//     await User.findByIdAndUpdate(req.user._id, { $set: { steps } });

//     res.json({ name: req.user.name, email: req.user.email, steps });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: err?.response?.data || err.message || "Google Fit error" });
//   }
// });

// // ---------------------
// // Start Server
// // ---------------------
// const port = process.env.PORT || 5000;
// app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
// // To run the server, use the command: node server.js
// server.js
// require("dotenv").config();

// const express = require("express");
// const session = require("express-session");
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const mongoose = require("mongoose");
// const axios = require("axios");
// const jwt = require("jsonwebtoken");
// const app = express();

// // ----- MongoDB -----
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected (Google Fit service)"))
//   .catch(err => { console.error("❌ Mongo error:", err); process.exit(1); });

// const User = mongoose.model("User", new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   googleSub: String,
//   googleAccessToken: String,
//   googleRefreshToken: String
// }));

// const StepData = mongoose.model("StepData", new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   date: String, // YYYY-MM-DD
//   steps: Number
// }));

// // ----- Express setup -----
// app.use(session({ secret: "supersecret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// // ----- Passport setup -----
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "http://localhost:4000/auth/google/callback", // ✅ MUST match Google Console
//   scope: ["profile", "email", "https://www.googleapis.com/auth/fitness.activity.read"],
//   accessType: "offline"
  
// }

// , async (accessToken, refreshToken, profile, cb) => {
//   try {
//     let user = await User.findOne({ email: profile.emails[0].value });

//     if (!user) {
//       user = await User.create({
//         name: profile.displayName,
//         email: profile.emails[0].value,
//         googleSub: profile.id,
//         googleAccessToken: accessToken,
//         googleRefreshToken: refreshToken,
//         googleFitConnected: true
//       });
//     } else {
//       user.googleAccessToken = accessToken;
//       if (refreshToken) user.googleRefreshToken = refreshToken; // only set once
//       user.googleFitConnected = true;
//       await user.save();
//     }

//     return cb(null, user);
//   } catch (err) {
//     return cb(err);
//   }
// }));

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });

// // ----- Routes -----
// app.get("/", (req, res) => {
//   res.send(`<a href="/auth/google">Connect Google Fit</a>`);
// });

// // Step 1: Google OAuth login
// app.get("/auth/google", passport.authenticate("google"));

// // Step 2: Callback
// // app.get("/auth/google/callback",
// //   passport.authenticate("google", { failureRedirect: "/" }),
// //   (req, res) => {
// //     res.send("✅ Google Fit connected. Now visit <a href='/fit/steps'>/fit/steps</a>");
// //   }
// // );
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   async (req, res) => {
//     try {
//       // Generate your own app token
//       const token = jwt.sign(
//         { id: req.user._id, email: req.user.email },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//       );
      

//       // Redirect to frontend dashboard with token
//       res.redirect(`http://localhost:8080/dashboard?token=${token}`);
//     } catch (err) {
//       console.error("Callback error:", err);
//       res.redirect("http://localhost:8080/login?error=auth_failed");
//     }
//   }
// );

// // Step 3: Fetch steps & save to DB
// app.get("/fit/steps", async (req, res) => {
//   try {
//     if (!req.user || !req.user.googleAccessToken) {
//       return res.status(401).json({ message: "Not logged in with Google Fit" });
//     }

//     const response = await axios.post(
//       "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
//       {
//         aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
//         bucketByTime: { durationMillis: 86400000 },
//         startTimeMillis: Date.now() - (7 * 24 * 60 * 60 * 1000), // past 7 days
//         endTimeMillis: Date.now()
//       },
//       { headers: { Authorization: `Bearer ${req.user.googleAccessToken}` } }
//     );

//     const buckets = response.data.bucket || [];
//     const stepRecords = [];

//     for (const bucket of buckets) {
//       let steps = 0;
//       if (bucket.dataset[0].point.length > 0) {
//         steps = bucket.dataset[0].point.reduce(
//           (sum, p) => sum + (p.value[0]?.intVal || 0), 0
//         );
//       }

//       const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().split("T")[0];
//       stepRecords.push({ userId: req.user._id, date, steps });

//       await StepData.findOneAndUpdate(
//         { userId: req.user._id, date },
//         { steps },
//         { upsert: true, new: true }
//       );
//     }

//     res.json({ success: true, steps: stepRecords });
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ message: "Failed to fetch steps" });
//   }
// });

// app.listen(4000, () => {
//   console.log("🚀 Google Fit service running on http://localhost:4000");
// });
// app.get("/api/user/me", async (req, res) => {
//   try {
//     if (!req.user) return res.status(401).json({ message: "Not logged in" });

//     res.json({
//       name: req.user.name,
//       email: req.user.email,
//       googleFitConnected: req.user.googleFitConnected
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch user" });
//   }
// });
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const app = express();

// ----- MongoDB -----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected (Google Fit service)"))
  .catch(err => { console.error("❌ Mongo error:", err); process.exit(1); });

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleSub: String,
  googleAccessToken: String,
  googleRefreshToken: String,
  googleFitConnected: { type: Boolean, default: false } // ✅ Added
}));

const StepData = mongoose.model("StepData", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  steps: Number
}));

// ----- Express setup -----
app.use(session({ secret: "supersecret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ----- Passport setup -----
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:4000/auth/google/callback",
  scope: ["profile", "email", "https://www.googleapis.com/auth/fitness.activity.read"],
  accessType: "offline"
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleSub: profile.id,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        googleFitConnected: true // ✅ Fixed
      });
    } else {
      user.googleAccessToken = accessToken;
      if (refreshToken) user.googleRefreshToken = refreshToken;
      user.googleFitConnected = true; // ✅ Fixed
      await user.save();
    }

    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

// JWT verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    
    try {
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      res.status(401).json({ message: "User not found" });
    }
  });
}

// ----- Routes -----
app.get("/", (req, res) => {
  res.send(`<a href="/auth/google">Connect Google Fit</a>`);
});

app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ Only ONE response
      res.redirect(`http://localhost:8080/dashboard?token=${token}`);
    } catch (err) {
      console.error("Callback error:", err);
      res.redirect("http://localhost:8080/login?error=auth_failed");
    }
  }
);

// ✅ Protected route with JWT verification
app.get("/api/user/me", verifyToken, async (req, res) => {
  try {
    res.json({
      name: req.user.name,
      email: req.user.email,
      googleFitConnected: req.user.googleFitConnected
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get("/fit/steps", async (req, res) => {
  try {
    if (!req.user || !req.user.googleAccessToken) {
      return res.status(401).json({ message: "Not logged in with Google Fit" });
    }

    const response = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: Date.now() - (7 * 24 * 60 * 60 * 1000),
        endTimeMillis: Date.now()
      },
      { headers: { Authorization: `Bearer ${req.user.googleAccessToken}` } }
    );

    const buckets = response.data.bucket || [];
    const stepRecords = [];

    for (const bucket of buckets) {
      let steps = 0;
      if (bucket.dataset[0].point.length > 0) {
        steps = bucket.dataset[0].point.reduce(
          (sum, p) => sum + (p.value[0]?.intVal || 0), 0
        );
      }

      const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().split("T")[0];
      stepRecords.push({ userId: req.user._id, date, steps });

      await StepData.findOneAndUpdate(
        { userId: req.user._id, date },
        { steps },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, steps: stepRecords });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch steps" });
  }
});

app.listen(4000, () => {
  console.log("🚀 Google Fit service running on http://localhost:4000");
});
