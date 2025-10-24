// Dummy data for the fitness & wellness app

export const indianFoodDatabase = [
  // Breakfast
  {
    id: '1',
    name: 'Roti (Whole Wheat)',
    calories: 71,
    protein: 3,
    carbs: 15,
    fat: 0.4,
    category: 'grains'
  },
  {
    id: '2',
    name: 'Dal (Moong)',
    calories: 147,
    protein: 14,
    carbs: 19,
    fat: 0.6,
    category: 'legumes'
  },
  {
    id: '3',
    name: 'Poha',
    calories: 158,
    protein: 3,
    carbs: 32,
    fat: 1.5,
    category: 'grains'
  },
  {
    id: '4',
    name: 'Idli (2 pieces)',
    calories: 58,
    protein: 2,
    carbs: 12,
    fat: 0.3,
    category: 'grains'
  },
  {
    id: '5',
    name: 'Dosa (Plain)',
    calories: 133,
    protein: 4,
    carbs: 20,
    fat: 4,
    category: 'grains'
  },
  // Main dishes
  {
    id: '6',
    name: 'Basmati Rice (Cooked)',
    calories: 205,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    category: 'grains'
  },
  {
    id: '7',
    name: 'Paneer (100g)',
    calories: 265,
    protein: 18,
    carbs: 1.2,
    fat: 20,
    category: 'dairy'
  },
  {
    id: '8',
    name: 'Chicken Curry',
    calories: 180,
    protein: 25,
    carbs: 5,
    fat: 8,
    category: 'meat'
  },
  {
    id: '9',
    name: 'Rajma',
    calories: 140,
    protein: 8.7,
    carbs: 22,
    fat: 0.5,
    category: 'legumes'
  },
  {
    id: '10',
    name: 'Chole (Chickpeas)',
    calories: 164,
    protein: 8.9,
    carbs: 27,
    fat: 2.6,
    category: 'legumes'
  }
];

export const exerciseRoutines = [
  // Yoga - Beginner
  {
    id: 'yoga-1',
    name: 'Morning Sun Salutation',
    category: 'yoga' as const,
    level: 'beginner' as const,
    duration: 15,
    calories: 50,
    steps: [
      'Stand tall in Mountain Pose (Tadasana)',
      'Inhale, raise arms overhead in Upward Salute',
      'Exhale, fold forward into Forward Fold',
      'Step back into Downward Dog',
      'Lower into Low Push-up position',
      'Roll over toes into Upward Dog',
      'Exhale back to Downward Dog',
      'Step forward and fold',
      'Rise up to standing'
    ]
  },
  {
    id: 'yoga-2',
    name: 'Gentle Hatha Flow',
    category: 'yoga' as const,
    level: 'beginner' as const,
    duration: 30,
    calories: 85,
    steps: [
      'Start in Child\'s Pose for centering',
      'Move to Cat-Cow stretches',
      'Transition to Downward Dog',
      'Step into Warrior I on right side',
      'Flow to Warrior II',
      'Repeat on left side',
      'End in Savasana for relaxation'
    ]
  },
  // Strength Training
  {
    id: 'strength-1',
    name: 'Bodyweight Basics',
    category: 'strength' as const,
    level: 'beginner' as const,
    duration: 25,
    calories: 120,
    steps: [
      '10 Squats',
      '5 Push-ups (modified if needed)',
      '30-second Plank',
      '10 Lunges each leg',
      '10 Glute bridges',
      'Repeat circuit 3 times'
    ]
  },
  // Cardio
  {
    id: 'cardio-1',
    name: 'HIIT for Beginners',
    category: 'cardio' as const,
    level: 'intermediate' as const,
    duration: 20,
    calories: 200,
    steps: [
      'Warm up: 2 minutes light movement',
      '30 seconds Jumping Jacks',
      '30 seconds rest',
      '30 seconds High Knees',
      '30 seconds rest',
      '30 seconds Burpees',
      '30 seconds rest',
      'Repeat cycle 4 times',
      'Cool down: 2 minutes stretching'
    ]
  },
  // Advanced routines
  {
    id: 'yoga-3',
    name: 'Advanced Vinyasa Flow',
    category: 'yoga' as const,
    level: 'advanced' as const,
    duration: 60,
    calories: 250,
    steps: [
      'Complex sun salutations with variations',
      'Arm balances (Crow, Side Crow)',
      'Advanced backbends (Wheel, Scorpion)',
      'Hip openers and twists',
      'Inversions (Headstand, Forearm stand)',
      'Deep relaxation in Savasana'
    ]
  },
  {
    id: 'strength-2',
    name: 'Advanced Strength Training',
    category: 'strength' as const,
    level: 'advanced' as const,
    duration: 45,
    calories: 350,
    steps: [
      'Dynamic warm-up',
      'Compound movements (Deadlifts, Squats)',
      'Pull-ups and chin-ups',
      'Advanced push-up variations',
      'Core strengthening circuit',
      'Cool down and stretching'
    ]
  },
  {
    id: 'cardio-2',
    name: 'High-Intensity Interval Training',
    category: 'cardio' as const,
    level: 'advanced' as const,
    duration: 35,
    calories: 400,
    steps: [
      'Dynamic warm-up',
      'Sprint intervals',
      'Mountain climbers',
      'Burpee variations',
      'Plyometric exercises',
      'Cool down and recovery'
    ]
  }
];

