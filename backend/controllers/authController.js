// // backend/controllers/authController.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
// const User = require("../models/User");
// const LoginActivity = require("../models/LoginActivity");

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Helper to sign JWT token
// const signAppJwt = (user) => jwt.sign(
//   { id: user._id.toString(), email: user.email, name: user.name },
//   process.env.JWT_SECRET,
//   { expiresIn: "7d" }
// );

// // Helper to extract IP address
// const getClientIp = (req) => {
//   return req.ip ||
//     req.headers['x-forwarded-for']?.split(',')[0] ||
//     req.headers['x-real-ip'] ||
//     req.connection.remoteAddress ||
//     req.socket.remoteAddress ||
//     'unknown';
// };

// // ============================================
// // SIGNUP
// // ============================================
// // exports.signup = async (req, res) => {
// //   try {
// //     const { name, email, password, age, gender, weight, height, fitnessGoal } = req.body;
    
// //     if (!email || !password) {
// //       return res.status(400).json({ message: "Email and password required" });
// //     }
    
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       return res.status(400).json({ message: "User already exists" });
// //     }
    
// //     const hashedPassword = await bcrypt.hash(password, 12);
    
// //     const user = await User.create({
// //       name,
// //       email,
// //       password: hashedPassword,
// //       age: age ? parseInt(age) : undefined,
// //       gender,
// //       weight: weight ? parseFloat(weight) : undefined,
// //       height: height ? parseFloat(height) : undefined,
// //       fitnessGoal
// //     });
    
// //     // Log signup activity
// //     await LoginActivity.create({
// //       userId: user._id,
// //       name: user.name,
// //       email: user.email,
// //       loginTime: new Date(),
// //       ipAddress: getClientIp(req),
// //       userAgent: req.headers['user-agent'],
// //       loginMethod: 'email',
// //       success: true
// //     });
    
// //     console.log("✅ User created:", user.email);
    
// //     res.status(201).json({
// //       success: true,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         age: user.age,
// //         gender: user.gender,
// //         weight: user.weight,
// //         height: user.height,
// //         fitnessGoal: user.fitnessGoal
// //       },
// //       token: signAppJwt(user)
// //     });
// //   } catch (err) {
// //     console.error("❌ Signup error:", err);
// //     res.status(500).json({ message: "Signup failed", error: err.message });
// //   }
// // };
// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password, age, gender, weight, height, fitnessGoal } = req.body;
    
//     console.log("=== SIGNUP REQUEST ===");
//     console.log("Name:", name);
//     console.log("Email:", email);
//     console.log("Password received:", password ? "YES (length: " + password.length + ")" : "NO");
    
//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }
    
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }
    
//     if (!password) {
//       return res.status(400).json({ message: "Password is required" });
//     }
    
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       console.log("❌ User already exists:", email);
//       return res.status(400).json({ message: "User already exists" });
//     }
    
//     // Hash password with error handling
//     console.log("Hashing password...");
//     let hashedPassword;
//     try {
//       hashedPassword = await bcrypt.hash(password, 12);
//       console.log("✅ Password hashed successfully");
//       console.log("Hash preview:", hashedPassword.substring(0, 29) + "...");
      
//       // Verify it's a valid bcrypt hash
//       if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
//         throw new Error("Invalid hash format generated");
//       }
//     } catch (hashError) {
//       console.error("❌ Bcrypt hash error:", hashError.message);
//       return res.status(500).json({ 
//         message: "Password encryption failed", 
//         error: "Server error during password hashing" 
//       });
//     }
    
//     // Create user with hashed password
//     console.log("Creating user in database...");
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,  // ✅ Store HASH, not plain text
//       age: age ? parseInt(age) : undefined,
//       gender,
//       weight: weight ? parseFloat(weight) : undefined,
//       height: height ? parseFloat(height) : undefined,
//       fitnessGoal
//     });
    
//     console.log("✅ User created successfully");
//     console.log("User ID:", user._id);
//     console.log("Stored password (first 29 chars):", user.password.substring(0, 29) + "...");
    
//     // Verify password was saved as hash
//     if (user.password === password) {
//       console.error("⚠️ WARNING: Password stored as plain text!");
//       // Delete the insecure user
//       await User.deleteOne({ _id: user._id });
//       return res.status(500).json({ 
//         message: "Security error: password not encrypted properly" 
//       });
//     }
    
//     // Log signup activity
//     try {
//       await LoginActivity.create({
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         loginTime: new Date(),
//         ipAddress: getClientIp(req),
//         userAgent: req.headers['user-agent'],
//         loginMethod: 'email',
//         success: true
//       });
//       console.log("✅ Login activity logged");
//     } catch (activityError) {
//       console.error("⚠️ Failed to log activity:", activityError.message);
//       // Don't fail signup if activity logging fails
//     }
    
//     // Generate JWT token
//     const token = signAppJwt(user);
//     console.log("✅ JWT token generated");
    
//     console.log("=== SIGNUP COMPLETED SUCCESSFULLY ===\n");
    
