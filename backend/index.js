require("dotenv").config();
const Medicine = require('./models/Medicine');
const MedicineLog = require('./models/MedicineLog');
const Progress = require('./models/Progress');
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const Notification = require('./models/Notification');
const NutritionPlan = require('./models/NutritionPlan');
const cron = require('node-cron');


const REQUIRED_ENVS = ["MONGO_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"];
for (const k of REQUIRED_ENVS) {
  if (!process.env[k]) {
    console.error(`Missing required env: ${k}`);
    process.exit(1);
  }
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));  // ✅ ADD LIMIT
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // ✅ ADD THIS TOO


// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => { console.error("❌ MongoDB connection error:", err); process.exit(1); });

// ============================================
// MODELS
// ============================================

// User Model
const User = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: String,
  googleSub: String,
  googleAccessToken: String,
  googleRefreshToken: String,
  googleFitConnected: { type: Boolean, default: false },
  age: Number,
  gender: String,
   avatar: { type: String, default: null }, 
  weight: Number,
  height: Number,
  fitnessGoal: String,
  lastLogin: { type: Date, default: null },
  loginCount: { type: Number, default: 0 }
}, { timestamps: true }));

// LoginHistory Model
const LoginHistory = mongoose.model("LoginHistory", new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  name: String,
  email: { 
    type: String, 
    required: true 
  },
  loginTime: { 
    type: Date, 
    default: Date.now 
  },
  ipAddress: String,
  userAgent: String,
  loginMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  success: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true }));

// ExerciseActivity Model
const ExerciseActivity = mongoose.model("ExerciseActivity", new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true
  },
  exerciseName: {
    type: String,
    required: true
  },
  exerciseType: {
    type: String,
    enum: ['yoga', 'strength', 'cardio', 'meditation'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  caloriesBurned: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true,
    index: true
  }
}, { 
  timestamps: true 
}));

// ============================================
// HELPER FUNCTIONS
// ============================================

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signAppJwt = (user) => jwt.sign(
  { id: user._id.toString(), email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

const getClientIp = (req) => {
  return req.ip || 
    req.headers['x-forwarded-for']?.split(',')[0] || 
    req.headers['x-real-ip'] || 
    'unknown';
};

const getWeekStartDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
};

// Create notification
async function createNotification(userId, type, title, message, metadata = {}) {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      metadata
    });
    await notification.save();
    console.log(`✅ Notification created: ${type} for user ${userId}`);
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
}

// ============================================
// JWT VERIFICATION MIDDLEWARE
// ============================================

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ============================================
// ROUTES
// ============================================

app.get("/api/hello", (_req, res) => res.json({ message: "Hello from backend!" }));

// ============================================
// AUTH ROUTES
// ============================================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, age, gender, weight, height, fitnessGoal } = req.body;
    
    console.log("\n=== SIGNUP REQUEST ===");
    console.log("Email:", email);
    console.log("Name:", name);
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      age: age ? parseInt(age) : undefined,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      fitnessGoal
    });
    
    console.log("✅ User created:", user._id);
    
    const activity = await LoginHistory.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      loginTime: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      loginMethod: 'email',
      success: true
    });
    
    console.log("✅ Login activity saved:", activity._id);
    console.log("=== SIGNUP COMPLETED ===\n");
    
    res.status(201).json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        fitnessGoal: user.fitnessGoal,
        avatar: user.avatar
      }, 
      token: signAppJwt(user) 
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("\n=== LOGIN REQUEST ===");
    console.log("Email:", email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      await LoginHistory.create({
        userId: null,
        name: null,
        email,
        loginTime: new Date(),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        loginMethod: 'email',
        success: false
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (!user.password) {
      console.log("❌ No password set");
      await LoginHistory.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        loginTime: new Date(),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        loginMethod: 'email',
        success: false
      });
      return res.status(401).json({ message: "Please use Google Sign-In" });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("❌ Invalid password");
      await LoginHistory.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        loginTime: new Date(),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        loginMethod: 'email',
        success: false
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Save login history
    const activity = await LoginHistory.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      loginTime: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      loginMethod: 'email',
      success: true
    });

    // Update user login info
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // ✅ CREATE LOGIN NOTIFICATION
    await createNotification(
      user._id,
      'login',
      'Welcome Back! 👋',
      `Successfully logged in at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      {
        loginMethod: 'email',
        loginTime: new Date()
      }
    );

    // ✅ CHECK AND CREATE TODAY'S NUTRITION PLAN IF MISSING
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPlan = await NutritionPlan.findOne({
      userId: user._id,
      date: today
    });

    if (!existingPlan && user.weight && user.height && user.fitnessGoal) {
      const personalizedPlan = generatePersonalizedPlanForUser(user);
      
      await NutritionPlan.create({
        userId: user._id,
        date: today,
        targetCalories: personalizedPlan.targetCalories,
        meals: personalizedPlan.meals,
        mealTimes: {
          breakfast: { start: '07:00', end: '08:00' },
          lunch: { start: '12:30', end: '13:30' },
          dinner: { start: '19:00', end: '20:00' },
          snacks: { start: '16:00', end: '17:00' }
        },
        waterIntake: 0
      });

      await createNotification(
        user._id,
        'daily-plan',
        'Today\'s Nutrition Plan Ready! 🍽️',
        `Your personalized meal plan is ready. Target: ${personalizedPlan.targetCalories} calories.`,
        { date: today }
      );

      console.log(`✅ Nutrition plan created for user ${user.name}`);
    }

    console.log(`✅ Login successful, activity saved: ${activity._id}`);
    console.log("=== LOGIN COMPLETED ===\n");
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        age: user.age,
         avatar: user.avatar,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        fitnessGoal: user.fitnessGoal
      }, 
      token: signAppJwt(user) 
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});


app.post("/api/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: "ID token required" });
    }
    
    const ticket = await googleClient.verifyIdToken({ 
      idToken, 
      audience: process.env.GOOGLE_CLIENT_ID 
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      user = await User.create({ 
        name: payload.name || payload.email.split('@')[0], 
        email: payload.email, 
        googleSub: payload.sub 
      });
      console.log("✅ New Google user created:", user.email);
    } else {
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    }

    // Save login history
    await LoginHistory.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      loginTime: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      loginMethod: 'google',
      success: true
    });

    // ✅ CREATE LOGIN NOTIFICATION
    await createNotification(
      user._id,
      'login',
      'Welcome Back! 👋',
      `Successfully logged in via Google at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      {
        loginMethod: 'google',
        loginTime: new Date()
      }
    );

    // ✅ CHECK AND CREATE TODAY'S NUTRITION PLAN IF MISSING
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPlan = await NutritionPlan.findOne({
      userId: user._id,
      date: today
    });

    if (!existingPlan && user.weight && user.height && user.fitnessGoal) {
      const personalizedPlan = generatePersonalizedPlanForUser(user);
      
      await NutritionPlan.create({
        userId: user._id,
        date: today,
        targetCalories: personalizedPlan.targetCalories,
        meals: personalizedPlan.meals,
        mealTimes: {
          breakfast: { start: '07:00', end: '08:00' },
          lunch: { start: '12:30', end: '13:30' },
          dinner: { start: '19:00', end: '20:00' },
          snacks: { start: '16:00', end: '17:00' }
        },
        waterIntake: 0
      });

      await createNotification(
        user._id,
        'daily-plan',
        'Today\'s Nutrition Plan Ready! 🍽️',
        `Your personalized meal plan is ready. Target: ${personalizedPlan.targetCalories} calories.`,
        { date: today }
      );

      console.log(`✅ Nutrition plan created for user ${user.name}`);
    }

    console.log("✅ Google login successful:", user.email);

    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        age: user.age,                    // ✅ ADDED
        gender: user.gender,              // ✅ ADDED
        weight: user.weight,              // ✅ ADDED
        height: user.height,              // ✅ ADDED
        fitnessGoal: user.fitnessGoal,    // ✅ ADDED
        avatar: user.avatar,
         googleFitConnected: user.googleFitConnected || false  // ✅ ADDED
      }, 
      token: signAppJwt(user) 
    });
  } catch (err) {
    console.error("❌ Google login error:", err);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
});

