const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weight: {
    type: Number,
    required: true
  },
  bmi: {
    type: Number
  },
  dailySteps: {
    type: Number,
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { 
  timestamps: true 
});

// Calculate BMI before saving
progressSchema.pre('save', async function(next) {
  try {
    if (this.isModified('weight') || this.isNew) {
      // Get User model
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      
      console.log("🔍 Calculating BMI for user:", this.userId);
      console.log("📏 User height:", user?.height, "cm");
      console.log("⚖️ Weight:", this.weight, "kg");
      
      if (user && user.height) {
        // Convert height from cm to meters
        const heightInMeters = user.height / 100;
        
        // Calculate BMI: weight / (height^2)
        const bmiValue = this.weight / (heightInMeters * heightInMeters);
        this.bmi = parseFloat(bmiValue.toFixed(1));
        
        console.log("✅ BMI calculated:", this.bmi);
      } else {
        console.log("❌ User height not found, cannot calculate BMI");
        this.bmi = null;
      }
    }
    next();
  } catch (err) {
    console.error("❌ Error calculating BMI:", err);
    next(err);
  }
});

module.exports = mongoose.model('Progress', progressSchema);