export const meditationSessions = [
  {
    id: 'med-1',
    name: 'Deep Breathing for Beginners',
    type: 'breathing' as const,
    duration: 10,
    description: 'Learn the basics of pranayama breathing techniques'
  },
  {
    id: 'med-2',
    name: 'Mindful Body Scan',
    type: 'mindfulness' as const,
    duration: 15,
    description: 'Progressive relaxation and body awareness'
  },
  {
    id: 'med-3',
    name: 'Stress Relief Meditation',
    type: 'stress-relief' as const,
    duration: 20,
    description: 'Release tension and find inner calm'
  },
  {
    id: 'med-4',
    name: '4-7-8 Breathing Technique',
    type: 'breathing' as const,
    duration: 8,
    description: 'Ancient yogic breathing for relaxation and sleep'
  }
];

export const motivationalQuotes = [
  "A healthy outside starts from the inside. - Robert Urich",
  "The greatest wealth is health. - Virgil",
  "Take care of your body. It's the only place you have to live. - Jim Rohn",
  "Health is not about the weight you lose, but about the life you gain.",
  "Your body can do it. It's your mind you have to convince.",
  "Every step you take is a step towards a healthier you.",
  "Consistency is the key to transformation.",
  "Yoga is not about touching your toes. It is about what you learn on the way down.",
  "Meditation is not about becoming a different person. It's about becoming aware of who you already are."
];

export const sampleNutritionPlan = {
  targetCalories: 1800,
  meals: {
    breakfast: [
      {
        id: 'b1',
        name: 'Poha',
        calories: 158,
        protein: 3,
        carbs: 32,
        fat: 1.5,
        quantity: 1,
        unit: 'bowl'
      },
      {
        id: 'b2',
        name: 'Green Tea',
        calories: 2,
        protein: 0,
        carbs: 0.5,
        fat: 0,
        quantity: 1,
        unit: 'cup'
      }
    ],
    lunch: [
      {
        id: 'l1',
        name: 'Basmati Rice',
        calories: 205,
        protein: 4.3,
        carbs: 45,
        fat: 0.4,
        quantity: 1,
        unit: 'cup'
      },
      {
        id: 'l2',
        name: 'Dal (Moong)',
        calories: 147,
        protein: 14,
        carbs: 19,
        fat: 0.6,
        quantity: 1,
        unit: 'bowl'
      },
      {
        id: 'l3',
        name: 'Mixed Vegetables',
        calories: 80,
        protein: 3,
        carbs: 18,
        fat: 0.5,
        quantity: 1,
        unit: 'bowl'
      }
    ],
    dinner: [
      {
        id: 'd1',
        name: 'Roti (2 pieces)',
        calories: 142,
        protein: 6,
        carbs: 30,
        fat: 0.8,
        quantity: 2,
        unit: 'pieces'
      },
      {
        id: 'd2',
        name: 'Paneer Curry',
        calories: 200,
        protein: 15,
        carbs: 8,
        fat: 12,
        quantity: 1,
        unit: 'bowl'
      }
    ],
    snacks: [
      {
        id: 's1',
        name: 'Mixed Nuts',
        calories: 160,
        protein: 6,
        carbs: 6,
        fat: 14,
        quantity: 30,
        unit: 'grams'
      }
    ]
  }
};