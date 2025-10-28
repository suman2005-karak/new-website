
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { 
//   TrendingUp, 
//   TrendingDown,
//   Target, 
//   Award, 
//   Activity, 
//   Heart,
//   Scale,
//   Flame,
//   Footprints
// } from 'lucide-react';

// import { API_BASE_URL } from '@/lib/config';


// export default function ProgressTracker() {
//   const [user, setUser] = useState<any>(null);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [progress, setProgress] = useState<any>(null);
//   const [weightHistory, setWeightHistory] = useState<any[]>([]);
//   const [activityHistory, setActivityHistory] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch user on mount
//   useEffect(() => {
//     fetchCurrentUser();
//   }, []);
//   // Auto-refresh weight data every hour
// useEffect(() => {
//   if (userId) {
//     const interval = setInterval(() => {
//       console.log("🔄 Auto-refreshing weight data...");
//       fetchWeightHistory();
//     }, 60 * 60 * 1000); // 1 hour
    
//     return () => clearInterval(interval);
//   }
// }, [userId, user]);


//   // Fetch progress data when user is loaded
//   useEffect(() => {
//     if (userId) {
//       fetchProgress();
//       fetchWeightHistory();
//       fetchActivityHistory();
//     }
//   }, [userId]);
//   // Auto-refresh activity data every hour
// useEffect(() => {
//   if (userId) {
//     const interval = setInterval(() => {
//       console.log("🔄 Auto-refreshing activity data...");
//       fetchActivityHistory();
//     }, 60 * 60 * 1000); // 1 hour
    
//     return () => clearInterval(interval);
//   }
// }, [userId]);


//   const fetchCurrentUser = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       const res = await fetch(`${API_BASE_URL}/api/me`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const data = await res.json();
//       if (data.success && data.user) {
//         setUser(data.user);
//         setUserId(data.user.id || data.user._id);
//       }
//     } catch (err) {
//       console.error("Error fetching user:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProgress = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/progress/${userId}/current`);
//       const data = await res.json();
      
//       if (data.success) {
//         setProgress(data.progress);
//       }
//     } catch (err) {
//       console.error("Error fetching progress:", err);
//     }
//   };

//  const fetchWeightHistory = async () => {
//   if (!userId) {
//     console.log("❌ No userId");
//     return;
//   }

//   try {
//     console.log("📊 Fetching weight history...");
    
//     const res = await fetch(`${API_BASE_URL}/api/progress/${userId}/history?days=90`);
//     const data = await res.json();
    
//     console.log("📊 Raw weight data:", data);
    
//     if (data.success && data.history) {
//       // Group by date
//       const dateMap: { [key: string]: { weight: number; bmi: number } } = {};
      
//       data.history.forEach((entry: any) => {
//         const dateKey = new Date(entry.date).toISOString().split('T')[0]; // YYYY-MM-DD
//         dateMap[dateKey] = {
//           weight: entry.weight,
//           bmi: entry.bmi || 0
//         };
//       });

//       // ✅ Generate last 30 days up to TODAY
//       const today = new Date();
//       const N_DAYS = 30; // Show last 30 days
//       const days = [];
      
//       let lastKnownWeight = user?.weight || 0;
//       let lastKnownBMI = 0;
      
//       for (let i = N_DAYS - 1; i >= 0; i--) {
//         const d = new Date();
//         d.setDate(today.getDate() - i);
//         const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
//         const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Oct 15
        
//         // If we have data for this day, use it
//         if (dateMap[dateKey]) {
//           lastKnownWeight = dateMap[dateKey].weight;
//           lastKnownBMI = dateMap[dateKey].bmi;
//         }
        
//         // Use last known values for days without entries
//         days.push({
//           date: displayDate,
//           weight: lastKnownWeight,
//           bmi: lastKnownBMI
//         });
//       }
      
//       console.log("📊 Formatted weight chart (last 30 days including today):", days);
//       setWeightHistory(days);
//     } else {
//       console.log("❌ No weight history data");
//       // Still show last 30 days with user's current weight
//       const today = new Date();
//       const N_DAYS = 30;
//       const days = [];
//       const currentWeight = user?.weight || 0;
      
//       for (let i = N_DAYS - 1; i >= 0; i--) {
//         const d = new Date();
//         d.setDate(today.getDate() - i);
//         const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//         days.push({
//           date: displayDate,
//           weight: currentWeight,
//           bmi: 0
//         });
//       }
      
//       setWeightHistory(days);
//     }
//   } catch (err) {
//     console.error("❌ Error fetching weight history:", err);
//     setWeightHistory([]);
//   }
// };


// const fetchActivityHistory = async () => {
//   if (!userId) {
//     console.log("❌ No userId");
//     return;
//   }

//   try {
//     console.log("📊 Fetching activity history...");
    
//     const res = await fetch(`${API_BASE_URL}/api/exercise/history/${userId}?limit=30`);
//     const data = await res.json();
    
//     console.log("📊 Raw data:", data);
    
//     if (data.success && data.history) {
//       // Group by date and sum calories
//       const dateMap: { [key: string]: number } = {};
      
//       data.history.forEach((activity: any) => {
//         const dateKey = new Date(activity.completedAt).toISOString().split('T')[0]; // YYYY-MM-DD
//         dateMap[dateKey] = (dateMap[dateKey] || 0) + (activity.caloriesBurned || 0);
//       });

//       // ✅ Generate last 14 days up to TODAY
//       const today = new Date();
//       const N_DAYS = 14; // Show last 14 days
//       const days = [];
      
//       for (let i = N_DAYS - 1; i >= 0; i--) {
//         const d = new Date();
//         d.setDate(today.getDate() - i);
//         const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
//         const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Oct 15
        
//         days.push({
//           date: displayDate,
//           calories: dateMap[dateKey] || 0 // 0 if no activity
//         });
//       }
      
//       console.log("📊 Formatted for chart (last 14 days including today):", days);
//       setActivityHistory(days);
//     } else {
//       console.log("❌ No history data");
//       // Still show last 14 days with all zeros
//       const today = new Date();
//       const N_DAYS = 14;
//       const days = [];
      
//       for (let i = N_DAYS - 1; i >= 0; i--) {
//         const d = new Date();
//         d.setDate(today.getDate() - i);
//         const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//         days.push({
//           date: displayDate,
//           calories: 0
//         });
//       }
      
//       setActivityHistory(days);
//     }
//   } catch (err) {
//     console.error("❌ Error fetching activity:", err);
//     setActivityHistory([]);
//   }
// };



//   // Adherence data (calculated from progress)
//   const adherenceData = [
//     { name: 'Exercise', value: progress?.exerciseAdherence || 85, color: '#f97316' },
//     { name: 'Nutrition', value: 78, color: '#10b981' },
//     { name: 'Medicine', value: progress?.adherenceRate || 92, color: '#6366f1' },
//     { name: 'Sleep', value: 71, color: '#f59e0b' },
//   ];

//   const achievements = [
//     {
//       id: 1,
//       title: '7-Day Streak',
//       description: 'Completed workout routine for 7 consecutive days',
//       icon: Award,
//       color: 'text-primary',
//       unlocked: (progress?.workoutsCompleted || 0) >= 7,
//     },
//     {
//       id: 2,
//       title: 'Weight Goal',
//       description: 'Lost 2kg this month',
//       icon: Target,
//       color: 'text-success',
//       unlocked: parseFloat(progress?.weightChange || 0) <= -2,
//     },
//     {
//       id: 3,
//       title: '10K Steps',
//       description: 'Walked 10,000 steps in a single day',
//       icon: Footprints,
//       color: 'text-accent',
//       unlocked: (progress?.dailySteps || 0) >= 10000,
//     },
//     {
//       id: 4,
//       title: 'Medicine Adherence',
//       description: '90%+ medicine adherence',
//       icon: Heart,
//       color: 'text-muted-foreground',
//       unlocked: (progress?.adherenceRate || 0) >= 90,
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-2xl font-bold animate-pulse">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold">Progress Tracker</h1>
//             <p className="text-muted-foreground">Monitor your wellness journey</p>
//           </div>
//           <Button onClick={() => window.print()}>
//             <TrendingUp className="h-4 w-4 mr-2" />
//             View Detailed Report
//           </Button>
//         </div>
//       </motion.div>

//       {/* Key Metrics */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, delay: 0.1 }}
//         className="grid grid-cols-1 md:grid-cols-4 gap-6"
//       >
//         {/* Weight Card */}
//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <Scale className="h-4 w-4" />
//               Current Weight
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">{progress?.weight || user?.weight || 0} kg</div>
//             <div className="text-xs flex items-center gap-1 mt-1">
//               {parseFloat(progress?.weightChange || 0) < 0 ? (
//                 <>
//                   <TrendingDown className="h-3 w-3 text-green-500" />
//                   <span className="text-green-500">{Math.abs(progress?.weightChange)} kg this month</span>
//                 </>
//               ) : progress?.weightChange > 0 ? (
//                 <>
//                   <TrendingUp className="h-3 w-3 text-orange-500" />
//                   <span className="text-orange-500">+{progress?.weightChange} kg this month</span>
//                 </>
//               ) : (
//                 <span className="text-muted-foreground">No change</span>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* BMI Card */}
//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <Activity className="h-4 w-4" />
//               BMI
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">{progress?.bmi || 0}</div>
//             <div className="text-xs text-muted-foreground">
//               {progress?.bmi < 18.5 ? 'Underweight' :
//                progress?.bmi < 25 ? 'Normal range' :
//                progress?.bmi < 30 ? 'Overweight' : 'Obese'}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Steps Card */}
//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <Footprints className="h-4 w-4" />
//               Daily Steps
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">{progress?.dailySteps?.toLocaleString() || 0}</div>
//             <div className="text-xs text-muted-foreground">7-day average: {progress?.dailyStepsAverage?.toLocaleString() || 0}</div>
//           </CardContent>
//         </Card>

//         {/* Calories Card */}
//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <Flame className="h-4 w-4" />
//               Calories Burned
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">{progress?.caloriesBurned || 0}</div>
//             <div className="text-xs text-muted-foreground">Daily average: {progress?.caloriesAverage || 0}</div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       <Tabs defaultValue="weight" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="weight">Weight & BMI</TabsTrigger>
//           <TabsTrigger value="activity">Activity</TabsTrigger>
//           <TabsTrigger value="adherence">Adherence</TabsTrigger>
//           <TabsTrigger value="achievements">Achievements</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="weight">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             <Card className="shadow-elevated">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Scale className="h-5 w-5" />
//                   Weight & BMI Progress
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {weightHistory.length > 0 ? (
//                   <div className="h-80">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={weightHistory}>
//                         <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//                         <XAxis dataKey="date" />
//                         <YAxis />
//                         <Tooltip />
//                         <Line 
//                           type="monotone" 
//                           dataKey="weight" 
//                           stroke="hsl(var(--primary))" 
//                           strokeWidth={3}
//                           dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
//                         />
//                         <Line 
//                           type="monotone" 
//                           dataKey="bmi" 
//                           stroke="hsl(var(--success))" 
//                           strokeWidth={2}
//                           dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
//                         />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : (
//                   <div className="h-80 flex items-center justify-center text-muted-foreground">
//                     No weight data available yet
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </motion.div>
//         </TabsContent>
        
//         <TabsContent value="activity">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             <Card className="shadow-elevated">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Activity className="h-5 w-5" />
//                   Daily Activity
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {activityHistory.length > 0 ? (
//                   <div className="h-80">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={activityHistory}>
//                         <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//                         <XAxis dataKey="date" />
//                         <YAxis />
//                         <Tooltip formatter={(value, name) => [value, name === 'calories' ? 'Calories Burned' : name]} />
//                         <Area 
//                           type="monotone" 
//                           dataKey="calories" 
//                           stroke="hsl(var(--primary))" 
//                           fill="hsl(var(--primary))" 
//                           fillOpacity={0.3}
//                         />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : (
//                   <div className="h-80 flex items-center justify-center text-muted-foreground">
//                     No activity data available yet
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </motion.div>
//         </TabsContent>
        
//         <TabsContent value="adherence">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//             className="grid grid-cols-1 lg:grid-cols-2 gap-6"
//           >
//             <Card className="shadow-elevated">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Target className="h-5 w-5" />
//                   Weekly Adherence
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={adherenceData}
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={80}
//                         dataKey="value"
//                         label={({ name, value }) => `${name}: ${value}%`}
//                       >
//                         {adherenceData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="shadow-elevated">
//               <CardHeader>
//                 <CardTitle>Adherence Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {adherenceData.map((item) => (
//                   <div key={item.name} className="flex items-center justify-between">
//                     <span className="font-medium">{item.name}</span>
//                     <Badge 
//                       variant={item.value >= 80 ? 'default' : item.value >= 60 ? 'secondary' : 'destructive'}
//                     >
//                       {item.value}%
//                     </Badge>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </motion.div>
//         </TabsContent>
        
//         <TabsContent value="achievements">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             <Card className="shadow-elevated">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Award className="h-5 w-5" />
//                   Your Achievements
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {achievements.map((achievement) => (
//                     <div
//                       key={achievement.id}
//                       className={`p-6 rounded-lg border transition-all ${
//                         achievement.unlocked
//                           ? 'bg-primary/5 border-primary/20'
//                           : 'bg-muted/30 border-border opacity-60'
//                       }`}
//                     >
//                       <div className="flex items-start gap-4">
//                         <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
//                           <achievement.icon className={`h-6 w-6 ${achievement.unlocked ? achievement.color : 'text-muted-foreground'}`} />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="font-semibold mb-1">{achievement.title}</h3>
//                           <p className="text-sm text-muted-foreground">{achievement.description}</p>
//                           {achievement.unlocked && (
//                             <Badge className="mt-2" variant="default">
//                               Unlocked
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Award, 
  Activity, 
  Heart,
  Scale,
  Flame,
  Footprints
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

export default function ProgressTracker() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Auto-refresh weight data every hour
  useEffect(() => {
    if (userId) {
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing weight data...");
        fetchWeightHistory();
      }, 60 * 60 * 1000); // 1 hour
      
      return () => clearInterval(interval);
    }
  }, [userId, user]);

  // Fetch progress data when user is loaded
  useEffect(() => {
    if (userId) {
      fetchProgress();
      fetchWeightHistory();
      fetchActivityHistory();
    }
  }, [userId]);

  // Auto-refresh activity data every hour
  useEffect(() => {
    if (userId) {
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing activity data...");
        fetchActivityHistory();
      }, 60 * 60 * 1000); // 1 hour
      
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/me`, {
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

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/${userId}/current`);
      const data = await res.json();
      
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const fetchWeightHistory = async () => {
    if (!userId) {
      console.log("❌ No userId");
      return;
    }

    try {
      console.log("📊 Fetching weight history...");
      
      const res = await fetch(`${API_BASE_URL}/api/progress/${userId}/history?days=90`);
      const data = await res.json();
      
      console.log("📊 Raw weight data:", data);
      
      if (data.success && data.history) {
        // Group by date
        const dateMap: { [key: string]: { weight: number; bmi: number } } = {};
        
        data.history.forEach((entry: any) => {
          const dateKey = new Date(entry.date).toISOString().split('T')[0];
          dateMap[dateKey] = {
            weight: entry.weight,
            bmi: entry.bmi || 0
          };
        });

        // Generate last 30 days up to TODAY
        const today = new Date();
        const N_DAYS = 30;
        const days = [];
        
        let lastKnownWeight = user?.weight || 0;
        let lastKnownBMI = 0;
        
        for (let i = N_DAYS - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateKey = d.toISOString().split('T')[0];
          const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          if (dateMap[dateKey]) {
            lastKnownWeight = dateMap[dateKey].weight;
            lastKnownBMI = dateMap[dateKey].bmi;
          }
          
          days.push({
            date: displayDate,
            weight: lastKnownWeight,
            bmi: lastKnownBMI
          });
        }
        
        console.log("📊 Formatted weight chart:", days);
        setWeightHistory(days);
      } else {
        console.log("❌ No weight history data");
        const today = new Date();
        const N_DAYS = 30;
        const days = [];
        const currentWeight = user?.weight || 0;
        
        for (let i = N_DAYS - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          days.push({
            date: displayDate,
            weight: currentWeight,
            bmi: 0
          });
        }
        
        setWeightHistory(days);
      }
    } catch (err) {
      console.error("❌ Error fetching weight history:", err);
      setWeightHistory([]);
    }
  };

  const fetchActivityHistory = async () => {
    if (!userId) {
      console.log("❌ No userId");
      return;
    }

    try {
      console.log("📊 Fetching activity history...");
      
      const res = await fetch(`${API_BASE_URL}/api/exercise/history/${userId}?limit=30`);
      const data = await res.json();
      
      console.log("📊 Raw data:", data);
      
      if (data.success && data.history) {
        const dateMap: { [key: string]: number } = {};
        
        data.history.forEach((activity: any) => {
          const dateKey = new Date(activity.completedAt).toISOString().split('T')[0];
          dateMap[dateKey] = (dateMap[dateKey] || 0) + (activity.caloriesBurned || 0);
        });

        const today = new Date();
        const N_DAYS = 14;
        const days = [];
        
        for (let i = N_DAYS - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateKey = d.toISOString().split('T')[0];
          const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          days.push({
            date: displayDate,
            calories: dateMap[dateKey] || 0
          });
        }
        
        console.log("📊 Formatted for chart:", days);
        setActivityHistory(days);
      } else {
        console.log("❌ No history data");
        const today = new Date();
        const N_DAYS = 14;
        const days = [];
        
        for (let i = N_DAYS - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          days.push({
            date: displayDate,
            calories: 0
          });
        }
        
        setActivityHistory(days);
      }
    } catch (err) {
      console.error("❌ Error fetching activity:", err);
      setActivityHistory([]);
    }
  };

  const adherenceData = [
    { name: 'Exercise', value: progress?.exerciseAdherence || 85, color: '#f97316' },
    { name: 'Nutrition', value: 78, color: '#10b981' },
    { name: 'Medicine', value: progress?.adherenceRate || 92, color: '#6366f1' },
    { name: 'Sleep', value: 71, color: '#f59e0b' },
  ];

  const achievements = [
    {
      id: 1,
      title: '7-Day Streak',
      description: 'Completed workout routine for 7 consecutive days',
      icon: Award,
      color: 'text-primary',
      unlocked: (progress?.workoutsCompleted || 0) >= 7,
    },
    {
      id: 2,
      title: 'Weight Goal',
      description: 'Lost 2kg this month',
      icon: Target,
      color: 'text-success',
      unlocked: parseFloat(progress?.weightChange || 0) <= -2,
    },
    {
      id: 3,
      title: '10K Steps',
      description: 'Walked 10,000 steps in a single day',
      icon: Footprints,
      color: 'text-accent',
      unlocked: (progress?.dailySteps || 0) >= 10000,
    },
    {
      id: 4,
      title: 'Medicine Adherence',
      description: '90%+ medicine adherence',
      icon: Heart,
      color: 'text-muted-foreground',
      unlocked: (progress?.adherenceRate || 0) >= 90,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl sm:text-2xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Progress Tracker</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Monitor your wellness journey</p>
          </div>
          <Button onClick={() => window.print()} className="w-full sm:w-auto" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        {/* Weight Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Weight</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary truncate">
              {progress?.weight || user?.weight || 0} kg
            </div>
            <div className="text-xs flex items-center gap-1 mt-1">
              {parseFloat(progress?.weightChange || 0) < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="text-green-500 truncate">-{Math.abs(progress?.weightChange)} kg</span>
                </>
              ) : progress?.weightChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  <span className="text-orange-500 truncate">+{progress?.weightChange} kg</span>
                </>
              ) : (
                <span className="text-muted-foreground text-xs">No change</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BMI Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>BMI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">{progress?.bmi || 0}</div>
            <div className="text-xs text-muted-foreground truncate">
              {progress?.bmi < 18.5 ? 'Underweight' :
               progress?.bmi < 25 ? 'Normal' :
               progress?.bmi < 30 ? 'Overweight' : 'Obese'}
            </div>
          </CardContent>
        </Card>

        {/* Steps Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <Footprints className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary truncate">
              {progress?.dailySteps?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              Avg: {progress?.dailyStepsAverage?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        {/* Calories Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Calories</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">{progress?.caloriesBurned || 0}</div>
            <div className="text-xs text-muted-foreground truncate">
              Avg: {progress?.caloriesAverage || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="weight" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
          <TabsTrigger value="weight" className="text-xs sm:text-sm py-2">
            <Scale className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Weight & BMI</span>
            <span className="sm:hidden">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm py-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="adherence" className="text-xs sm:text-sm py-2">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Adherence</span>
            <span className="sm:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Awards</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Weight Tab */}
        <TabsContent value="weight">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="shadow-elevated">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                  Weight & BMI Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {weightHistory.length > 0 ? (
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 1, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="bmi" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--success))', strokeWidth: 1, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
                    No weight data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="shadow-elevated">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  Daily Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {activityHistory.length > 0 ? (
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value, name) => [value, name === 'calories' ? 'Calories' : name]}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
                    No activity data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Adherence Tab */}
        <TabsContent value="adherence">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            <Card className="shadow-elevated">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Weekly Adherence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={adherenceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelStyle={{ fontSize: '11px' }}
                      >
                        {adherenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Adherence Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                {adherenceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="font-medium text-sm sm:text-base">{item.name}</span>
                    <Badge 
                      variant={item.value >= 80 ? 'default' : item.value >= 60 ? 'secondary' : 'destructive'}
                      className="text-xs sm:text-sm"
                    >
                      {item.value}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="shadow-elevated">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 sm:p-6 rounded-lg border transition-all ${
                        achievement.unlocked
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/30 border-border opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                          <achievement.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${achievement.unlocked ? achievement.color : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base mb-1">{achievement.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.unlocked && (
                            <Badge className="mt-2 text-xs" variant="default">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
