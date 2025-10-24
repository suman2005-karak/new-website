// // import { motion } from 'framer-motion';
// // import { Badge } from '@/components/ui/badge';
// // import React, { useEffect, useState } from "react";
// // import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// // import { Progress } from "@/components/ui/progress";
// // import { Button } from "@/components/ui/button";

// // import { 
// //   Calendar, 
// //   Clock, 
// //   Target, 
// //   TrendingUp, 
// //   Apple, 
// //   Dumbbell, 
// //   Pill,
// //   Award,
// //   ChevronRight,
// //   Activity
// // } from 'lucide-react';
// // import { useAppStore } from '@/lib/store';
// // import { motivationalQuotes } from '@/lib/data';

// // type DashboardData = {
// //   steps: {
// //     current: number;
// //     target: number;
// //     connected: boolean;
// //   };
// //   calories: { consumed: number; target: number };
// //   water: { consumed: number; target: number };
// //   exercise: { completed: number; planned: number };
// //   medicine: { taken: number; total: number };
// // };

// // export default function Dashboard() {
// //   const { user } = useAppStore();
// //   const todayQuote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

// //   const [todayStats, setTodayStats] = useState<DashboardData>({
// //     steps: { current: 0, target: 10000, connected: false },
// //     calories: { consumed: 1200, target: 1800 },
// //     water: { consumed: 6, target: 8 },
// //     exercise: { completed: 1, planned: 2 },
// //     medicine: { taken: 2, total: 3 },
// //   });

// //   useEffect(() => {
// //     const token = new URLSearchParams(window.location.search).get("token");

// //     // Fetch user connection status
// //     fetch("http://localhost:4000/api/user/me", {
// //       headers: { Authorization: `Bearer ${token}` }
// //     })
// //       .then(res => res.json())
// //       .then(data => {
// //         setTodayStats((prev) => ({
// //           ...prev,
// //           steps: {
// //             ...prev.steps,
// //             connected: data.googleFitConnected || false
// //           }
// //         }));
// //       })
// //       .catch(console.error);
  
// //     // Fetch dashboard data including steps
// //     fetch("http://localhost:5000/dashboard", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         setTodayStats((prev) => ({
// //           ...prev,
// //           steps: {
// //             ...prev.steps,
// //             current: data.steps?.current || prev.steps.current
// //           }
// //         }));
// //       })
// //       .catch((err) => console.error("Error fetching dashboard:", err));
// //   }, []);

// //   const upcomingActivities = [
// //     { id: 1, type: 'exercise', name: 'Evening Yoga', time: '6:00 PM', icon: Dumbbell },
// //     { id: 2, type: 'medicine', name: 'Vitamin D', time: '8:00 PM', icon: Pill },
// //     { id: 3, type: 'meal', name: 'Dinner', time: '8:30 PM', icon: Apple },
// //   ];

// //   const weeklyProgress = [
// //     { label: 'Exercise', percentage: 85, color: 'bg-primary' },
// //     { label: 'Nutrition', percentage: 78, color: 'bg-success' },
// //     { label: 'Medicine', percentage: 92, color: 'bg-accent' },
// //   ];

// //   return (
// //     <div className="space-y-6">
// //       {/* Welcome Section */}
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.4 }}
// //         className="rounded-2xl bg-gradient-wellness p-6 text-white shadow-glow"
// //       >
// //         <h1 className="text-2xl font-bold mb-2">
// //           Welcome back, {user?.name}! 👋
// //         </h1>
// //         <p className="text-white/90 mb-4">{todayQuote}</p>
// //         <div className="flex items-center gap-4 text-sm">
// //           <div className="flex items-center gap-2">
// //             <Calendar className="h-4 w-4" />
// //             <span>{new Date().toLocaleDateString('en-IN', { 
// //               weekday: 'long', 
// //               year: 'numeric', 
// //               month: 'long', 
// //               day: 'numeric' 
// //             })}</span>
// //           </div>
// //           <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
// //             Goal: {user?.fitnessGoal || 'Maintain Weight'}
// //           </Badge>
// //         </div>
// //       </motion.div>

// //       {/* Today's Overview */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.1 }}
// //         >
// //           <Card className="shadow-card">
// //             <CardHeader className="pb-2">
// //               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// //                 <Apple className="h-4 w-4" />
// //                 Nutrition Today
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="text-2xl font-bold text-primary">
// //                 {todayStats.calories.consumed}
// //               </div>
// //               <div className="text-xs text-muted-foreground mb-2">
// //                 of {todayStats.calories.target} calories
// //               </div>
// //               <Progress 
// //                 value={(todayStats.calories.consumed / todayStats.calories.target) * 100} 
// //                 className="h-2"
// //               />
// //             </CardContent>
// //           </Card>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.2 }}
// //         >
// //           <Card className="shadow-card">
// //             <CardHeader className="pb-2">
// //               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// //                 <Activity className="h-4 w-4" />
// //                 Steps Today
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="text-2xl font-bold text-primary">
// //                 {todayStats.steps.current.toLocaleString()}
// //               </div>
// //               <div className="text-xs text-muted-foreground mb-2">
// //                 of {todayStats.steps.target.toLocaleString()} steps
// //               </div>
// //               <Progress 
// //                 value={(todayStats.steps.current / todayStats.steps.target) * 100} 
// //                 className="h-2"
// //               />