app.get("/api/me", verifyToken, async (req, res) => {
  try {
    console.log("\n=== GET CURRENT USER ===");
    console.log("User ID from token:", req.userId);
    
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("✅ User found:", user.email);
    console.log("=== USER FETCHED ===\n");
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        avatar: user.avatar,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// ============================================
// USER PROFILE ROUTES (✅ NEW)
// ============================================

app.patch("/api/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { height, weight, age, gender, fitnessGoal } = req.body;
    
    console.log("\n=== UPDATE USER PROFILE ===");
    console.log("User ID:", userId);
    console.log("Updates:", { height, weight, age, gender, fitnessGoal });
    
    const updateData = {};
    if (height !== undefined) updateData.height = parseInt(height);
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (age !== undefined) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;
    if (fitnessGoal) updateData.fitnessGoal = fitnessGoal;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log(`✅ User profile updated: height=${user.height}cm, weight=${user.weight}kg`);
    console.log("=== UPDATE COMPLETED ===\n");
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ success: false, message: "Failed to update user", error: err.message });
  }
});

// ============================================
// LOGIN HISTORY ROUTES
// ============================================

app.get("/api/user/:userId/login-history", async (req, res) => {
  try {
    const history = await LoginHistory.find({ userId: req.params.userId })
      .sort({ loginTime: -1 })
      .limit(50);
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

app.get("/api/admin/login-history", async (req, res) => {
  try {
    const history = await LoginHistory.find({})
      .populate('userId', 'name email')
      .sort({ loginTime: -1 })
      .limit(100);
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

app.get("/api/admin/failed-logins", async (req, res) => {
  try {
    const failed = await LoginHistory.find({ success: false })
      .sort({ loginTime: -1 })
      .limit(50);
    res.json({ success: true, count: failed.length, failedLogins: failed });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch failed logins" });
  }
});

// ============================================
// EXERCISE TRACKING ROUTES
// ============================================

app.post("/api/exercise/complete", async (req, res) => {
  try {
    const { userId, exerciseName, exerciseType, duration, caloriesBurned } = req.body;
    
    console.log("\n=== EXERCISE COMPLETE REQUEST ===");
    console.log("Data:", { userId, exerciseName, exerciseType, duration, caloriesBurned });
    
    if (!userId || !exerciseName || !exerciseType || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const weekStartDate = getWeekStartDate();
    
    const activity = await ExerciseActivity.create({
      userId,
      exerciseName,
      exerciseType,
      duration: parseInt(duration),
      caloriesBurned: parseInt(caloriesBurned) || 0,
      completedAt: new Date(),
      weekStartDate: new Date(weekStartDate)
    });

    await createNotification(
      userId,
      'exercise-complete',
      'Workout Complete! 🎉',
      `You completed ${exerciseName} and burned ${caloriesBurned} calories!`,
      {
        exerciseName,
        calories: caloriesBurned,
        duration
      }
    );

    console.log(`✅ Exercise completed: ${exerciseName} by user ${userId}`);
    console.log("Activity ID:", activity._id);
    console.log("=== EXERCISE COMPLETED ===\n");

    res.json({ 
      success: true, 
      message: "Exercise completed!",
      activity 
    });
  } catch (err) {
    console.error("❌ Error completing exercise:", err);
    res.status(500).json({ message: "Failed to record exercise", error: err.message });
  }
});

// ============================================
// 📊 WEEKLY PROGRESS FOR DASHBOARD (FIXED)
// ============================================

app.get("/api/progress/:userId/week", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`\n📈 ═══════════════════════════════════════════`);
    console.log(`📈 CALCULATING WEEKLY PROGRESS FOR DASHBOARD`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`📈 ═══════════════════════════════════════════`);
    
    // Get current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    console.log(`📅 Week: ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`);
    
    // ============================================
    // ✅ 1. EXERCISE PROGRESS
    // ============================================
   const exerciseActivities = await ExerciseActivity.find({
  userId,
  weekStartDate: { $gte: weekStart, $lt: weekEnd }
});

    
    const exerciseCompleted = exerciseActivities.length;
    const exerciseTarget = 5; // 5 workouts per week goal
    const exerciseProgress = Math.min(Math.round((exerciseCompleted / exerciseTarget) * 100), 100);
    
    console.log(`🏋️ Exercise:`);
    console.log(`   - Completed: ${exerciseCompleted}/${exerciseTarget} workouts`);
    console.log(`   - Progress: ${exerciseProgress}%`);
    
    // ============================================
    // ✅ 2. NUTRITION PROGRESS (FIXED)
    // ============================================
    const nutritionPlans = await NutritionPlan.find({
      userId,
      date: { $gte: weekStart, $lt: weekEnd }
    });
    
    console.log(`🍎 Nutrition Plans Found: ${nutritionPlans.length}`);
    
    let nutritionDaysCompleted = 0;
    let totalConsumedThisWeek = 0;
    let totalTargetThisWeek = 0;
    
    nutritionPlans.forEach((plan, index) => {
      // Calculate consumed calories for this day
      let consumed = 0;
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        if (plan.meals && plan.meals[mealType] && Array.isArray(plan.meals[mealType])) {
          plan.meals[mealType].forEach(item => {
            if (item.consumed) {
              consumed += item.calories || 0;
            }
          });
        }
      });
      
      const target = plan.targetCalories || 1800;
      totalConsumedThisWeek += consumed;
      totalTargetThisWeek += target;
      
      // Consider day completed if consumed 70-120% of target
      const percentage = (consumed / target) * 100;
      if (consumed >= target * 0.7 && consumed <= target * 1.2) {
        nutritionDaysCompleted++;
        console.log(`   Day ${index + 1}: ✅ ${consumed}/${target} cal (${percentage.toFixed(0)}%)`);
      } else {
        console.log(`   Day ${index + 1}: ⚠️  ${consumed}/${target} cal (${percentage.toFixed(0)}%)`);
      }
    });
    
    const nutritionTarget = 7; // 7 days per week
    const nutritionProgress = Math.min(Math.round((nutritionDaysCompleted / nutritionTarget) * 100), 100);
    
    console.log(`🍎 Nutrition Summary:`);
    console.log(`   - Days completed: ${nutritionDaysCompleted}/${nutritionTarget}`);
    console.log(`   - Total consumed: ${totalConsumedThisWeek} cal`);
    console.log(`   - Progress: ${nutritionProgress}%`);
    
    // ============================================
    // ✅ 3. MEDICINE PROGRESS (FIXED)
    // ============================================
    const medicines = await Medicine.find({ userId, isActive: true });
    console.log(`💊 Active Medicines: ${medicines.length}`);
    
    const medicineLogs = await MedicineLog.find({
      userId,
      scheduledDate: { $gte: weekStart, $lt: weekEnd }
    });
    
    console.log(`💊 Medicine Logs Found: ${medicineLogs.length}`);
    
    // Calculate expected doses
    const daysElapsed = Math.ceil((now - weekStart) / (1000 * 60 * 60 * 24));
    const daysToCount = Math.min(daysElapsed, 7);
    
    let totalExpectedDoses = 0;
    medicines.forEach(med => {
      const dosesPerDay = med.times?.length || 1;
      totalExpectedDoses += dosesPerDay * daysToCount;
      console.log(`   - ${med.name}: ${dosesPerDay} x ${daysToCount} days = ${dosesPerDay * daysToCount} doses`);
    });
    
    // Count taken doses
    const medicinesTaken = medicineLogs.filter(log => log.status === 'taken').length;
    const medicineProgress = totalExpectedDoses > 0 
      ? Math.min(Math.round((medicinesTaken / totalExpectedDoses) * 100), 100)
      : 0;
    
    console.log(`💊 Medicine Summary:`);
    console.log(`   - Taken: ${medicinesTaken}/${totalExpectedDoses} doses`);
    console.log(`   - Progress: ${medicineProgress}%`);












    // ============================================
// 💊 TODAY'S MEDICINE STATS FOR DASHBOARD
// ============================================

// TODAYS MEDICINE STATS FOR DASHBOARD (FIXED)
app.get("/api/medicines/:userId/today", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`\n💊 ═══════════════════════════════════════════`);
    console.log(`💊 FETCHING TODAY'S MEDICINE STATS`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📅 Date: ${new Date().toLocaleDateString()}`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
    console.log(`💊 ═══════════════════════════════════════════`);
    
    // Get all active medicines for user
    const medicines = await Medicine.find({ 
      userId, 
      isActive: true 
    });
    
    console.log(`📋 Found ${medicines.length} active medicines`);
    
    if (medicines.length === 0) {
      console.log(`⚠️ No medicines found for user`);
      return res.status(200).json({
        success: true,
        taken: 0,
        total: 0,
        medicines: [],
        logs: []
      });
    }

    // Calculate total expected doses for today
    let totalDosesToday = 0;
    medicines.forEach(med => {
      const timesCount = med.times?.length || 0;
      totalDosesToday += timesCount;
      console.log(`   - ${med.name}: ${timesCount} doses/day`);
    });
    
    console.log(`💊 Total expected doses today: ${totalDosesToday}`);
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get medicine logs for today
    let logs = [];
    let takenDoses = 0;
    
    try {
      logs = await MedicineLog.find({
        userId,
        scheduledDate: { $gte: today, $lt: tomorrow }
      });
      
      console.log(`📝 Found ${logs.length} medicine logs for today`);
      takenDoses = logs.filter(log => log.status === 'taken').length;
    } catch (logErr) {
      console.log(`⚠️ MedicineLog query failed (might not exist):`, logErr.message);
      // If MedicineLog doesn't work, just return medicine info
    }
    
    console.log(`✅ Doses taken: ${takenDoses}/${totalDosesToday}`);
    console.log(`💊 ═══════════════════════════════════════════\n`);
    
    res.status(200).json({
      success: true,
      taken: takenDoses,
      total: totalDosesToday,
      medicines: medicines.map(med => ({
        id: med._id,
        name: med.name,
        dosage: med.dosage,
        times: med.times,
        frequency: med.frequency
      })),
      logs: logs.map(log => ({
        id: log._id,
        medicineId: log.medicineId,
        medicineName: log.medicineName,
        scheduledTime: log.scheduledTime,
        status: log.status,
        takenAt: log.takenAt
      }))
    });
    
  } catch (error) {
    console.error("❌ ERROR FETCHING TODAY'S MEDICINE:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch today's medicine stats",
      error: error.message 
    });
  }
});


    
    // ============================================
    // ✅ RESPONSE DATA
    // ============================================
    const progressData = {
      success: true,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      exercise: exerciseProgress,
      nutrition: nutritionProgress,
      medicine: medicineProgress,
      details: {
        exercise: {
          completed: exerciseCompleted,
          target: exerciseTarget,
          percentage: exerciseProgress,
          activities: exerciseActivities.map(a => ({
            name: a.exerciseName,
            type: a.exerciseType,
            duration: a.duration,
            calories: a.caloriesBurned,
            completedAt: a.completedAt
          }))
        },
        nutrition: {
          completed: nutritionDaysCompleted,
          target: nutritionTarget,
          percentage: nutritionProgress,
          plansCount: nutritionPlans.length,
          totalConsumed: totalConsumedThisWeek,
          totalTarget: totalTargetThisWeek
        },
        medicine: {
          completed: medicinesTaken,
          target: totalExpectedDoses,
          percentage: medicineProgress,
          activeMedicines: medicines.length,
          daysTracked: daysToCount
        }
      }
    };
    
    console.log(`\n✅ WEEKLY PROGRESS CALCULATED:`);
    console.log(`   🏋️ Exercise: ${exerciseProgress}%`);
    console.log(`   🍎 Nutrition: ${nutritionProgress}%`);
    console.log(`   💊 Medicine: ${medicineProgress}%`);
    console.log(`   📊 Overall: ${Math.round((exerciseProgress + nutritionProgress + medicineProgress) / 3)}%`);
    console.log(`📈 ═══════════════════════════════════════════\n`);
    
    res.status(200).json(progressData);
    
  } catch (error) {
    console.error("❌ ERROR CALCULATING WEEKLY PROGRESS:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to calculate weekly progress",
      error: error.message 
    });
  }
});


app.get("/api/exercise/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = await ExerciseActivity.find({ userId })
      .sort({ completedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});
// ============================================
// 📊 WEEKLY EXERCISE STATS (NEW - MISSING)
// ============================================

app.get("/api/exercise/weekly-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const weekStartDate = getWeekStartDate();

    console.log(`\n📊 ═══════════════════════════════════════════`);
    console.log(`📊 FETCHING WEEKLY EXERCISE STATS`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📅 Week starts: ${new Date(weekStartDate).toLocaleDateString()}`);
    console.log(`📊 ═══════════════════════════════════════════`);

    const weeklyActivities = await ExerciseActivity.find({
      userId,
      weekStartDate: new Date(weekStartDate)
    });

    console.log(`✅ Found ${weeklyActivities.length} activities this week`);

    const workoutsCompleted = weeklyActivities.filter(a => 
      a.exerciseType !== 'meditation'
    ).length;

    const totalCaloriesBurned = weeklyActivities.reduce((sum, a) => 
      sum + (a.caloriesBurned || 0), 0
    );

    const meditationMinutes = weeklyActivities
      .filter(a => a.exerciseType === 'meditation')
      .reduce((sum, a) => sum + a.duration, 0);

    console.log(`🏋️ Workouts: ${workoutsCompleted}`);
    console.log(`🔥 Calories: ${totalCaloriesBurned}`);
    console.log(`🧘 Meditation: ${meditationMinutes} mins`);
    console.log(`📊 ═══════════════════════════════════════════\n`);

    res.json({
      success: true,
      weekStartDate: new Date(weekStartDate),
      stats: {
        workoutsCompleted,
        totalCaloriesBurned,
        meditationMinutes
      },
      activities: weeklyActivities.map(a => ({
        id: a._id,
        name: a.exerciseName,
        type: a.exerciseType,
        duration: a.duration,
        calories: a.caloriesBurned,
        completedAt: a.completedAt
      }))
    });
  } catch (err) {
    console.error("❌ ERROR FETCHING WEEKLY STATS:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch weekly stats", 
      error: err.message 
    });
  }
});

// ============================================
// 📊 TODAY'S EXERCISE FOR DASHBOARD (NEW)
// ============================================

app.get("/api/exercise/:userId/today", async (req, res) => {
  try {
    const { userId } = req.params;
    const weekStartDate = getWeekStartDate();
    
    console.log(`\n📊 Fetching today's exercise data for user: ${userId}`);
    
    // Get weekly activities
    const activities = await ExerciseActivity.find({
      userId,
      weekStartDate: new Date(weekStartDate)
    });
    
    const completed = activities.length;
    const planned = 5; // 5 workouts per week goal
    
    console.log(`✅ Exercise stats: ${completed}/${planned} workouts this week\n`);
    
    res.status(200).json({
      success: true,
      steps: 0,
      completed,
      planned,
      googleFitConnected: false,
      activities: activities.map(a => ({
        name: a.exerciseName,
        type: a.exerciseType,
        duration: a.duration,
        calories: a.caloriesBurned,
        completedAt: a.completedAt
      }))
    });
    
  } catch (error) {
    console.error("❌ Error fetching today's exercise:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch today's exercise",
      error: error.message 
    });
  }
});

