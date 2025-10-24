const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({ 
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  targetCalories: {
    type: Number,
    required: true
  },
  // ✅ MEAL TIMES
  mealTimes: {
    breakfast: {
      start: { type: String, default: '07:00' },
      end: { type: String, default: '08:00' }
    },
    lunch: {
      start: { type: String, default: '12:30' },
      end: { type: String, default: '13:30' }
    },
    dinner: {
      start: { type: String, default: '19:00' },
      end: { type: String, default: '20:00' }
    },
    snacks: {
      start: { type: String, default: '16:00' },
      end: { type: String, default: '17:00' }
    }
  },
  meals: {
    breakfast: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'serving' },
      calories: { type: Number, required: true },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      consumed: { type: Boolean, default: false },
      consumedAt: { type: Date }
    }],
    lunch: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'serving' },
      calories: { type: Number, required: true },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      consumed: { type: Boolean, default: false },
      consumedAt: { type: Date }
    }],
    dinner: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'serving' },
      calories: { type: Number, required: true },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      consumed: { type: Boolean, default: false },
      consumedAt: { type: Date }
    }],
    snacks: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'serving' },
      calories: { type: Number, required: true },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      consumed: { type: Boolean, default: false },
      consumedAt: { type: Date }
    }]
  },
  waterIntake: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// ============================================
// ✅ VIRTUAL FIELDS FOR DASHBOARD
// ============================================

// Calculate total consumed calories
nutritionPlanSchema.virtual('totalConsumedCalories').get(function() {
  let total = 0;
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
    if (this.meals && this.meals[mealType] && Array.isArray(this.meals[mealType])) {
      this.meals[mealType].forEach(item => {
        if (item.consumed) {
          total += item.calories || 0;
        }
      });
    }
  });
  return total;
});

// Calculate total consumed protein
nutritionPlanSchema.virtual('totalConsumedProtein').get(function() {
  let total = 0;
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
    if (this.meals && this.meals[mealType] && Array.isArray(this.meals[mealType])) {
      this.meals[mealType].forEach(item => {
        if (item.consumed) {
          total += item.protein || 0;
        }
      });
    }
  });
  return total;
});

// Calculate total consumed carbs
nutritionPlanSchema.virtual('totalConsumedCarbs').get(function() {
  let total = 0;
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
    if (this.meals && this.meals[mealType] && Array.isArray(this.meals[mealType])) {
      this.meals[mealType].forEach(item => {
        if (item.consumed) {
          total += item.carbs || 0;
        }
      });
    }
  });
  return total;
});

// Calculate total consumed fat
nutritionPlanSchema.virtual('totalConsumedFat').get(function() {
  let total = 0;
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
    if (this.meals && this.meals[mealType] && Array.isArray(this.meals[mealType])) {
      this.meals[mealType].forEach(item => {
        if (item.consumed) {
          total += item.fat || 0;
        }
      });
    }
  });
  return total;
});

// ============================================
// ✅ ENABLE VIRTUALS IN JSON/OBJECT OUTPUT
// ============================================

nutritionPlanSchema.set('toJSON', { virtuals: true });
nutritionPlanSchema.set('toObject', { virtuals: true });

// Add compound index for faster queries
nutritionPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