// //               {/* Connect Google Fit */}
// //               <div className="mt-3 text-center">
// //                 {todayStats.steps.connected ? (
// //                   <Button variant="outline" size="sm" disabled className="bg-green-50 text-green-700 border-green-200">
// //                     ✅ Connected with Google Fit
// //                   </Button>
// //                 ) : (
// //                   <>
// //                     <Button
// //                       variant="outline"
// //                       size="sm"
// //                       onClick={() => window.location.href = "http://localhost:4000/auth/google"}
// //                     >
// //                       Connect Google Fit
// //                     </Button>
// //                     <p className="text-xs text-muted-foreground mt-1">
// //                       Connect to sync your daily steps
// //                     </p>
// //                   </>
// //                 )}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.3 }}
// //         >
// //           <Card className="shadow-card">
// //             <CardHeader className="pb-2">
// //               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// //                 <Dumbbell className="h-4 w-4" />
// //                 Exercise
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="text-2xl font-bold text-primary">
// //                 {todayStats.exercise.completed}/{todayStats.exercise.planned}
// //               </div>
// //               <div className="text-xs text-muted-foreground mb-2">
// //                 sessions completed
// //               </div>
// //               <Progress 
// //                 value={(todayStats.exercise.completed / todayStats.exercise.planned) * 100} 
// //                 className="h-2"
// //               />
// //             </CardContent>
// //           </Card>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.4 }}
// //         >
// //           <Card className="shadow-card">
// //             <CardHeader className="pb-2">
// //               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// //                 <Pill className="h-4 w-4" />
// //                 Medicine
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="text-2xl font-bold text-primary">
// //                 {todayStats.medicine.taken}/{todayStats.medicine.total}
// //               </div>
// //               <div className="text-xs text-muted-foreground mb-2">
// //                 doses taken today
// //               </div>
// //               <Progress 
// //                 value={(todayStats.medicine.taken / todayStats.medicine.total) * 100} 
// //                 className="h-2"
// //               />
// //             </CardContent>
// //           </Card>
// //         </motion.div>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         {/* Upcoming Activities */}
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.5 }}
// //           className="lg:col-span-2"
// //         >
// //           <Card className="shadow-card">
// //             <CardHeader>
// //               <CardTitle className="flex items-center gap-2">
// //                 <Clock className="h-5 w-5" />
// //                 Upcoming Activities
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent className="space-y-4">
// //               {upcomingActivities.map((activity) => (
// //                 <div
// //                   key={activity.id}
// //                   className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
// //                 >
// //                   <div className="flex items-center gap-3">
// //                     <div className="p-2 rounded-full bg-primary/10">
// //                       <activity.icon className="h-4 w-4 text-primary" />
// //                     </div>
// //                     <div>
// //                       <p className="font-medium">{activity.name}</p>
// //                       <p className="text-sm text-muted-foreground">{activity.time}</p>
// //                     </div>
// //                   </div>
// //                   <ChevronRight className="h-4 w-4 text-muted-foreground" />
// //                 </div>
// //               ))}
// //             </CardContent>
// //           </Card>
// //         </motion.div>

// //         {/* Weekly Progress */}
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.6 }}
// //         >
// //           <Card className="shadow-card">
// //             <CardHeader>
// //               <CardTitle className="flex items-center gap-2">
// //                 <TrendingUp className="h-5 w-5" />
// //                 Week Progress
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent className="space-y-4">
// //               {weeklyProgress.map((item) => (
// //                 <div key={item.label} className="space-y-2">
// //                   <div className="flex justify-between items-center">
// //                     <span className="text-sm font-medium">{item.label}</span>
// //                     <span className="text-sm text-muted-foreground">{item.percentage}%</span>
// //                   </div>
// //                   <Progress value={item.percentage} className="h-2" />
// //                 </div>
// //               ))}
              
// //               <div className="pt-4 border-t">
// //                 <div className="flex items-center gap-2 text-success">
// //                   <Award className="h-4 w-4" />
// //                   <span className="text-sm font-medium">Great progress this week!</span>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </motion.div>
// //       </div>

// //       {/* Quick Actions */}
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.4, delay: 0.7 }}
// //       >
// //         <Card className="shadow-card">
// //           <CardHeader>
// //             <CardTitle>Quick Actions</CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //               <Button variant="outline" className="h-20 flex flex-col gap-2">
// //                 <Apple className="h-6 w-6" />
// //                 <span className="text-sm">Log Meal</span>
// //               </Button>
// //               <Button variant="outline" className="h-20 flex flex-col gap-2">
// //                 <Dumbbell className="h-6 w-6" />
// //                 <span className="text-sm">Start Workout</span>
// //               </Button>
// //               <Button variant="outline" className="h-20 flex flex-col gap-2">
// //                 <Pill className="h-6 w-6" />
// //                 <span className="text-sm">Take Medicine</span>
// //               </Button>
// //               <Button variant="outline" className="h-20 flex flex-col gap-2">
// //                 <Target className="h-6 w-6" />
// //                 <span className="text-sm">Update Goals</span>
// //               </Button>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </motion.div>
// //     </div>
// //   );
// // }   
// import { motion } from 'framer-motion';
// import { Badge } from '@/components/ui/badge';
// import React, { useEffect, useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from 'react-router-dom';