console.log('✅ Exercise weekly stats and today routes added');


// ============================================
// NOTIFICATION ROUTES
// ============================================

app.post("/api/notifications", async (req, res) => {
  try {
    const { userId, type, title, message, metadata } = req.body;
    
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      metadata
    });
    
    await notification.save();
    console.log("✅ Notification created:", type);
    
    res.json({ success: true, notification });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ success: false, message: "Failed to create notification" });
  }
});

app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 50;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

app.patch("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    res.json({ success: true, notification });
  } catch (err) {
    console.error("Error marking notification:", err);
    res.status(500).json({ success: false, message: "Failed to mark notification" });
  }
});

app.patch("/api/notifications/:userId/mark-all-read", async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
});

app.delete("/api/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
});

app.delete("/api/notifications/:userId/clear-all", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await Notification.deleteMany({ userId });
    
    console.log(`✅ Cleared ${result.deletedCount} notifications for user ${userId}`);
    
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("Error clearing all notifications:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to clear notifications" 
    });
  }
});

app.get("/api/notifications/:userId/unread-count", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await Notification.countDocuments({ userId, read: false });
    
    res.json({ success: true, count });
  } catch (err) {
    console.error("Error getting unread count:", err);
    res.status(500).json({ success: false, message: "Failed to get unread count" });
  }
});

