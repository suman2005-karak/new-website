import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  fitnessGoal: 'lose' | 'gain' | 'maintain';
  avatar?: string;
  steps?: number;
  googleFitConnected: { type: Boolean, default: false },

}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  times: string[];
  duration: number;
  startDate: Date;
  taken: Record<string, boolean>;
}

export interface NutritionPlan {
  id: string;
  date: string;
  targetCalories: number;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
  consumed: Record<string, boolean>;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

interface Exercise {
  id: string;
  name: string;
  category: 'yoga' | 'strength' | 'cardio';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  steps?: string[];
  videoUrl?: string;
}

interface MeditationSession {
  id: string;
  name: string;
  type: 'breathing' | 'mindfulness' | 'stress-relief';
  duration: number;
  audioUrl?: string;
}

interface ProgressData {
  date: string;
  weight?: number;
  bmi?: number;
  steps?: number;
  caloriesConsumed?: number;
  caloriesBurned?: number;
  medicineAdherence?: number;
  exerciseMinutes?: number;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  medicines: Medicine[];
  nutritionPlans: NutritionPlan[];
  exercises: Exercise[];
  meditations: MeditationSession[];
  progressData: ProgressData[];
  
  // UI State
  currentView: string;
  sidebarCollapsed: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  markMedicineTaken: (medicineId: string, date: string, taken: boolean) => void;
  addNutritionPlan: (plan: Omit<NutritionPlan, 'id'>) => void;
  addFoodToMeal: (planId: string, mealType: keyof NutritionPlan['meals'], food: MealItem) => void;
  removeFoodFromMeal: (planId: string, mealId: string) => void;
  markMealConsumed: (planId: string, mealId: string, consumed: boolean) => void;
  addProgressData: (data: ProgressData) => void;
  setCurrentView: (view: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      medicines: [],
      nutritionPlans: [],
      exercises: [],
      meditations: [],
      progressData: [],
      currentView: 'dashboard',
      sidebarCollapsed: false,
      
      // Actions
      login: (user) => set({ user, isAuthenticated: true }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      addMedicine: (medicine) => set((state) => ({
        medicines: [...state.medicines, { 
          ...medicine, 
          id: crypto.randomUUID(),
          taken: {}
        }]
      })),
      
      updateMedicine: (id, updates) => set((state) => ({
        medicines: state.medicines.map(med => 
          med.id === id ? { ...med, ...updates } : med
        )
      })),
      
      deleteMedicine: (id) => set((state) => ({
        medicines: state.medicines.filter(med => med.id !== id)
      })),
      
      markMedicineTaken: (medicineId, date, taken) => set((state) => ({
        medicines: state.medicines.map(med => 
          med.id === medicineId 
            ? { 
                ...med, 
                taken: { ...med.taken, [date]: taken }
              }
            : med
        )
      })),
      
      addNutritionPlan: (plan) => set((state) => ({
        nutritionPlans: [...state.nutritionPlans, {
          ...plan,
          id: crypto.randomUUID(),
          consumed: {}
        }]
      })),

      addFoodToMeal: (planId, mealType, food) => set((state) => ({
        nutritionPlans: state.nutritionPlans.map(plan =>
          plan.id === planId
            ? {
                ...plan,
                meals: {
                  ...plan.meals,
                  [mealType]: [...plan.meals[mealType], food]
                }
              }
            : plan
        )
      })),

      removeFoodFromMeal: (planId, mealId) => set((state) => ({
        nutritionPlans: state.nutritionPlans.map(plan =>
          plan.id === planId
            ? {
                ...plan,
                meals: {
                  breakfast: plan.meals.breakfast.filter(meal => meal.id !== mealId),
                  lunch: plan.meals.lunch.filter(meal => meal.id !== mealId),
                  dinner: plan.meals.dinner.filter(meal => meal.id !== mealId),
                  snacks: plan.meals.snacks.filter(meal => meal.id !== mealId)
                }
              }
            : plan
        )
      })),
      
      markMealConsumed: (planId, mealId, consumed) => set((state) => ({
        nutritionPlans: state.nutritionPlans.map(plan =>
          plan.id === planId
            ? { 
                ...plan, 
                consumed: { ...plan.consumed, [mealId]: consumed }
              }
            : plan
        )
      })),
      
      addProgressData: (data) => set((state) => ({
        progressData: [...state.progressData.filter(p => p.date !== data.date), data]
      })),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
    }),
    {
      name: 'wellness-app-storage',
    }
  )
);