// import { 
//   Calendar, 
//   Clock, 
//   Target, 
//   TrendingUp, 
//   Apple, 
//   Dumbbell, 
//   Pill,
//   Award,
//   ChevronRight,
//   Activity,
//   Droplet,
//   Footprints
// } from 'lucide-react';
// import { useAppStore } from '@/lib/store';
// import { motivationalQuotes } from '@/lib/data';

// // ============================================
// // 📊 TYPE DEFINITIONS
// // ============================================

// type UpcomingActivity = {
//   type: string;
//   name: string;
//   time: string;
//   icon: React.ComponentType<{ className?: string }>;
// };

// type DashboardData = {
//   steps: {
//     current: number;
//     target: number;
//     connected: boolean;
//   };
//   nutrition: {
//     consumed: number;
//     target: number;
//     protein: number;
//     water: number;
//   };
//   exercise: {
//     completed: number;
//     planned: number;
//   };
//   medicine: {
//     taken: number;
//     total: number;
//   };
//   upcomingActivities: UpcomingActivity[];
//   weeklyProgress: {
//     exercise: number;
//     nutrition: number;
//     medicine: number;
//   };
// };

// export default function Dashboard() {
//   const { user } = useAppStore();
//   const navigate = useNavigate();
  
//   const todayQuoteRaw = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];
//   const quoteText = typeof todayQuoteRaw === 'string' 
//     ? todayQuoteRaw 
//     : `"${(todayQuoteRaw as any).quote}" - ${(todayQuoteRaw as any).author}`;

//   const [loading, setLoading] = useState(true);
//   const [todayStats, setTodayStats] = useState<DashboardData>({
//     steps: { current: 0, target: 10000, connected: false },
//     nutrition: { consumed: 0, target: 1800, protein: 0, water: 0 },
//     exercise: { completed: 0, planned: 5 },
//     medicine: { taken: 0, total: 0 },
//     upcomingActivities: [],
//     weeklyProgress: { exercise: 0, nutrition: 0, medicine: 0 }
//   });

//   // Generate upcoming activities
//   const generateUpcomingActivities = (nutritionPlan: any, medicines: any[]): UpcomingActivity[] => {
//     const activities: UpcomingActivity[] = [];
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();

//     if (nutritionPlan?.mealTimes) {
//       const meals = [
//         { type: 'meal', name: 'Breakfast', time: nutritionPlan.mealTimes.breakfast?.start || '07:00', icon: Apple },
//         { type: 'meal', name: 'Lunch', time: nutritionPlan.mealTimes.lunch?.start || '12:30', icon: Apple },
//         { type: 'meal', name: 'Snack', time: nutritionPlan.mealTimes.snacks?.start || '16:00', icon: Apple },
//         { type: 'meal', name: 'Dinner', time: nutritionPlan.mealTimes.dinner?.start || '19:00', icon: Apple }
//       ];

//       meals.forEach(meal => {
//         const [hours, minutes] = meal.time.split(':').map(Number);
//         const mealTime = hours * 60 + minutes;
//         if (mealTime > currentTime) activities.push(meal);
//       });
//     }

//     if (medicines && Array.isArray(medicines)) {
//       medicines.forEach((med: any) => {
//         if (med.times && Array.isArray(med.times)) {
//           med.times.forEach((scheduleTime: string) => {
//             const [hours, minutes] = scheduleTime.split(':').map(Number);
//             const medTime = hours * 60 + minutes;
//             if (medTime > currentTime) {
//               activities.push({ type: 'medicine', name: med.name, time: scheduleTime, icon: Pill });
//             }
//           });
//         }
//       });
//     }

//     if (activities.length === 0) {
//       activities.push({ type: 'exercise', name: 'Evening Yoga', time: '18:00', icon: Dumbbell });
//     }

//     return activities.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3);
//   };

//   // Fetch dashboard data
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const userId = user?.id || localStorage.getItem('userId') || '68e372583ce0de13566e23e4';
//         const today = new Date().toISOString().split('T')[0];

//         console.log('🔍 Fetching dashboard data for user:', userId);

//         let nutritionData: any = { plan: null };
//         let medicineData: any = { medicines: [] };
//         let exerciseData: any = { steps: 0, completed: 0, planned: 5 };
//         let progressData: any = { exercise: 0, nutrition: 0, medicine: 0 };
//         let googleFitConnected = false;

//         // ✅ FETCH GOOGLE FIT STATUS & STEPS (Your Original Backend)
//         try {
//           const token = new URLSearchParams(window.location.search).get("token");
          
//           const userRes = await fetch("http://localhost:4000/api/user/me", {
//             headers: token ? { Authorization: `Bearer ${token}` } : {}
//           });
          
//           if (userRes.ok) {
//             const userData = await userRes.json();
//             googleFitConnected = userData.googleFitConnected || false;
//             console.log('✅ Google Fit connected:', googleFitConnected);
            
//             if (googleFitConnected) {
//               const stepsRes = await fetch("http://localhost:4000/api/google-fit/steps", {
//                 headers: token ? { Authorization: `Bearer ${token}` } : {}
//               });
//               if (stepsRes.ok) {
//                 const stepsData = await stepsRes.json();
//                 exerciseData.steps = stepsData.steps || 0;
//                 console.log('✅ Steps:', stepsData.steps);
//               }
//             }
//           }
//         } catch (err) {
//           console.error('❌ Google Fit error:', err);
//         }