// ============================================
// MEDICINE ROUTES
// ============================================

async function createLogsForToday(medicine) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const time of medicine.times) {
    const existingLog = await MedicineLog.findOne({
      medicineId: medicine._id,
      scheduledTime: time,
      scheduledDate: today
    });
    
    if (!existingLog) {
      await MedicineLog.create({
        userId: medicine.userId,
        medicineId: medicine._id,
        medicineName: medicine.name,
        scheduledTime: time,
        scheduledDate: today,
        status: 'pending'
      });
    }
  }
}

app.get("/api/medicines/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const medicines = await Medicine.find({ 
      userId, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, medicines });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ success: false, message: "Failed to fetch medicines" });
  }
});

app.post("/api/medicines", async (req, res) => {
  try {
    const { userId, name, dosage, times, frequency, endDate } = req.body;
    
    console.log("\n=== ADD MEDICINE ===");
    console.log("User ID:", userId);
    console.log("Medicine:", name);
    console.log("Dosage:", dosage);
    console.log("Times:", times);
    
    if (!userId || !name || !dosage || !times || times.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    const medicine = new Medicine({
      userId,
      name,
      dosage,
      times,
      frequency: frequency || 'daily',
      endDate
    });
    
    await medicine.save();
    await createLogsForToday(medicine);
    
    console.log("✅ Medicine added:", medicine.name);
    console.log("=== MEDICINE ADDED ===\n");
    
    res.json({ success: true, medicine });
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ success: false, message: "Failed to add medicine" });
  }
});

