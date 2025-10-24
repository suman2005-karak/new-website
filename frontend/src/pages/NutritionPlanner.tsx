import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Apple, Clock, Target, Utensils, CheckCircle, X, User, RefreshCw, Droplet } from 'lucide-react';
import { generatePersonalizedPlan } from '@/lib/nutritionPlanGenerator';
import { toast } from '@/hooks/use-toast';
import AddFoodDialog from '@/components/AddFoodDialog';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Meal time helper function
const getMealTimeInfo = (mealType: string) => {
  const times = {
    breakfast: { start: '07:00', end: '08:00', emoji: '🍳', name: 'Breakfast' },
    lunch: { start: '12:30', end: '13:30', emoji: '🍛', name: 'Lunch' },
    dinner: { start: '19:00', end: '20:00', emoji: '🍽️', name: 'Dinner' },
    snacks: { start: '16:00', end: '17:00', emoji: '🍎', name: 'Snack' }
  };
  return times[mealType as keyof typeof times] || { start: '', end: '', emoji: '', name: '' };
};

export default function NutritionPlanner() {
  const [activeTab, setActiveTab] = useState('today');
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [todaysPlan, setTodaysPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [waterIntake, setWaterIntake] = useState(0);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch plan when user is loaded
  useEffect(() => {
    if (userId) {
      fetchTodaysPlan();
    }
  }, [userId]);

  // ✅ Check for meal time notifications
  useEffect(() => {
    const checkMealTime = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const mealTimes = {
        breakfast: { start: '07:00', end: '08:00', name: 'Breakfast', emoji: '🍳' },
        lunch: { start: '12:30', end: '13:30', name: 'Lunch', emoji: '🍛' },
        dinner: { start: '19:00', end: '20:00', name: 'Dinner', emoji: '🍽️' },
        snacks: { start: '16:00', end: '17:00', name: 'Snack', emoji: '🍎' }
      };
      
      Object.entries(mealTimes).forEach(([type, time]) => {
        if (currentTime === time.start) {
          toast({
            title: `${time.name} Time! ${time.emoji}`,
            description: "You are ready to eat! Check your nutrition planner.",
            duration: 5000
          });
        }
      });
    };
    
    // Check every minute
    const interval = setInterval(checkMealTime, 60000);
    checkMealTime(); // Check immediately on mount
    
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setUserId(data.user.id || data.user._id);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const personalizedPlan = useMemo(() => {
    if (!user) return null;
    return generatePersonalizedPlan(user);
  }, [user]);

  const fetchTodaysPlan = async () => {
    if (!userId) return;

    try {
      console.log("📊 Fetching today's nutrition plan...");
      
      const res = await fetch(`${API_URL}/api/nutrition/plan/${userId}/${today}`);
      const data = await res.json();
      
      if (data.success && data.plan) {
        setTodaysPlan(data.plan);
        setWaterIntake(data.plan.waterIntake || 0);
        console.log("✅ Plan loaded:", data.plan);
      } else if (personalizedPlan) {
        console.log("📝 Creating new plan for today...");
        await createNewPlan();
      }
    } catch (err) {
      console.error("❌ Error fetching plan:", err);
    }
  };

  const createNewPlan = async () => {
    if (!personalizedPlan || !userId) return;
    
    try {
      const res = await fetch(`${API_URL}/api/nutrition/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: today,
          targetCalories: personalizedPlan.targetCalories,
          meals: personalizedPlan.meals
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setTodaysPlan(data.plan);
        toast({
          title: "Plan Created! 🎉",
          description: `Personalized nutrition plan for your ${user.fitnessGoal} goal.`
        });
      }
    } catch (err) {
      console.error("❌ Error creating plan:", err);
      toast({
        title: "Error",
        description: "Failed to create nutrition plan",
        variant: "destructive"
      });
    }
  };

  const generateNewPlan = async () => {
    if (!user || !personalizedPlan || !userId) return;
    
    try {
      const res = await fetch(`${API_URL}/api/nutrition/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: today,
          targetCalories: personalizedPlan.targetCalories,
          meals: personalizedPlan.meals
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setTodaysPlan(data.plan);
        toast({
          title: "New Plan Generated! 🔄",
          description: `Fresh plan created for your ${user.fitnessGoal} goal.`
        });
      }
    } catch (err) {
      console.error("❌ Error regenerating plan:", err);
    }
  };

  const handleAddFood = async (mealType: string, food: any) => {
    if (!todaysPlan || !userId) return;
    
    try {
      const updatedMeals = { ...todaysPlan.meals };
      updatedMeals[mealType] = [...updatedMeals[mealType], food];
      
      const res = await fetch(`${API_URL}/api/nutrition/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: today,
          targetCalories: todaysPlan.targetCalories,
          meals: updatedMeals
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setTodaysPlan(data.plan);
        toast({
          title: "Food Added ✅",
          description: `${food.name} added to ${mealType}`
        });
      }
    } catch (err) {
      console.error("❌ Error adding food:", err);
    }
  };

  const handleRemoveFood = async (mealType: string, foodId: string) => {
    if (!todaysPlan || !userId) return;
    
    try {
      const updatedMeals = { ...todaysPlan.meals };
      updatedMeals[mealType] = updatedMeals[mealType].filter((f: any) => f._id !== foodId);
      
      const res = await fetch(`${API_URL}/api/nutrition/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: today,
          targetCalories: todaysPlan.targetCalories,
          meals: updatedMeals
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setTodaysPlan(data.plan);
        toast({
          title: "Food Removed 🗑️",
          description: "Item has been removed from your meal plan."
        });
      }
    } catch (err) {
      console.error("❌ Error removing food:", err);
    }
  };

  const toggleMealConsumed = async (mealType: string, foodId: string) => {
    if (!todaysPlan || !userId) return;
    
    const food = todaysPlan.meals[mealType].find((f: any) => f._id === foodId);
    if (!food) return;
    
    const isConsumed = food.consumed;
    
    try {
      const res = await fetch(`${API_URL}/api/nutrition/consumed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: today,
          mealType,
          foodId,
          consumed: !isConsumed
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setTodaysPlan(data.plan);
        toast({
          title: !isConsumed ? "Meal Taken ✅" : "Meal Unmarked",
          description: !isConsumed ? `You consumed ${food.name} - ${food.calories} cal, ${food.protein}g protein added!` : `${food.name} marked as not consumed`
        });
      }
    } catch (err) {
      console.error("❌ Error toggling consumed:", err);
    }
  };

  const updateWaterIntake = async (glasses: number) => {
    if (!userId) return;
    
    try {
      const res = await fetch(`${API_URL}/api/nutrition/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: today,
          glasses
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setWaterIntake(glasses);
        toast({
          title: "Water Intake Updated 💧",
          description: `You've had ${glasses} glasses of water today`
        });
      }
    } catch (err) {
      console.error("❌ Error updating water:", err);
    }
  };

  const calculateTotalConsumed = () => {
    if (!todaysPlan) return 0;
    
    let total = 0;
    Object.entries(todaysPlan.meals).forEach(([_, meals]: [string, any]) => {
      meals.forEach((meal: any) => {
        if (meal.consumed) {
          total += meal.calories;
        }
      });
    });
    return total;
  };

  const calculateTotalProtein = () => {
    if (!todaysPlan) return 0;
    
    let total = 0;
    Object.entries(todaysPlan.meals).forEach(([_, meals]: [string, any]) => {
      meals.forEach((meal: any) => {
        if (meal.consumed) {
          total += meal.protein || 0;
        }
      });
    });
    return total;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse">Loading nutrition plan...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Complete Your Profile</h3>
              <p className="text-muted-foreground mb-4">
                Please log in or complete your profile to get personalized nutrition plans
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = todaysPlan || personalizedPlan;
  if (!currentPlan) return null;



  

  const totalConsumed = calculateTotalConsumed();
  const totalProtein = calculateTotalProtein();
  const progressPercentage = (totalConsumed / currentPlan.targetCalories) * 100;
  const waterPercentage = (waterIntake / 8) * 100;
  const proteinPercentage = (totalProtein / 120) * 100;

  // ✅ Updated renderMealSection with meal times and "Taken" button
  const renderMealSection = (mealType: string, meals: any[], icon: React.ReactNode) => {
    const timeInfo = getMealTimeInfo(mealType);
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check if current time is within meal time
    const isWithinMealTime = currentTimeStr >= timeInfo.start && currentTimeStr <= timeInfo.end;

    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 capitalize">
              {icon}
              {mealType}
              <Badge variant="outline" className="ml-2">
                {meals.length} items
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* ✅ MEAL TIME DISPLAY */}
              <Badge variant={isWithinMealTime ? "default" : "secondary"} className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeInfo.start} - {timeInfo.end}
              </Badge>
              {isWithinMealTime && (
                <Badge variant="default" className="bg-green-500 animate-pulse">
                  Ready to eat! {timeInfo.emoji}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {meals.map((meal: any) => (
            <div
              key={meal._id || meal.id}
              className={`p-4 rounded-lg border transition-all ${
                meal.consumed
                  ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
                  : 'bg-muted/50 hover:bg-muted/70 border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{meal.name}</h4>
                    {meal.consumed && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Taken
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {meal.quantity} {meal.unit} • {meal.calories} calories
                  </p>
                  {meal.consumed && meal.consumedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Consumed at {new Date(meal.consumedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div className="font-medium">{meal.calories} kcal</div>
                    <div className="text-muted-foreground text-xs">
                      P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g
                    </div>
                  </div>
                  {/* ✅ TAKEN BUTTON */}
                  {!meal.consumed ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => toggleMealConsumed(mealType, meal._id || meal.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Taken
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMealConsumed(mealType, meal._id || meal.id)}
                    >
                      Undo
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFood(mealType, meal._id || meal.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <AddFoodDialog 
            onAddFood={(food) => handleAddFood(mealType, food)}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Nutrition Planner</h1>
            <p className="text-muted-foreground">
              Personalized plan for {user.name} • Goal: {user.fitnessGoal} weight
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateNewPlan}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Plan
            </Button>
            <Button variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Update Goals
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Daily Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-muted-foreground">
                    {totalConsumed} / {currentPlan.targetCalories}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {currentPlan.targetCalories - totalConsumed} remaining
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Water</span>
                  <span className="text-sm text-muted-foreground">{waterIntake} / 8 glasses</span>
                </div>
                <Progress value={waterPercentage} className="h-3" />
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateWaterIntake(Math.max(0, waterIntake - 1))}
                    disabled={waterIntake === 0}
                  >
                    -
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateWaterIntake(Math.min(8, waterIntake + 1))}
                    disabled={waterIntake >= 8}
                  >
                    <Droplet className="h-4 w-4 mr-1" />
                    Add Glass
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">{totalProtein}g / 120g</span>
                </div>
                <Progress value={proteinPercentage} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {120 - totalProtein}g remaining
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Meals</TabsTrigger>
          <TabsTrigger value="planner">Meal Planner</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {renderMealSection('breakfast', currentPlan.meals.breakfast, <Apple className="h-5 w-5" />)}
            {renderMealSection('lunch', currentPlan.meals.lunch, <Utensils className="h-5 w-5" />)}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {renderMealSection('dinner', currentPlan.meals.dinner, <Clock className="h-5 w-5" />)}
            {renderMealSection('snacks', currentPlan.meals.snacks, <Apple className="h-5 w-5" />)}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="planner">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Meal Planning</h3>
                <p className="text-muted-foreground mb-4">
                  Plan your meals for the week based on your fitness goals
                </p>
                <Button>Start Planning</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nutrition History</h3>
                <p className="text-muted-foreground mb-4">
                  View your past nutrition data and trends
                </p>
                <Button variant="outline">View History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