//         // ✅ FETCH NUTRITION
//         try {
//           const nutritionRes = await fetch(
//             `http://localhost:5000/api/nutrition/plan/${userId}/${today}`,
//             { credentials: 'include' }
//           );
//           if (nutritionRes.ok) {
//             nutritionData = await nutritionRes.json();
//             console.log('✅ Nutrition:', nutritionData);
//           }
//         } catch (err) {
//           console.error('❌ Nutrition error:', err);
//         }

//         // ✅ FETCH MEDICINE
//         try {
//           const medicineRes = await fetch(
//             `http://localhost:5000/api/medicines/${userId}`,
//             { credentials: 'include' }
//           );
//           if (medicineRes.ok) {
//             medicineData = await medicineRes.json();
//             console.log('✅ Medicine:', medicineData);
//           }
//         } catch (err) {
//           console.error('❌ Medicine error:', err);
//         }

//         // ✅ FETCH EXERCISE
//         try {
//           const exerciseRes = await fetch(
//             `http://localhost:5000/api/exercise/${userId}/today`,
//             { credentials: 'include' }
//           );
//           if (exerciseRes.ok) {
//             const exerciseRaw = await exerciseRes.json();
//             exerciseData.completed = exerciseRaw.completed || 0;
//             exerciseData.planned = exerciseRaw.planned || 5;
//             console.log('✅ Exercise:', exerciseData);
//           }
//         } catch (err) {
//           console.error('❌ Exercise error:', err);
//         }

//         // ✅ FETCH WEEKLY PROGRESS
//         try {
//           const progressRes = await fetch(
//             `http://localhost:5000/api/progress/${userId}/week`,
//             { credentials: 'include' }
//           );
//           if (progressRes.ok) {
//             progressData = await progressRes.json();
//             console.log('✅ Progress:', progressData);
//           }
//         } catch (err) {
//           console.error('❌ Progress error:', err);
//         }

//         const plan = nutritionData.plan || nutritionData;
        
//         setTodayStats({
//           steps: {
//             current: exerciseData.steps || 0,
//             target: 10000,
//             connected: googleFitConnected
//           },
//           nutrition: {
//             consumed: plan?.totalConsumedCalories || 0,
//             target: plan?.targetCalories || 1800,
//             protein: plan?.totalConsumedProtein || 0,
//             water: plan?.waterIntake || 0
//           },
//           exercise: {
//             completed: exerciseData.completed || 0,
//             planned: exerciseData.planned || 5
//           },
//           medicine: {
//             taken: medicineData?.medicines?.filter((m: any) => m.taken).length || 0,
//             total: medicineData?.medicines?.length || 0
//           },
//           upcomingActivities: generateUpcomingActivities(plan, medicineData?.medicines || []),
//           weeklyProgress: {
//             exercise: progressData?.exercise || 0,
//             nutrition: progressData?.nutrition || 0,
//             medicine: progressData?.medicine || 0
//           }
//         });

//         console.log('✅ Dashboard loaded');
//         setLoading(false);
//       } catch (error) {
//         console.error('❌ Fatal error:', error);
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//     const interval = setInterval(fetchDashboardData, 30000);
//     return () => clearInterval(interval);
//   }, [user]);

//   const handleQuickAction = (action: string) => {
//     const routes: { [key: string]: string } = {
//       meal: '/nutrition',
//       workout: '/exercise',
//       medicine: '/medicine',
//       goals: '/profile'
//     };
//     navigate(routes[action] || '/');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
//           <p className="text-lg font-medium">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       {/* Welcome Banner */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 p-6 text-white shadow-lg"
//       >
//         <h1 className="text-3xl font-bold mb-2">
//           Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name}! 👋
//         </h1>
//         <p className="text-white/90 mb-1 text-lg">Ready for your wellness journey today!</p>
//         <p className="text-sm text-white/80 italic mb-4">{quoteText}</p>
//         <div className="flex items-center gap-4 text-sm flex-wrap">
//           <div className="flex items-center gap-2">
//             <Calendar className="h-4 w-4" />
//             <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
//           </div>
//           <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
//             Goal: {user?.fitnessGoal === 'lose' ? 'Lose Weight' : user?.fitnessGoal === 'gain' ? 'Gain Muscle' : 'Maintain Weight'}
//           </Badge>
//         </div>
//       </motion.div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Nutrition Card */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/nutrition')}>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Apple className="h-4 w-4 text-orange-500" />
//                 Nutrition Today
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-primary">{todayStats.nutrition.consumed}</div>
//               <div className="text-xs text-muted-foreground mb-2">of {todayStats.nutrition.target} calories</div>
//               <Progress value={(todayStats.nutrition.consumed / todayStats.nutrition.target) * 100} className="h-2 mb-2" />
//               <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                 <Droplet className="h-3 w-3 text-blue-500" />
//                 <span>{todayStats.nutrition.water}/8 glasses</span>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Steps Card with Google Fit */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//           <Card className="hover:shadow-xl transition-all">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Footprints className="h-4 w-4 text-green-500" />
//                 Steps Today
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-primary">{todayStats.steps.current.toLocaleString()}</div>
//               <div className="text-xs text-muted-foreground mb-2">of {todayStats.steps.target.toLocaleString()} steps</div>
//               <Progress value={(todayStats.steps.current / todayStats.steps.target) * 100} className="h-2" />