app.get("/api/medicines/schedule/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const logs = await MedicineLog.find({
      userId,
      scheduledDate: { $gte: today, $lt: tomorrow }
    }).sort({ scheduledTime: 1 });
    
    console.log(`📋 Today's schedule for user ${userId}: ${logs.length} medicines`);
    
    res.json({ success: true, schedule: logs });
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ success: false, message: "Failed to fetch schedule" });
  }
});

app.post("/api/medicines/take", async (req, res) => {
  try {
    const { logId } = req.body;
    
    const log = await MedicineLog.findByIdAndUpdate(
      logId,
      { 
        status: 'taken',
        takenAt: new Date()
      },
      { new: true }
    );
    
    console.log("✅ Medicine marked as taken:", log.medicineName, "at", log.scheduledTime);
    
    res.json({ success: true, log });
  } catch (err) {
    console.error("Error marking medicine:", err);
    res.status(500).json({ success: false, message: "Failed to mark medicine" });
  }
});

app.get("/api/medicines/adherence/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    
    const now = new Date();
    
    const logs = await MedicineLog.find({
      userId,
      scheduledDate: { $gte: weekStart, $lte: now }
    });
    
    const pastLogs = logs.filter(log => {
      const [hours, minutes] = log.scheduledTime.split(':');
      const scheduledDateTime = new Date(log.scheduledDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return scheduledDateTime <= now;
    });
    
    const totalDoses = pastLogs.length;
    const takenDoses = pastLogs.filter(log => log.status === 'taken').length;
    
    const adherenceRate = totalDoses > 0 
      ? Math.round((takenDoses / totalDoses) * 100) 
      : 100;
    
    console.log(`📊 Adherence for user ${userId}: ${adherenceRate}% (${takenDoses}/${totalDoses})`);
    
    res.json({ 
      success: true, 
      adherenceRate,
      takenDoses,
      totalDoses
    });
  } catch (err) {
    console.error("Error calculating adherence:", err);
    res.status(500).json({ success: false, message: "Failed to calculate adherence" });
  }
});

app.get("/api/medicines/next-dose/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await MedicineLog.find({
      userId,
      scheduledDate: { $gte: today },
      status: 'pending'
    }).sort({ scheduledDate: 1, scheduledTime: 1 }).limit(1);
    
    if (logs.length === 0) {
      return res.json({ 
        success: true, 
        nextDose: null 
      });
    }
    
    const nextLog = logs[0];
    const [hours, minutes] = nextLog.scheduledTime.split(':');
    const scheduledDateTime = new Date(nextLog.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (scheduledDateTime > now) {
      console.log(`⏰ Next dose for user ${userId}: ${nextLog.medicineName} at ${nextLog.scheduledTime}`);
      
      res.json({ 
        success: true, 
        nextDose: {
          medicineName: nextLog.medicineName,
          time: nextLog.scheduledTime,
          date: nextLog.scheduledDate
        }
      });
    } else {
      res.json({ success: true, nextDose: null });
    }
  } catch (err) {
    console.error("Error getting next dose:", err);
    res.status(500).json({ success: false, message: "Failed to get next dose" });
  }
});

