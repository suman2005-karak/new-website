
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