//     res.status(201).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         age: user.age,
//         gender: user.gender,
//         weight: user.weight,
//         height: user.height,
//         fitnessGoal: user.fitnessGoal
//       },
//       token
//     });
//   } catch (err) {
//     console.error("❌ SIGNUP ERROR:", err.message);
//     console.error("Stack trace:", err.stack);
//     res.status(500).json({ 
//       message: "Signup failed", 
//       error: process.env.NODE_ENV === 'development' ? err.message : "Server error"
//     });
//   }
// };

// // ============================================
// // LOGIN
// // ============================================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     const user = await User.findOne({ email });
    
//     // User not found
//     if (!user) {
//       await LoginActivity.create({
//         userId: null,
//         name: null,
//         email: email,
//         loginTime: new Date(),
//         ipAddress: getClientIp(req),
//         userAgent: req.headers['user-agent'],
//         loginMethod: 'email',
//         success: false
//       });
//       return res.status(401).json({ message: "Invalid email or password" });
//     }
    
//     // Google user trying email login
//     if (!user.password) {
//       await LoginActivity.create({
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         loginTime: new Date(),
//         ipAddress: getClientIp(req),
//         userAgent: req.headers['user-agent'],
//         loginMethod: 'email',
//         success: false
//       });
//       return res.status(401).json({ message: "Please use Google Sign-In" });
//     }
    
//     // Wrong password
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       await LoginActivity.create({
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         loginTime: new Date(),
//         ipAddress: getClientIp(req),
//         userAgent: req.headers['user-agent'],
//         loginMethod: 'email',
//         success: false
//       });
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Log successful login
//     await LoginActivity.create({
//       userId: user._id,
//       name: user.name,
//       email: user.email,
//       loginTime: new Date(),
//       ipAddress: getClientIp(req),
//       userAgent: req.headers['user-agent'],
//       loginMethod: 'email',
//       success: true
//     });

//     console.log(`✅ User logged in: ${user.email} from ${getClientIp(req)}`);
    
//     res.json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         age: user.age,
//         gender: user.gender,
//         weight: user.weight,
//         height: user.height,
//         fitnessGoal: user.fitnessGoal,
//         googleFitConnected: user.googleFitConnected
//       },
//       token: signAppJwt(user)
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ message: "Login failed", error: err.message });
//   }
// };

// // ============================================
// // GOOGLE LOGIN
// // ============================================
// exports.googleLogin = async (req, res) => {
//   try {
//     const { idToken } = req.body;
//     if (!idToken) {
//       return res.status(400).json({ message: "Missing idToken" });
//     }

//     const ticket = await googleClient.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
    
//     const payload = ticket.getPayload();
//     if (!payload) {
//       return res.status(401).json({ message: "Invalid Google token" });
//     }

//     const { sub, email, name, email_verified } = payload;
//     if (!email_verified) {
//       return res.status(403).json({ message: "Email not verified" });
//     }

//     let user = await User.findOne({ email });
    
//     if (!user) {
//       user = await User.create({
//         googleSub: sub,
//         name: name || email.split('@')[0],
//         email
//       });
//       console.log("✅ New Google user created:", email);
//     } else if (!user.googleSub) {
//       user.googleSub = sub;
//       if (!user.name) {
//         user.name = name || email.split('@')[0];
//       }
//       await user.save();
//       console.log("✅ Google account linked to existing user:", email);
//     }

//     // Log Google login
//     await LoginActivity.create({
//       userId: user._id,
//       name: user.name,
//       email: user.email,
//       loginTime: new Date(),
//       ipAddress: getClientIp(req),
//       userAgent: req.headers['user-agent'],
//       loginMethod: 'google',
//       success: true
//     });

//     const token = jwt.sign(
//       { id: user._id.toString(), email: user.email, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     console.log(`✅ Google user logged in: ${email} from ${getClientIp(req)}`);

//     return res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         googleFitConnected: user.googleFitConnected
//       },
//     });
//   } catch (err) {
//     console.error("❌ Google login error:", err);
//     return res.status(500).json({ message: "Google login failed" });
//   }
// };

// // ============================================
// // GET USER LOGIN HISTORY
// // ============================================
// exports.getUserLoginHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     const history = await LoginActivity.find({ userId })
//       .sort({ loginTime: -1 })
//       .limit(50);
    
//     res.json({
//       success: true,
//       count: history.length,
//       history
//     });
//   } catch (err) {
//     console.error("❌ Error fetching history:", err);
//     res.status(500).json({ message: "Failed to fetch login history" });
//   }
// };

// // ============================================
// // GET ALL LOGIN HISTORY (ADMIN)
// // ============================================
// exports.getAllLoginHistory = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const history = await LoginActivity.find({})
//       .populate('userId', 'name email')
//       .sort({ loginTime: -1 })
//       .skip(skip)
//       .limit(limit);
    
//     const total = await LoginActivity.countDocuments();

//     res.json({
//       success: true,
//       count: history.length,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//       history
//     });
//   } catch (err) {
//     console.error("❌ Error fetching all history:", err);
//     res.status(500).json({ message: "Failed to fetch login history" });
//   }
// };