app.delete("/api/medicines/:medicineId", async (req, res) => {
  try {
    const { medicineId } = req.params;
    
    await Medicine.findByIdAndUpdate(medicineId, { isActive: false });
    
    console.log("✅ Medicine deleted:", medicineId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({ success: false, message: "Failed to delete medicine" });
  }
});

// ============================================
// PROGRESS TRACKING ROUTES
// ============================================

async function calculateWeightChange(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const oldProgress = await Progress.findOne({
    userId,
    date: { $lte: thirtyDaysAgo }
  }).sort({ date: -1 });
  
  const latestProgress = await Progress.findOne({ userId })
    .sort({ date: -1 });
  
  if (oldProgress && latestProgress) {
    return (latestProgress.weight - oldProgress.weight).toFixed(1);
  }
  return 0;
}

async function calculateAverageSteps(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const weekProgress = await Progress.find({
    userId,
    date: { $gte: sevenDaysAgo }
  });
  
  if (weekProgress.length === 0) return 0;
  
  const totalSteps = weekProgress.reduce((sum, p) => sum + (p.dailySteps || 0), 0);
  return Math.round(totalSteps / weekProgress.length);
}

async function calculateAdherence(userId) {
  const weekStart = getWeekStartDate();
  const now = new Date();
  
  const logs = await MedicineLog.find({
    userId,
    scheduledDate: { $gte: new Date(weekStart), $lte: now }
  });
  
  const pastLogs = logs.filter(log => {
    const [hours, minutes] = log.scheduledTime.split(':');
    const scheduledDateTime = new Date(log.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return scheduledDateTime <= now;
  });
  
  const totalDoses = pastLogs.length;
  const takenDoses = pastLogs.filter(log => log.status === 'taken').length;
  
  return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
}

app.get("/api/progress/:userId/current", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const latestProgress = await Progress.findOne({ userId })
      .sort({ date: -1 });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = await Progress.findOne({
      userId,
      date: { $gte: today }
    });
    
    const weekStartDate = getWeekStartDate();
    const weeklyActivities = await ExerciseActivity.find({
      userId,
      weekStartDate: new Date(weekStartDate)
    });
    
    const totalCaloriesBurned = weeklyActivities.reduce((sum, a) => 
      sum + (a.caloriesBurned || 0), 0
    );
    
    const adherence = await calculateAdherence(userId);
    
    res.json({
      success: true,
      progress: {
        weight: latestProgress?.weight || user.weight || 0,
        weightChange: await calculateWeightChange(userId),
        bmi: latestProgress?.bmi || 0,
        dailySteps: todayProgress?.dailySteps || 0,
        dailyStepsAverage: await calculateAverageSteps(userId),
        caloriesBurned: totalCaloriesBurned,
        caloriesAverage: Math.round(totalCaloriesBurned / 7),
        adherenceRate: adherence
      }
    });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ success: false, message: "Failed to fetch progress" });
  }
});

// ✅ UPDATED: Calculate BMI directly in route
app.post("/api/progress/weight", async (req, res) => {
  try {
    const { userId, weight } = req.body;
    
    if (!userId || !weight) {
      return res.status(400).json({ 
        success: false, 
        message: "userId and weight are required" 
      });
    }
    
    // Get user to calculate BMI
    const user = await User.findById(userId);
    
    let bmi = null;
    if (user && user.height) {
      const heightInMeters = user.height / 100;
      bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      console.log(`✅ BMI calculated: ${bmi} (height: ${user.height}cm, weight: ${weight}kg)`);
    } else {
      console.log("❌ Cannot calculate BMI: user height not found");
    }
    
    const progress = new Progress({
      userId,
      weight,
      bmi, // Set BMI explicitly
      date: new Date()
    });
    
    await progress.save();
    
    console.log(`✅ Weight updated for user ${userId}: ${weight} kg, BMI: ${bmi}`);
    
    res.json({ success: true, progress });
  } catch (err) {
    console.error("Error updating weight:", err);
    res.status(500).json({ success: false, message: "Failed to update weight" });
  }
});

app.post("/api/progress/steps", async (req, res) => {
  try {
    const { userId, steps } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const progress = await Progress.findOneAndUpdate(
      { userId, date: { $gte: today } },
      { dailySteps: steps },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, progress });
  } catch (err) {
    console.error("Error updating steps:", err);
    res.status(500).json({ success: false, message: "Failed to update steps" });
  }
});

app.get("/api/progress/:userId/history", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const history = await Progress.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    res.json({ success: true, history });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
});

// ============================================
// DEBUG ROUTES
// ============================================

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});



// ============================================
// NUTRITION ROUTES
// ============================================

// Create or update nutrition plan
app.post("/api/nutrition/plan", async (req, res) => {
  try {
    const { userId, date, targetCalories, meals } = req.body;
    
    console.log("\n=== CREATE/UPDATE NUTRITION PLAN ===");
    console.log("User ID:", userId);
    console.log("Date:", date);
    
    // Check if plan exists for this date
    let plan = await NutritionPlan.findOne({ userId, date: new Date(date) });
    
    if (plan) {
      // Update existing plan
      plan.targetCalories = targetCalories;
      plan.meals = meals;
      await plan.save();
      console.log("✅ Plan updated");
    } else {
      // Create new plan
      plan = await NutritionPlan.create({
        userId,
        date: new Date(date),
        targetCalories,
        meals
      });
      console.log("✅ Plan created");
    }
    
    res.json({ success: true, plan });
  } catch (err) {
    console.error("❌ Error saving nutrition plan:", err);
    res.status(500).json({ success: false, message: "Failed to save plan" });
  }
});

// Get nutrition plan for specific date
app.get("/api/nutrition/plan/:userId/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;
    
    const plan = await NutritionPlan.findOne({
      userId,
      date: new Date(date)
    });
    
    if (!plan) {
      return res.json({ success: true, plan: null });
    }
    
    res.json({ success: true, plan });
  } catch (err) {
    console.error("❌ Error fetching plan:", err);
    res.status(500).json({ success: false, message: "Failed to fetch plan" });
  }
});

// Mark food as consumed
app.post("/api/nutrition/consumed", async (req, res) => {
  try {
    const { userId, date, mealType, foodId, consumed } = req.body;
    
    const plan = await NutritionPlan.findOne({
      userId,
      date: new Date(date)
    });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    
    // Find and update the food item
    const meal = plan.meals[mealType];
    const foodIndex = meal.findIndex(f => f._id.toString() === foodId);
    
    if (foodIndex !== -1) {
      meal[foodIndex].consumed = consumed;
      meal[foodIndex].consumedAt = consumed ? new Date() : null;
    }
    
    await plan.save();
    
    console.log(`✅ Food marked as ${consumed ? 'consumed' : 'not consumed'}`);
    
    res.json({ success: true, plan });
  } catch (err) {
    console.error("❌ Error updating consumed:", err);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
});

// Update water intake
app.post("/api/nutrition/water", async (req, res) => {
  try {
    const { userId, date, glasses } = req.body;
    
    const plan = await NutritionPlan.findOneAndUpdate(
      { userId, date: new Date(date) },
      { waterIntake: glasses },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, plan });
  } catch (err) {
    console.error("❌ Error updating water:", err);
    res.status(500).json({ success: false, message: "Failed to update water" });
  }
});