//               {/* Connect Google Fit */}
//               <div className="mt-3 text-center">
//                 {todayStats.steps.connected ? (
//                   <Button variant="outline" size="sm" disabled className="bg-green-50 text-green-700 border-green-200">
//                     ✅ Connected with Google Fit
//                   </Button>
//                 ) : (
//                   <>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => window.location.href = "http://localhost:4000/auth/google"}
//                     >
//                       Connect Google Fit
//                     </Button>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       Connect to sync your daily steps
//                     </p>
//                   </>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Exercise Card */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//           <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/exercise')}>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Dumbbell className="h-4 w-4 text-purple-500" />
//                 Exercise
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-primary">{todayStats.exercise.completed}/{todayStats.exercise.planned}</div>
//               <div className="text-xs text-muted-foreground mb-2">sessions this week</div>
//               <Progress value={(todayStats.exercise.completed / todayStats.exercise.planned) * 100} className="h-2" />
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Medicine Card */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//           <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/medicines')}>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Pill className="h-4 w-4 text-red-500" />
//                 Medicine
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-primary">{todayStats.medicine.taken}/{todayStats.medicine.total}</div>
//               <div className="text-xs text-muted-foreground mb-2">doses taken today</div>
//               <Progress value={todayStats.medicine.total > 0 ? (todayStats.medicine.taken / todayStats.medicine.total) * 100 : 0} className="h-2" />
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Upcoming Activities */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
//           <Card className="shadow-lg">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Clock className="h-5 w-5" />
//                 Upcoming Activities
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {todayStats.upcomingActivities.map((activity, i) => {
//                 const Icon = activity.icon;
//                 return (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition cursor-pointer"
//                     onClick={() => handleQuickAction(activity.type === 'meal' ? 'meal' : activity.type)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 rounded-full bg-primary/10">
//                         <Icon className="h-4 w-4 text-primary" />
//                       </div>
//                       <div>
//                         <p className="font-medium">{activity.name}</p>
//                         <p className="text-sm text-muted-foreground">{activity.time}</p>
//                       </div>
//                     </div>
//                     <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                   </div>
//                 );
//               })}
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Weekly Progress */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
//           <Card className="shadow-lg">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5" />
//                 Week Progress
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <span className="text-sm font-medium">Exercise</span>
//                   <span className="text-sm text-muted-foreground">{todayStats.weeklyProgress.exercise}%</span>
//                 </div>
//                 <Progress value={todayStats.weeklyProgress.exercise} className="h-2" />
//               </div>
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <span className="text-sm font-medium">Nutrition</span>
//                   <span className="text-sm text-muted-foreground">{todayStats.weeklyProgress.nutrition}%</span>
//                 </div>
//                 <Progress value={todayStats.weeklyProgress.nutrition} className="h-2" />
//               </div>
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <span className="text-sm font-medium">Medicine</span>
//                   <span className="text-sm text-muted-foreground">{todayStats.weeklyProgress.medicine}%</span>
//                 </div>
//                 <Progress value={todayStats.weeklyProgress.medicine} className="h-2" />
//               </div>
//               <div className="pt-4 border-t">
//                 <div className="flex items-center gap-2 text-green-600">
//                   <Award className="h-4 w-4" />
//                   <span className="text-sm font-medium">
//                     {((todayStats.weeklyProgress.exercise + todayStats.weeklyProgress.nutrition + todayStats.weeklyProgress.medicine) / 3) > 70 
//                       ? 'Great progress!' : 'Keep going!'}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       {/* Quick Actions */}
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
//         <Card className="shadow-lg">
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {[
//                 { icon: Apple, label: 'Log Meal', action: 'meal', color: 'text-orange-500' },
//                 { icon: Dumbbell, label: 'Start Workout', action: 'workout', color: 'text-purple-500' },
//                 { icon: Pill, label: 'Take Medicine', action: 'medicine', color: 'text-red-500' },
//                 { icon: Target, label: 'Update Goals', action: 'goals', color: 'text-blue-500' }
//               ].map(({ icon: Icon, label, action, color }) => (
//                 <Button 
//                   key={action} 
//                   variant="outline" 
//                   className="h-24 flex-col gap-2 hover:bg-primary/10" 
//                   onClick={() => handleQuickAction(action)}
//                 >
//                   <Icon className={`h-6 w-6 ${color}`} />
//                   <span className="text-sm">{label}</span>
//                 </Button>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import BoltLoader from '@/components/BoltLoader';

import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Apple, 
  Dumbbell, 
  Pill,
  Award,
  ChevronRight,
  Activity,
  Droplet,
  Footprints
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { motivationalQuotes } from '@/lib/data';

// ============================================
// 📊 TYPE DEFINITIONS
// ============================================

type UpcomingActivity = {
  type: string;
  name: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
};

type DashboardData = {
  steps: {
    current: number;
    target: number;
    connected: boolean;
  };
  nutrition: {
    consumed: number;
    target: number;
    protein: number;
    water: number;
  };
  exercise: {
    completed: number;
    planned: number;
  };
  medicine: {
    taken: number;
    total: number;
  };
  upcomingActivities: UpcomingActivity[];
  weeklyProgress: {
    exercise: number;
    nutrition: number;
    medicine: number;
  };
};

export default function Dashboard() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  
  const todayQuoteRaw = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];
  const quoteText = typeof todayQuoteRaw === 'string' 
    ? todayQuoteRaw 
    : `"${(todayQuoteRaw as any).quote}" - ${(todayQuoteRaw as any).author}`;

  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<DashboardData>({
    steps: { current: 0, target: 10000, connected: false },
    nutrition: { consumed: 0, target: 1800, protein: 0, water: 0 },
    exercise: { completed: 0, planned: 5 },
    medicine: { taken: 0, total: 0 },
    upcomingActivities: [],
    weeklyProgress: { exercise: 0, nutrition: 0, medicine: 0 }
  });

  // Generate upcoming activities
 // ============================================
// 📅 GENERATE UPCOMING ACTIVITIES (COMPLETE)
// ============================================

const generateUpcomingActivities = (nutritionPlan: any, medicines: any[]): UpcomingActivity[] => {
  const activities: UpcomingActivity[] = [];
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // 🔍 DEBUG: Log current state
  console.log('\n📅 ═══════════════════════════════════════════');
  console.log('📅 GENERATING UPCOMING ACTIVITIES');
  console.log('⏰ Current time:', `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`, `(${currentTime} minutes)`);
  console.log('📅 ═══════════════════════════════════════════');

  // ============================================
  // 🍽️ PROCESS MEAL TIMES
  // ============================================
  
  if (nutritionPlan?.mealTimes) {
    console.log('🍽️ Processing meal times...');
    
    const meals = [
      { 
        type: 'meal', 
        name: 'Breakfast', 
        time: nutritionPlan.mealTimes.breakfast?.start || '07:00', 
        icon: Apple 
      },
      { 
        type: 'meal', 
        name: 'Lunch', 
        time: nutritionPlan.mealTimes.lunch?.start || '12:30', 
        icon: Apple 
      },
      { 
        type: 'meal', 
        name: 'Snack', 
        time: nutritionPlan.mealTimes.snacks?.start || '16:00', 
        icon: Apple 
      },
      { 
        type: 'meal', 
        name: 'Dinner', 
        time: nutritionPlan.mealTimes.dinner?.start || '19:00', 
        icon: Apple 
      }
    ];

    meals.forEach(meal => {
      const [hours, minutes] = meal.time.split(':').map(Number);
      const mealTime = hours * 60 + minutes;
      const isPast = mealTime <= currentTime;
      
      console.log(`   ${isPast ? '❌' : '✅'} ${meal.name} at ${meal.time} (${mealTime} min) - ${isPast ? 'PAST' : 'UPCOMING'}`);
      
      if (!isPast) {
        activities.push(meal);
      }
    });
    
    console.log(`✅ Added ${activities.length} meal activities`);
  } else {
    console.log('⚠️ No meal times found in nutrition plan');
  }

  // ============================================
  // 💊 PROCESS MEDICINE SCHEDULES
  // ============================================
  
  console.log('\n💊 Processing medicine schedules...');
  
  if (medicines && Array.isArray(medicines) && medicines.length > 0) {
    console.log(`💊 Found ${medicines.length} medicines`);
    
    let medicineCount = 0;
    
    medicines.forEach((med: any) => {
      console.log(`\n   📋 Medicine: ${med.name}`);
      console.log(`   📅 Frequency: ${med.frequency || 'daily'}`);
      console.log(`   🕐 Times: ${med.times ? JSON.stringify(med.times) : 'none'}`);
      
      if (!med.times || !Array.isArray(med.times)) {
        console.log(`   ⚠️ No valid times array for ${med.name}`);
        return;
      }

      med.times.forEach((scheduleTime: string) => {
        try {
          const [hours, minutes] = scheduleTime.split(':').map(Number);
          
          if (isNaN(hours) || isNaN(minutes)) {
            console.log(`   ⚠️ Invalid time format: ${scheduleTime}`);
            return;
          }
          
          const medTime = hours * 60 + minutes;
          const isPast = medTime <= currentTime;
          
          console.log(`      ${isPast ? '❌' : '✅'} ${scheduleTime} (${medTime} min) - ${isPast ? 'PAST' : 'UPCOMING'}`);
          
          if (!isPast) {
            activities.push({ 
              type: 'medicine', 
              name: med.name, 
              time: scheduleTime, 
              icon: Pill 
            });
            medicineCount++;
            console.log(`      ✅ Added to activities`);
          }
        } catch (error) {
          console.error(`   ❌ Error parsing time ${scheduleTime}:`, error);
        }
      });
    });
    
    console.log(`✅ Added ${medicineCount} medicine activities`);
  } else {
    console.log('⚠️ No medicines found or invalid medicines data');
    console.log('   Medicines type:', typeof medicines);
    console.log('   Medicines is array:', Array.isArray(medicines));
    console.log('   Medicines length:', medicines?.length || 0);
  }

  // ============================================
  // 🎯 FINALIZE & SORT
  // ============================================

  // Sort by time (earliest first)
  const sortedActivities = activities.sort((a, b) => a.time.localeCompare(b.time));
  
  // Take top 3
  const topActivities = sortedActivities.slice(0, 3);

  console.log('\n📊 ═══════════════════════════════════════════');
  console.log('📊 FINAL RESULTS');
  console.log('📊 ═══════════════════════════════════════════');
  console.log(`📋 Total activities found: ${sortedActivities.length}`);
  console.log(`🎯 Showing top 3:`, topActivities.map(a => `${a.name} (${a.time})`));
  console.log('📊 ═══════════════════════════════════════════\n');

  // If no activities, add default
  if (topActivities.length === 0) {
    console.log('⚠️ No upcoming activities, adding default');
    return [{
      type: 'exercise',
      name: 'Evening Yoga',
      time: '18:00',
      icon: Dumbbell
    }];
  }

  return topActivities;
};
;

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = user?.id || localStorage.getItem('userId') || '68e372583ce0de13566e23e4';
        const today = new Date().toISOString().split('T')[0];

        console.log('🔍 Fetching dashboard data for user:', userId);

        let nutritionData: any = { plan: null };
        let medicineData: any = { taken: 0, total: 0, medicines: [] };
        let exerciseData: any = { steps: 0, completed: 0, planned: 5 };
        let progressData: any = { exercise: 0, nutrition: 0, medicine: 0 };
        let googleFitConnected = false;

        // ✅ FETCH GOOGLE FIT STATUS & STEPS
        try {
          const token = new URLSearchParams(window.location.search).get("token");
          
          const userRes = await fetch("http://localhost:4000/api/user/me", {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
            googleFitConnected = userData.googleFitConnected || false;
            console.log('✅ Google Fit connected:', googleFitConnected);
            
            if (googleFitConnected) {
              const stepsRes = await fetch("http://localhost:4000/api/google-fit/steps", {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              if (stepsRes.ok) {
                const stepsData = await stepsRes.json();
                exerciseData.steps = stepsData.steps || 0;
                console.log('✅ Steps:', stepsData.steps);
              }
            }
          }
        } catch (err) {
          console.error('❌ Google Fit error:', err);
        }

        // ✅ FETCH NUTRITION
        try {
          const nutritionRes = await fetch(
            `http://localhost:5000/api/nutrition/plan/${userId}/${today}`,
            { credentials: 'include' }
          );
          if (nutritionRes.ok) {
            nutritionData = await nutritionRes.json();
            console.log('✅ Nutrition:', nutritionData);
          }
        } catch (err) {
          console.error('❌ Nutrition error:', err);
        }

        // ✅ FETCH MEDICINE (FIXED - Use today endpoint)
        try {
          const medicineRes = await fetch(
            `http://localhost:5000/api/medicines/${userId}/today`,
            { credentials: 'include' }
          );
          if (medicineRes.ok) {
            medicineData = await medicineRes.json();
            console.log('✅ Medicine:', medicineData);
          }
        } catch (err) {
          console.error('❌ Medicine error:', err);
        }

        // ✅ FETCH EXERCISE
        try {
          const exerciseRes = await fetch(
            `http://localhost:5000/api/exercise/${userId}/today`,
            { credentials: 'include' }
          );
          if (exerciseRes.ok) {
            const exerciseRaw = await exerciseRes.json();
            exerciseData.completed = exerciseRaw.completed || 0;
            exerciseData.planned = exerciseRaw.planned || 5;
            console.log('✅ Exercise:', exerciseData);
          }
        } catch (err) {
          console.error('❌ Exercise error:', err);
        }

        // ✅ FETCH WEEKLY PROGRESS
        try {
          const progressRes = await fetch(
            `http://localhost:5000/api/progress/${userId}/week`,
            { credentials: 'include' }
          );
          if (progressRes.ok) {
            progressData = await progressRes.json();
            console.log('✅ Progress:', progressData);
          }
        } catch (err) {
          console.error('❌ Progress error:', err);
        }

        const plan = nutritionData.plan || nutritionData;
        
        setTodayStats({
          steps: {
            current: exerciseData.steps || 0,
            target: 10000,
            connected: googleFitConnected
          },
          nutrition: {
            consumed: plan?.totalConsumedCalories || 0,
            target: plan?.targetCalories || 1800,
            protein: plan?.totalConsumedProtein || 0,
            water: plan?.waterIntake || 0
          },
          exercise: {
            completed: exerciseData.completed || 0,
            planned: exerciseData.planned || 5
          },
          medicine: {
            taken: medicineData?.taken || 0,
            total: medicineData?.total || 0
          },
          upcomingActivities: generateUpcomingActivities(plan, medicineData?.medicines || []),
          weeklyProgress: {
            exercise: progressData?.exercise || 0,
            nutrition: progressData?.nutrition || 0,
            medicine: progressData?.medicine || 0
          }
        });

        console.log('✅ Dashboard loaded');
        setLoading(false);
      } catch (error) {
        console.error('❌ Fatal error:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user]);

const handleQuickAction = (action: string) => {
  console.log('🔘 Quick action clicked:', action);
  
  const routes: { [key: string]: string } = {
    meal: '/nutrition',
    medicine: '/medicines',
    workout: '/exercise',
    exercise: '/exercise',
    goals: '/profile'
  };
  
  const route = routes[action] || '/';
  console.log('🔀 Navigating to:', route);
  
  navigate(route);
};


  // ============================================
  // ⚡ LOADING STATE WITH BOLT LOADER
  // ============================================

  // In loading state:
  // ============================================
  // ⚡ LOADING STATE WITH BOLT LOADER
  // ============================================

// In loading state:
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <BoltLoader />
        <p className="text-lg font-medium mt-8 text-foreground">Loading your dashboard...</p>
        <p className="text-sm text-muted-foreground mt-2">Preparing your wellness data</p>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 p-6 text-white shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name}! 👋
        </h1>
        <p className="text-white/90 mb-1 text-lg">Ready for your wellness journey today!</p>
        <p className="text-sm text-white/80 italic mb-4">{quoteText}</p>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
            Goal: {user?.fitnessGoal === 'lose' ? 'Lose Weight' : user?.fitnessGoal === 'gain' ? 'Gain Muscle' : 'Maintain Weight'}
          </Badge>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Nutrition Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/nutrition')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Apple className="h-4 w-4 text-orange-500" />
                Nutrition Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{todayStats.nutrition.consumed}</div>
              <div className="text-xs text-muted-foreground mb-2">of {todayStats.nutrition.target} calories</div>
              <Progress value={(todayStats.nutrition.consumed / todayStats.nutrition.target) * 100} className="h-2 mb-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Droplet className="h-3 w-3 text-blue-500" />
                <span>{todayStats.nutrition.water}/8 glasses</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steps Card with Google Fit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Footprints className="h-4 w-4 text-green-500" />
                Steps Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{todayStats.steps.current.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mb-2">of {todayStats.steps.target.toLocaleString()} steps</div>
              <Progress value={(todayStats.steps.current / todayStats.steps.target) * 100} className="h-2" />

              {/* Connect Google Fit */}
              <div className="mt-3 text-center">
                {todayStats.steps.connected ? (
                  <Button variant="outline" size="sm" disabled className="bg-green-50 text-green-700 border-green-200">
                    ✅ Connected with Google Fit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = "http://localhost:4000/auth/google"}
                    >
                      Connect Google Fit
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Connect to sync your daily steps
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercise Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/exercise')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-purple-500" />
                Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{todayStats.exercise.completed}/{todayStats.exercise.planned}</div>
              <div className="text-xs text-muted-foreground mb-2">sessions this week</div>
              <Progress value={(todayStats.exercise.completed / todayStats.exercise.planned) * 100} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Medicine Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/medicines')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill className="h-4 w-4 text-red-500" />
                Medicine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{todayStats.medicine.taken}/{todayStats.medicine.total}</div>
              <div className="text-xs text-muted-foreground mb-2">doses taken today</div>
              <Progress value={todayStats.medicine.total > 0 ? (todayStats.medicine.taken / todayStats.medicine.total) * 100 : 0} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Activities */}
       {/* Upcoming Activities */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Upcoming Activities
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {todayStats.upcomingActivities.length > 0 ? (
        todayStats.upcomingActivities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div
              key={`${activity.type}-${activity.time}-${i}`}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-all cursor-pointer group"
              onClick={() => {
                console.log('🔘 Activity clicked:', activity);
                handleQuickAction(activity.type);
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full transition-all ${
                  activity.type === 'meal' ? 'bg-orange-500/10 group-hover:bg-orange-500/20' :
                  activity.type === 'medicine' ? 'bg-red-500/10 group-hover:bg-red-500/20' :
                  'bg-purple-500/10 group-hover:bg-purple-500/20'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    activity.type === 'meal' ? 'text-orange-500' :
                    activity.type === 'medicine' ? 'text-red-500' :
                    'text-purple-500'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No upcoming activities</p>
          <p className="text-xs mt-1">All tasks for today are complete!</p>
        </div>
      )}
    </CardContent>
  </Card>
</motion.div>


        {/* Weekly Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Week Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Exercise</span>
                  <span className="text-sm text-muted-foreground">{todayStats.weeklyProgress.exercise}%</span>
                </div>
                <Progress value={todayStats.weeklyProgress.exercise} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Nutrition</span>
                  <span className="text-sm text-muted-foreground">{todayStats.weeklyProgress.nutrition}%</span>
                </div>
                <Progress value={todayStats.weeklyProgress.nutrition} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Medicine</span>
                  <span className="text-sm text-muted-foreground">{todayStats.weeklyProgress.medicine}%</span>
                </div>
                <Progress value={todayStats.weeklyProgress.medicine} className="h-2" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {((todayStats.weeklyProgress.exercise + todayStats.weeklyProgress.nutrition + todayStats.weeklyProgress.medicine) / 3) > 70 
                      ? 'Great progress!' : 'Keep going!'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Apple, label: 'Log Meal', action: 'meal', color: 'text-orange-500' },
                { icon: Dumbbell, label: 'Start Workout', action: 'workout', color: 'text-purple-500' },
                { icon: Pill, label: 'Take Medicine', action: 'medicine', color: 'text-red-500' },
                { icon: Target, label: 'Update Goals', action: 'goals', color: 'text-blue-500' }
              ].map(({ icon: Icon, label, action, color }) => (
                <Button 
                  key={action} 
                  variant="outline" 
                  className="h-24 flex-col gap-2 hover:bg-primary/10" 
                  onClick={() => handleQuickAction(action)}
                >
                  <Icon className={`h-6 w-6 ${color}`} />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
