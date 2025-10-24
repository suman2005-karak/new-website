import { User, NutritionPlan, MealItem } from './store';
import { indianFoodDatabase } from './data';

export interface PersonalizedPlan {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
}

// Calculate BMR (Basal Metabolic Rate) using Harris-Benedict equation
function calculateBMR(user: User): number {
  if (user.gender === 'male') {
    return 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
  } else {
    return 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
  }
}

// Calculate daily calorie needs based on activity level and fitness goal
function calculateDailyCalories(user: User): number {
  const bmr = calculateBMR(user);
  const activityMultiplier = 1.4; // Assuming light activity level
  let maintenanceCalories = bmr * activityMultiplier;

  // Adjust based on fitness goal
  switch (user.fitnessGoal) {
    case 'lose':
      return Math.round(maintenanceCalories - 500); // 500 calorie deficit for 1lb/week loss
    case 'gain':
      return Math.round(maintenanceCalories + 300); // 300 calorie surplus for gradual gain
    case 'maintain':
    default:
      return Math.round(maintenanceCalories);
  }
}

// Calculate macro distribution
function calculateMacros(totalCalories: number, fitnessGoal: User['fitnessGoal']) {
  let proteinPercentage: number;
  let carbPercentage: number;
  let fatPercentage: number;

  switch (fitnessGoal) {
    case 'lose':
      proteinPercentage = 0.35; // Higher protein for muscle preservation
      carbPercentage = 0.35;
      fatPercentage = 0.30;
      break;
    case 'gain':
      proteinPercentage = 0.25;
      carbPercentage = 0.50; // Higher carbs for muscle building
      fatPercentage = 0.25;
      break;
    case 'maintain':
    default:
      proteinPercentage = 0.30;
      carbPercentage = 0.40;
      fatPercentage = 0.30;
      break;
  }

  return {
    protein: Math.round((totalCalories * proteinPercentage) / 4), // 4 calories per gram
    carbs: Math.round((totalCalories * carbPercentage) / 4),
    fat: Math.round((totalCalories * fatPercentage) / 9) // 9 calories per gram
  };
}

// Select foods for a specific meal based on calorie target and macro preferences
function selectMealFoods(
  calorieTarget: number, 
  macroRatios: { protein: number; carbs: number; fat: number },
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
  existingMeals: MealItem[] = []
): MealItem[] {
  const meals: MealItem[] = [...existingMeals];
  let currentCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  
  // Define meal preferences
  const mealPreferences: Record<string, string[]> = {
    breakfast: ['Poha', 'Idli', 'Dosa', 'Green Tea', 'Milk'],
    lunch: ['Basmati Rice', 'Dal', 'Roti', 'Mixed Vegetables', 'Paneer', 'Chole'],
    dinner: ['Roti', 'Dal', 'Paneer', 'Chicken', 'Mixed Vegetables'],
    snacks: ['Mixed Nuts', 'Fruits', 'Yogurt']
  };

  const preferredFoods = indianFoodDatabase.filter(food => 
    mealPreferences[mealType].some(pref => 
      food.name.toLowerCase().includes(pref.toLowerCase())
    )
  );

  // Add foods until we reach the calorie target (within 50 calories)
  while (currentCalories < calorieTarget - 50 && preferredFoods.length > 0) {
    const remainingCalories = calorieTarget - currentCalories;
    
    // Find a food that fits well within remaining calories
    const suitableFood = preferredFoods.find(food => 
      food.calories <= remainingCalories && 
      !meals.some(meal => meal.name === food.name)
    );

    if (suitableFood) {
      const quantity = Math.min(2, Math.ceil(remainingCalories / suitableFood.calories));
      const mealItem: MealItem = {
        id: `meal-${Date.now()}-${Math.random()}`,
        name: suitableFood.name,
        calories: suitableFood.calories * quantity,
        protein: suitableFood.protein * quantity,
        carbs: suitableFood.carbs * quantity,
        fat: suitableFood.fat * quantity,
        quantity,
        unit: getDefaultUnit(suitableFood.name)
      };
      
      meals.push(mealItem);
      currentCalories += mealItem.calories;
    } else {
      break;
    }
  }

  return meals;
}

// Get default unit for common foods
function getDefaultUnit(foodName: string): string {
  const name = foodName.toLowerCase();
  if (name.includes('roti') || name.includes('idli')) return 'pieces';
  if (name.includes('rice') || name.includes('dal') || name.includes('curry')) return 'bowl';
  if (name.includes('tea') || name.includes('milk')) return 'cup';
  if (name.includes('nuts')) return 'grams';
  return 'serving';
}

export function generatePersonalizedPlan(user: User): PersonalizedPlan {
  const targetCalories = calculateDailyCalories(user);
  const macros = calculateMacros(targetCalories, user.fitnessGoal);

  // Distribute calories across meals (breakfast: 25%, lunch: 35%, dinner: 30%, snacks: 10%)
  const calorieDistribution = {
    breakfast: Math.round(targetCalories * 0.25),
    lunch: Math.round(targetCalories * 0.35),
    dinner: Math.round(targetCalories * 0.30),
    snacks: Math.round(targetCalories * 0.10)
  };

  // Generate meals
  const meals = {
    breakfast: selectMealFoods(calorieDistribution.breakfast, macros, 'breakfast'),
    lunch: selectMealFoods(calorieDistribution.lunch, macros, 'lunch'),
    dinner: selectMealFoods(calorieDistribution.dinner, macros, 'dinner'),
    snacks: selectMealFoods(calorieDistribution.snacks, macros, 'snacks')
  };

  return {
    targetCalories,
    targetProtein: macros.protein,
    targetCarbs: macros.carbs,
    targetFat: macros.fat,
    meals
  };
}