// Get nutrition history
app.get("/api/nutrition/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const history = await NutritionPlan.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json({ success: true, history });
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
});

// Delete nutrition plan
app.delete("/api/nutrition/plan/:planId", async (req, res) => {
  try {
    const { planId } = req.params;
    
    await NutritionPlan.findByIdAndDelete(planId);
    
    console.log("✅ Plan deleted:", planId);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting plan:", err);
    res.status(500).json({ success: false, message: "Failed to delete plan" });
  }
});



// ✅ MEAL TIME NOTIFICATIONS
// Schedule notifications for meal times
cron.schedule('0 7 * * *', async () => {
  // 7:00 AM - Breakfast time
  console.log('🍳 Breakfast time notification trigger');
  await sendMealNotifications('breakfast', 'Breakfast Time! 🍳', 'Ready to start your day with a healthy breakfast?');
});

cron.schedule('30 12 * * *', async () => {
  // 12:30 PM - Lunch time
  console.log('🍛 Lunch time notification trigger');
  await sendMealNotifications('lunch', 'Lunch Time! 🍛', 'Time to refuel with a nutritious lunch!');
});

cron.schedule('0 19 * * *', async () => {
  // 7:00 PM - Dinner time
  console.log('🍽️ Dinner time notification trigger');
  await sendMealNotifications('dinner', 'Dinner Time! 🍽️', 'End your day with a healthy dinner!');
});

cron.schedule('0 16 * * *', async () => {
  // 4:00 PM - Snack time
  console.log('🍎 Snack time notification trigger');
  await sendMealNotifications('snacks', 'Snack Time! 🍎', 'Grab a healthy snack to keep your energy up!');
});

