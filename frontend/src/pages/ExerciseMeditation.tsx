import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, Flame, Users, Heart, Brain, Dumbbell } from 'lucide-react';
import { exerciseRoutines, meditationSessions } from '@/lib/data';
import ExerciseDetailCard from '@/components/ExerciseDetailCard';
import { useToast } from '@/hooks/use-toast';
import MeditationTimer from '@/components/MeditationTimer';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ExerciseMeditation() {
  const [activeTab, setActiveTab] = useState('exercise');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState({
    workoutsCompleted: 0,
    totalCaloriesBurned: 0,
    meditationMinutes: 0
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const { toast } = useToast();
  

  // ✅ FETCH USER FROM DATABASE ON MOUNT
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ✅ FETCH STATS WHEN USER IS LOADED
  useEffect(() => {
    if (userId) {
      fetchWeeklyStats();
    }
  }, [userId]);

  const fetchCurrentUser = async () => {
    setUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log("Token from localStorage:", token ? "Found" : "Not found");
      
      if (!token) {
        console.error("No token found - user not logged in");
        toast({
          title: "Please Login",
          description: "You need to login to access this page",
          variant: "destructive"
        });
        setUserLoading(false);
        return;
      }

      console.log("Fetching user from database...");
      const res = await fetch(`${API_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("User data:", data);
      
      if (data.success && data.user) {
        setUser(data.user);
        setUserId(data.user.id || data.user._id);
        console.log("✅ User loaded from DB:", data.user.email);
        console.log("✅ User ID:", data.user.id || data.user._id);
      } else {
        throw new Error(data.message || "Failed to load user");
      }
    } catch (err: any) {
      console.error("❌ Error fetching user:", err);
      toast({
        title: "Error",
        description: "Failed to load user data. Please login again.",
        variant: "destructive"
      });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    setStatsLoading(true);
    try {
      console.log("Fetching weekly stats for user:", userId);
      const res = await fetch(`${API_URL}/api/exercise/weekly-stats/${userId}`);
      const data = await res.json();
      
      console.log("Weekly stats response:", data);
      
      if (data.success) {
        setWeeklyStats(data.stats);
        console.log("Stats updated:", data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStartExercise = (exercise: any) => {
    setSelectedExercise(exercise);
  };

  const handleCompleteExercise = async (minutes: number, calories: number) => {
    if (!selectedExercise) return;

    if (!userId) {
      toast({
        title: "Error", 
        description: "Please login to save your workout",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log("=== COMPLETING EXERCISE ===");
      console.log("User ID:", userId);
      console.log("Exercise:", selectedExercise.name);
      console.log("Duration:", minutes, "minutes");  
      console.log("Calories:", calories);

      const requestData = {
        userId,
        exerciseName: selectedExercise.name,
        exerciseType: selectedExercise.category?.toLowerCase() || 'unknown',
        duration: minutes,
        caloriesBurned: calories
      };

      console.log("Request data:", requestData);

      const res = await fetch(`${API_URL}/api/exercise/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response:", data);
      
      if (data.success) {
        setSelectedExercise(null);
        await fetchWeeklyStats();
        
        toast({
          title: "Exercise Completed! 🎉",
          description: `You burned ${calories} calories in ${minutes} minutes!`,
        });
      } else {
        throw new Error(data.message || "Failed to save exercise");
      }
    } catch (err: any) {
      console.error("Error completing exercise:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to record exercise. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelExercise = () => {
    setSelectedExercise(null);
  };

  const renderExerciseCard = (exercise: any) => (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-card hover:shadow-elevated transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={
                  exercise.level === 'beginner' ? 'secondary' : 
                  exercise.level === 'intermediate' ? 'default' : 'destructive'
                }>
                  {exercise.level}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {exercise.category}
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              className="ml-4"
              onClick={() => handleStartExercise(exercise)}
              disabled={loading || userLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {exercise.duration} min
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              {exercise.calories} cal
            </div>
          </div>
          
          {exercise.steps && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Steps:</h4>
              <div className="space-y-1">
                {exercise.steps.slice(0, 3).map((step: string, index: number) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {index + 1}. {step}
                  </p>
                ))}
                {exercise.steps.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{exercise.steps.length - 3} more steps...
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMeditationCard = (session: any) => (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{session.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {session.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {session.type.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStartExercise({
                id: session.id,
                name: session.name,
                duration: session.duration,
                calories: 0,
                category: 'meditation',
                level: 'beginner',
                steps: [session.description]
              })}
              disabled={userLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Begin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {session.duration} min
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Mindfulness
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const availableLevels = [...new Set(exerciseRoutines.map(ex => ex.level))];
  const exercisesByLevel = availableLevels.reduce((acc, level) => {
    acc[level] = exerciseRoutines.filter(ex => ex.level === level);
    return acc;
  }, {} as Record<string, typeof exerciseRoutines>);

  // Show loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold animate-pulse">Loading...</div>
          <p className="text-muted-foreground mt-2">Fetching your data</p>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Please Login</h2>
          <p className="text-muted-foreground mt-2">You need to login to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelExercise();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <ExerciseDetailCard
                exercise={selectedExercise}
                onComplete={handleCompleteExercise}
                onCancel={handleCancelExercise}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'User'}!
            </h1>
            <p className="text-muted-foreground">Ready for your wellness journey today?</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold text-muted-foreground animate-pulse">...</div>
            ) : (
              <div className="text-2xl font-bold text-primary">{weeklyStats.workoutsCompleted}</div>
            )}
            <div className="text-xs text-muted-foreground">Workouts completed</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold text-muted-foreground animate-pulse">...</div>
            ) : (
              <div className="text-2xl font-bold text-primary">{weeklyStats.totalCaloriesBurned.toLocaleString()}</div>
            )}
            <div className="text-xs text-muted-foreground">This week</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Meditation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold text-muted-foreground animate-pulse">...</div>
            ) : (
              <div className="text-2xl font-bold text-primary">{weeklyStats.meditationMinutes}</div>
            )}
            <div className="text-xs text-muted-foreground">Minutes this week</div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercise">Exercise</TabsTrigger>
          <TabsTrigger value="meditation">Meditation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exercise" className="space-y-6">
          {Object.entries(exercisesByLevel).map(([level, exercises]) => (
            <div key={level} className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xl font-semibold capitalize flex items-center gap-2"
              >
                <Users className="h-5 w-5" />
                {level} Level
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map(renderExerciseCard)}
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="meditation" className="space-y-6">
  {/* Guided Sessions */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    <div className="flex items-center gap-2 mb-6">
      <Heart className="h-5 w-5" />
      <h2 className="text-xl font-semibold">Guided Sessions</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {meditationSessions.map(renderMeditationCard)}
    </div>
  </motion.div>

  {/* Functional Meditation Timer */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <MeditationTimer userId={userId} />
  </motion.div>
</TabsContent>

      </Tabs>
    </div>
  );
}