// // ============================================
// // GET FAILED LOGINS (ADMIN)
// // ============================================
// exports.getFailedLogins = async (req, res) => {
//   try {
//     const failedLogins = await LoginActivity.find({ success: false })
//       .populate('userId', 'name email')
//       .sort({ loginTime: -1 })
//       .limit(100);
    
//     res.json({
//       success: true,
//       count: failedLogins.length,
//       failedLogins
//     });
//   } catch (err) {
//     console.error("❌ Error fetching failed logins:", err);
//     res.status(500).json({ message: "Failed to fetch failed logins" });
//   }
// };

// // ============================================
// // GET LOGIN STATS (BONUS)
// // ============================================
// exports.getLoginStats = async (req, res) => {
//   try {
//     const totalLogins = await LoginActivity.countDocuments({ success: true });
//     const failedLogins = await LoginActivity.countDocuments({ success: false });
//     const uniqueUsers = await LoginActivity.distinct('userId', { success: true });
    
//     const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     const recentLogins = await LoginActivity.countDocuments({
//       loginTime: { $gte: last24Hours },
//       success: true
//     });

//     const methodStats = await LoginActivity.aggregate([
//       { $match: { success: true } },
//       { $group: { _id: '$loginMethod', count: { $sum: 1 } } }
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalLogins,
//         failedLogins,
//         uniqueUsers: uniqueUsers.length,
//         recentLogins24h: recentLogins,
//         loginMethods: methodStats
//       }
//     });
//   } catch (err) {
//     console.error("❌ Error fetching stats:", err);
//     res.status(500).json({ message: "Failed to fetch stats" });
//   }
// };
// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to sign JWT token
const signAppJwt = (user) => jwt.sign(
  { id: user._id.toString(), email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Helper to extract IP address
const getClientIp = (req) => {
  return req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    'unknown';
};

// ============================================
// SIGNUP
// ============================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, age, gender, weight, height, fitnessGoal } = req.body;
    
    console.log("\n=== SIGNUP REQUEST ===");
    console.log("Name:", name);
    console.log("Email:", email);
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }
    
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("✅ Password hashed");
    
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
    
    // Log signup activity
    const activity = await LoginActivity.create({
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
        fitnessGoal: user.fitnessGoal
      },
      token: signAppJwt(user)
    });
  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("\n=== LOGIN REQUEST ===");
    console.log("Email:", email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found");
      await LoginActivity.create({
        userId: null,
        name: null,
        email: email,
        loginTime: new Date(),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        loginMethod: 'email',
        success: false
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (!user.password) {
      console.log("❌ No password (Google user)");
      await LoginActivity.create({
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
      await LoginActivity.create({
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

    // Log successful login
    const activity = await LoginActivity.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      loginTime: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      loginMethod: 'email',
      success: true
    });

    console.log("✅ Login successful, activity saved:", activity._id);
    console.log("=== LOGIN COMPLETED ===\n");
    
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
        fitnessGoal: user.fitnessGoal
      },
      token: signAppJwt(user)
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ============================================
// GOOGLE LOGIN
// ============================================
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub, email, name } = payload;

    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        googleSub: sub,
        name: name || email.split('@')[0],
        email
      });
      console.log("✅ New Google user created:", email);
    } else if (!user.googleSub) {
      user.googleSub = sub;
      if (!user.name) user.name = name || email.split('@')[0];
      await user.save();
    }

    // Log Google login
    await LoginActivity.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      loginTime: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      loginMethod: 'google',
      success: true
    });

    console.log("✅ Google login successful:", email);

    return res.json({
      success: true,
      token: signAppJwt(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Google login error:", err.message);
    return res.status(500).json({ message: "Google login failed" });
  }
};

// ============================================
// GET USER LOGIN HISTORY
// ============================================
exports.getUserLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await LoginActivity.find({ userId })
      .sort({ loginTime: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch login history" });
  }
};

// ============================================
// GET ALL LOGIN HISTORY (ADMIN)
// ============================================
exports.getAllLoginHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const history = await LoginActivity.find({})
      .populate('userId', 'name email')
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await LoginActivity.countDocuments();

    res.json({
      success: true,
      count: history.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      history
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch login history" });
  }
};

// ============================================
// GET FAILED LOGINS (ADMIN)
// ============================================
exports.getFailedLogins = async (req, res) => {
  try {
    const failedLogins = await LoginActivity.find({ success: false })
      .populate('userId', 'name email')
      .sort({ loginTime: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: failedLogins.length,
      failedLogins
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch failed logins" });
  }
};

// ============================================
// GET LOGIN STATS
// ============================================
exports.getLoginStats = async (req, res) => {
  try {
    const totalLogins = await LoginActivity.countDocuments({ success: true });
    const failedLogins = await LoginActivity.countDocuments({ success: false });
    const uniqueUsers = await LoginActivity.distinct('userId', { success: true });
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await LoginActivity.countDocuments({
      loginTime: { $gte: last24Hours },
      success: true
    });

    const methodStats = await LoginActivity.aggregate([
      { $match: { success: true } },
      { $group: { _id: '$loginMethod', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalLogins,
        failedLogins,
        uniqueUsers: uniqueUsers.length,
        recentLogins24h: recentLogins,
        loginMethods: methodStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