async function sendMealNotifications(mealType, title, message) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);




    
    console.log(`\n🔍 Checking for ${mealType} plans...`);
    console.log(`📅 Date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
    
    // Find all nutrition plans for today
    const plans = await NutritionPlan.find({
      date: { $gte: today, $lt: tomorrow }
    });
    
    console.log(`📊 Found ${plans.length} nutrition plans for today`);
    
    if (plans.length === 0) {
      console.log(`⚠️ No nutrition plans found for today. Notifications not sent.`);
      return { success: false, reason: 'No plans found', count: 0 };
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Create notifications for each user
    for (const plan of plans) {
      try {
        // Check if user exists
        const userExists = await User.findById(plan.userId);
        if (!userExists) {
          console.log(`⚠️ User ${plan.userId} not found, skipping...`);
          failCount++;
          continue;
        }
        
        // Check if meal has items
        const mealItems = plan.meals[mealType];
        if (!mealItems || mealItems.length === 0) {
          console.log(`⚠️ User ${plan.userId} has no ${mealType} items, skipping...`);
          failCount++;
          continue;
        }
        
        // Create notification
        await Notification.create({
          userId: plan.userId,
          type: 'meal-time',
          title,
          message,
          metadata: { mealType, date: today }
        });
        
        console.log(`✅ ${mealType} notification sent to user ${plan.userId} (${userExists.name})`);
        successCount++;
        
      } catch (notifErr) {
        console.error(`❌ Failed to send notification to user ${plan.userId}:`, notifErr.message);
        failCount++;
      }
    }
    
    console.log(`\n📈 Summary: ${successCount} sent, ${failCount} failed\n`);
    
    return {
      success: successCount > 0,
      totalPlans: plans.length,
      sent: successCount,
      failed: failCount
    };
    
  } catch (err) {
    console.error(`❌ FATAL ERROR in sendMealNotifications:`, err);
    console.error('Stack:', err.stack);
    return { success: false, error: err.message, count: 0 };
  }
}

// ============================================
// DAILY PLAN AUTO-CREATION
// ============================================

// Helper function to generate personalized plan for a user
function generatePersonalizedPlanForUser(user) {
  // Calculate BMR
  const bmr = user.gender === 'male' 
    ? 88.362 + (13.397 * (user.weight || 70)) + (4.799 * (user.height || 170)) - (5.677 * (user.age || 25))
    : 447.593 + (9.247 * (user.weight || 60)) + (3.098 * (user.height || 160)) - (4.330 * (user.age || 25));
  
  const activityMultiplier = 1.4;
  let maintenanceCalories = bmr * activityMultiplier;
  
  // Adjust based on fitness goal
  let targetCalories;
  switch (user.fitnessGoal) {
    case 'lose':
      targetCalories = Math.round(maintenanceCalories - 500);
      break;
    case 'gain':
      targetCalories = Math.round(maintenanceCalories + 300);
      break;
    default:
      targetCalories = Math.round(maintenanceCalories);
  }
  
  // Sample meals (Indian diet focused)
  const meals = {
    breakfast: [
      {
        name: "Paneer (100g)",
        quantity: 1,
        unit: "cup",
        calories: 265,
        protein: 19,
        carbs: 1.2,
        fat: 20,
        consumed: false
      },
      {
        name: "Milk",
        quantity: 200,
        unit: "ml",
        calories: 120,
        protein: 8,
        carbs: 12,
        fat: 5,
        consumed: false
      }
    ],
    lunch: [
      {
        name: "Roti",
        quantity: 2,
        unit: "pieces",
        calories: 140,
        protein: 4,
        carbs: 28,
        fat: 2,
        consumed: false
      },
      {
        name: "Dal",
        quantity: 1,
        unit: "bowl",
        calories: 180,
        protein: 12,
        carbs: 24,
        fat: 4,
        consumed: false
      },
      {
        name: "Mixed Vegetables",
        quantity: 1,
        unit: "bowl",
        calories: 130,
        protein: 4,
        carbs: 20,
        fat: 4,
        consumed: false
      }
    ],
    dinner: [
      {
        name: "Roti",
        quantity: 2,
        unit: "pieces",
        calories: 140,
        protein: 4,
        carbs: 28,
        fat: 2,
        consumed: false
      },
      {
        name: "Paneer Curry",
        quantity: 1,
        unit: "bowl",
        calories: 320,
        protein: 18,
        carbs: 12,
        fat: 22,
        consumed: false
      }
    ],
    snacks: [
      {
        name: "Apple",
        quantity: 1,
        unit: "piece",
        calories: 95,
        protein: 0,
        carbs: 25,
        fat: 0,
        consumed: false
      },
      {
        name: "Mixed Nuts",
        quantity: 30,
        unit: "g",
        calories: 170,
        protein: 6,
        carbs: 6,
        fat: 15,
        consumed: false
      }
    ]
  };
  
  return {
    targetCalories,
    meals
  };
}

// Create daily nutrition plans at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('\n🌅 === DAILY NUTRITION PLAN CREATION ===');
  console.log('Time:', new Date().toLocaleString());
  
  try {
    const users = await User.find({});
    console.log(`📊 Processing ${users.length} users...`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        // Check if plan already exists for today
        const existingPlan = await NutritionPlan.findOne({
          userId: user._id,
          date: today
        });
        
        if (existingPlan) {
          skipped++;
          continue;
        }
        
        // Generate personalized plan
        const personalizedPlan = generatePersonalizedPlanForUser(user);
        
        // Create nutrition plan
        await NutritionPlan.create({
          userId: user._id,
          date: today,
          targetCalories: personalizedPlan.targetCalories,
          meals: personalizedPlan.meals,
          mealTimes: {
            breakfast: { start: '07:00', end: '08:00' },
            lunch: { start: '12:30', end: '13:30' },
            dinner: { start: '19:00', end: '20:00' },
            snacks: { start: '16:00', end: '17:00' }
          },
          waterIntake: 0
        });
        
        // Send notification
        await Notification.create({
          userId: user._id,
          type: 'daily-plan',
          title: 'Today\'s Nutrition Plan Ready! 🍽️',
          message: `Your personalized meal plan for today is ready. Target: ${personalizedPlan.targetCalories} calories.`,
          metadata: { date: today }
        });
        
        created++;
        console.log(`✅ ${user.name}: Plan created (${personalizedPlan.targetCalories} cal)`);
        
      } catch (err) {
        errors++;
        console.error(`❌ ${user.name}: Error -`, err.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('=== DAILY PLAN CREATION COMPLETE ===\n');
    
  } catch (err) {
    console.error('❌ Fatal error in daily plan creation:', err);
  }
});

console.log('⏰ Cron jobs scheduled:');
console.log('  - Daily nutrition plans: 00:00 (midnight)');
console.log('  - Breakfast notification: 07:00');
console.log('  - Lunch notification: 12:30');
console.log('  - Snack notification: 16:00');
console.log('  - Dinner notification: 19:00\n');



// ============================================
// 📸 UPDATE USER AVATAR (COMPLETE FIX)
// ============================================

app.patch('/api/user/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar } = req.body;

    console.log(`\n📸 ═══════════════════════════════════════════`);
    console.log(`📸 AVATAR UPLOAD REQUEST`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📸 Avatar received: ${avatar ? 'YES' : 'NO'}`);
    console.log(`📸 Avatar length: ${avatar?.length || 0} characters`);
    console.log(`📸 Avatar preview: ${avatar?.substring(0, 50) || 'none'}...`);
    console.log(`📸 ═══════════════════════════════════════════`);

    // Validate
    if (!avatar) {
      console.log(`❌ No avatar in request body`);
      return res.status(400).json({ 
        success: false, 
        message: "No avatar provided" 
      });
    }

    if (typeof avatar !== 'string') {
      console.log(`❌ Avatar is not a string, type: ${typeof avatar}`);
      return res.status(400).json({ 
        success: false, 
        message: "Avatar must be a string" 
      });
    }

    if (!avatar.startsWith('data:image/')) {
      console.log(`❌ Invalid avatar format, starts with: ${avatar.substring(0, 20)}`);
      return res.status(400).json({ 
        success: false, 
        message: "Avatar must be a base64 image starting with 'data:image/'" 
      });
    }

    // Find user first
    console.log(`📸 Finding user...`);
    const existingUser = await User.findById(userId);
    
    if (!existingUser) {
      console.log(`❌ User not found`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log(`✅ User found: ${existingUser.name}`);
    console.log(`📸 Old avatar length: ${existingUser.avatar?.length || 0}`);

    // Update avatar
    console.log(`📸 Updating avatar field...`);
    existingUser.avatar = avatar;
    
    // Save with validation disabled (for debugging)
    const savedUser = await existingUser.save({ validateBeforeSave: false });
    
    console.log(`✅ User saved!`);
    console.log(`✅ New avatar length: ${savedUser.avatar?.length || 0}`);

    // Verify it was saved
    const verifyUser = await User.findById(userId);
    console.log(`🔍 Verification - Avatar in DB: ${verifyUser.avatar?.length || 0} characters`);

    if (!verifyUser.avatar || verifyUser.avatar.length === 0) {
      console.log(`❌ Avatar was not saved to database!`);
      return res.status(500).json({
        success: false,
        message: "Avatar was not saved to database"
      });
    }

    console.log(`✅ Avatar successfully saved and verified!`);
    console.log(`📸 ═══════════════════════════════════════════\n`);

    res.json({ 
      success: true, 
      avatar: savedUser.avatar,
      message: "Avatar updated successfully",
      avatarLength: savedUser.avatar.length
    });

  } catch (error) {
    console.error(`❌ Avatar upload error:`, error);
    console.error(`❌ Stack:`, error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update avatar",
      error: error.message 
    });
  }
});




// ============================================
// 👤 UPDATE USER PROFILE
// ============================================

app.patch('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log(`\n👤 ═══════════════════════════════════════════`);
    console.log(`👤 UPDATING USER PROFILE`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`👤 Update fields:`, Object.keys(updateData));
    console.log(`👤 ═══════════════════════════════════════════`);

    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log(`✅ Profile updated successfully`);
    console.log(`👤 ═══════════════════════════════════════════\n`);

    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        fitnessGoal: user.fitnessGoal,
        avatar: user.avatar
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile",
      error: error.message 
    });
  }
});



// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  const dbName = mongoose.connection.name || "Connected";
  console.log(`📊 MongoDB: Connected to database "${dbName}"`);
});
