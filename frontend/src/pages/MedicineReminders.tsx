// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Plus, Clock, Pill, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
// import { useAppStore } from '@/lib/store';
// import { toast } from '@/hooks/use-toast';

// export default function MedicineReminders() {
//   const { medicines, addMedicine, markMedicineTaken } = useAppStore();
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [newMedicine, setNewMedicine] = useState({
//     name: '',
//     dosage: '',
//     frequency: 1,
//     times: [''],
//     duration: 7,
//     startDate: new Date(),
//   });

//   // Sample medicines if store is empty
//   const sampleMedicines = medicines.length === 0 ? [
//     {
//       id: '1',
//       name: 'Vitamin D3',
//       dosage: '1000 IU',
//       frequency: 1,
//       times: ['09:00'],
//       duration: 30,
//       startDate: new Date(),
//       taken: { [new Date().toDateString()]: false }
//     },
//     {
//       id: '2',
//       name: 'Omega-3',
//       dosage: '500mg',
//       frequency: 2,
//       times: ['08:00', '20:00'],
//       duration: 60,
//       startDate: new Date(),
//       taken: { [new Date().toDateString()]: true }
//     },
//     {
//       id: '3',
//       name: 'Multivitamin',
//       dosage: '1 tablet',
//       frequency: 1,
//       times: ['07:30'],
//       duration: 90,
//       startDate: new Date(),
//       taken: { [new Date().toDateString()]: false }
//     }
//   ] : medicines;

//   const handleAddMedicine = () => {
//     if (!newMedicine.name || !newMedicine.dosage) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields",
//         variant: "destructive"
//       });
//       return;
//     }

//     addMedicine({
//       ...newMedicine,
//       taken: {}
//     });
//     toast({
//       title: "Medicine Added",
//       description: `${newMedicine.name} has been added to your reminders`,
//     });
    
//     setNewMedicine({
//       name: '',
//       dosage: '',
//       frequency: 1,
//       times: [''],
//       duration: 7,
//       startDate: new Date(),
//     });
//     setIsAddDialogOpen(false);
//   };

//   const toggleMedicineTaken = (medicineId: string) => {
//     const today = new Date().toDateString();
//     const medicine = sampleMedicines.find(m => m.id === medicineId);
//     const currentStatus = medicine?.taken[today] || false;
    
//     markMedicineTaken(medicineId, today, !currentStatus);
    
//     toast({
//       title: currentStatus ? "Marked as Not Taken" : "Marked as Taken",
//       description: `${medicine?.name} updated for today`,
//     });
//   };

//   const todaysMedicines = sampleMedicines.filter(med => {
//     const today = new Date();
//     const startDate = new Date(med.startDate);
//     const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
//     return daysDiff >= 0 && daysDiff < med.duration;
//   });

//   const adherenceRate = todaysMedicines.length > 0 
//     ? (todaysMedicines.filter(med => med.taken[new Date().toDateString()]).length / todaysMedicines.length) * 100
//     : 0;

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold">Medicine Reminders</h1>
//             <p className="text-muted-foreground">Keep track of your medications</p>
//           </div>
//           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Medicine
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Add New Medicine</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="medicine-name">Medicine Name</Label>
//                     <Input
//                       id="medicine-name"
//                       placeholder="e.g., Vitamin D3"
//                       value={newMedicine.name}
//                       onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="dosage">Dosage</Label>
//                     <Input
//                       id="dosage"
//                       placeholder="e.g., 500mg"
//                       value={newMedicine.dosage}
//                       onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
//                     />
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Frequency (times per day)</Label>
//                     <Select 
//                       value={newMedicine.frequency.toString()} 
//                       onValueChange={(value) => setNewMedicine({ ...newMedicine, frequency: parseInt(value) })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="1">Once daily</SelectItem>
//                         <SelectItem value="2">Twice daily</SelectItem>
//                         <SelectItem value="3">Three times daily</SelectItem>
//                         <SelectItem value="4">Four times daily</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <Label htmlFor="duration">Duration (days)</Label>
//                     <Input
//                       id="duration"
//                       type="number"
//                       value={newMedicine.duration}
//                       onChange={(e) => setNewMedicine({ ...newMedicine, duration: parseInt(e.target.value) })}
//                     />
//                   </div>
//                 </div>
                
//                 <Button onClick={handleAddMedicine} className="w-full">
//                   Add Medicine
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>

//       {/* Today's Overview */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, delay: 0.1 }}
//         className="grid grid-cols-1 md:grid-cols-3 gap-6"
//       >
//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <Pill className="h-4 w-4" />
//               Today's Medicines
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">{todaysMedicines.length}</div>
//             <div className="text-xs text-muted-foreground">Scheduled for today</div>
//           </CardContent>
//         </Card>

//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <CheckCircle className="h-4 w-4" />
//               Adherence Rate
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">{Math.round(adherenceRate)}%</div>
//             <div className="text-xs text-muted-foreground">This week</div>
//           </CardContent>
//         </Card>

//         <Card className="shadow-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <AlertCircle className="h-4 w-4" />
//               Next Dose
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-primary">2:00 PM</div>
//             <div className="text-xs text-muted-foreground">Omega-3 500mg</div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Today's Schedule */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, delay: 0.2 }}
//       >
//         <Card className="shadow-elevated">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Calendar className="h-5 w-5" />
//               Today's Medicine Schedule
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {todaysMedicines.map((medicine) => (
//               <div
//                 key={medicine.id}
//                 className={`p-4 rounded-lg border transition-all ${
//                   medicine.taken[new Date().toDateString()]
//                     ? 'bg-success/10 border-success/50'
//                     : 'bg-muted/50 border-border'
//                 }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="p-2 rounded-full bg-primary/10">
//                         <Pill className="h-4 w-4 text-primary" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium">{medicine.name}</h3>
//                         <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-4">
//                       <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                         <Clock className="h-3 w-3" />
//                         {medicine.times.join(', ')}
//                       </div>
//                       <Badge variant={
//                         medicine.taken[new Date().toDateString()] ? 'default' : 'secondary'
//                       }>
//                         {medicine.taken[new Date().toDateString()] ? 'Taken' : 'Pending'}
//                       </Badge>
//                     </div>
//                   </div>
                  
//                   <Button
//                     variant={medicine.taken[new Date().toDateString()] ? 'outline' : 'default'}
//                     size="sm"
//                     onClick={() => toggleMedicineTaken(medicine.id)}
//                   >
//                     {medicine.taken[new Date().toDateString()] ? (
//                       <>
//                         <CheckCircle className="h-4 w-4 mr-2" />
//                         Taken
//                       </>
//                     ) : (
//                       <>
//                         <Clock className="h-4 w-4 mr-2" />
//                         Mark Taken
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             ))}
            
//             {todaysMedicines.length === 0 && (
//               <div className="text-center py-8">
//                 <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No medicines scheduled</h3>
//                 <p className="text-muted-foreground">
//                   Add your first medicine to start tracking
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, Pill, CheckCircle, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface MedicineLog {
  _id: string;
  medicineName: string;
  scheduledTime: string;
  scheduledDate: Date;
  status: string;
}

export default function MedicineReminders() {
  // User state
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Medicine states
  const [schedule, setSchedule] = useState<MedicineLog[]>([]);
  const [adherenceRate, setAdherenceRate] = useState(100);
  const [nextDose, setNextDose] = useState<any>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: 1,
    times: ['09:00'],
    duration: 7,
  });

  // ✅ FETCH USER FROM DATABASE ON MOUNT
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ✅ FETCH MEDICINE DATA WHEN USER IS LOADED
  useEffect(() => {
    if (userId) {
      fetchAllData();
      // Refresh data every minute for next dose updates
      const interval = setInterval(fetchAllData, 60000);
      return () => clearInterval(interval);
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

  const fetchAllData = async () => {
    await Promise.all([
      fetchSchedule(),
      fetchAdherence(),
      fetchNextDose()
    ]);
    setLoading(false);
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medicines/schedule/${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setSchedule(data.schedule);
        setTodayCount(data.schedule.length);
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
    }
  };

  const fetchAdherence = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medicines/adherence/${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setAdherenceRate(data.adherenceRate);
      }
    } catch (err) {
      console.error("Error fetching adherence:", err);
    }
  };

  const fetchNextDose = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medicines/next-dose/${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setNextDose(data.nextDose);
      }
    } catch (err) {
      console.error("Error fetching next dose:", err);
    }
  };

  const handleAddMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newMedicine.name,
          dosage: newMedicine.dosage,
          times: newMedicine.times,
          frequency: 'daily',
          endDate: new Date(Date.now() + newMedicine.duration * 24 * 60 * 60 * 1000)
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Medicine Added! 💊",
          description: `${newMedicine.name} has been added to your reminders`,
        });
        
        setNewMedicine({
          name: '',
          dosage: '',
          frequency: 1,
          times: ['09:00'],
          duration: 7,
        });
        setIsAddDialogOpen(false);
        
        // Refresh data
        fetchAllData();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive"
      });
    }
  };

  const handleMarkTaken = async (logId: string, medicineName: string) => {
    try {
      const res = await fetch(`${API_URL}/api/medicines/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });

      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Medicine Taken! ✅",
          description: `${medicineName} marked as taken`,
        });
        
        // Refresh data
        fetchAllData();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark medicine",
        variant: "destructive"
      });
    }
  };

  const updateMedicineTimes = (index: number, value: string) => {
    const newTimes = [...newMedicine.times];
    newTimes[index] = value;
    setNewMedicine({ ...newMedicine, times: newTimes });
  };

  const addTimeSlot = () => {
    setNewMedicine({ 
      ...newMedicine, 
      times: [...newMedicine.times, '09:00'],
      frequency: newMedicine.frequency + 1
    });
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = newMedicine.times.filter((_, i) => i !== index);
    setNewMedicine({ 
      ...newMedicine, 
      times: newTimes,
      frequency: Math.max(1, newMedicine.frequency - 1)
    });
  };

  // Show loading state while fetching user
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Medicine Reminders</h1>
            <p className="text-muted-foreground">Keep track of your medications</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine-name">Medicine Name*</Label>
                    <Input
                      id="medicine-name"
                      placeholder="e.g., Vitamin D3"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage*</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 500mg"
                      value={newMedicine.dosage}
                      onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Times per day</Label>
                  <div className="space-y-2">
                    {newMedicine.times.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateMedicineTimes(index, e.target.value)}
                          className="flex-1"
                        />
                        {newMedicine.times.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeTimeSlot(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="w-full"
                  >
                    + Add Time Slot
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    value={newMedicine.duration}
                    onChange={(e) => setNewMedicine({ ...newMedicine, duration: parseInt(e.target.value) || 7 })}
                  />
                </div>
                
                <Button onClick={handleAddMedicine} className="w-full">
                  Add Medicine
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Today's Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Today's Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground animate-pulse">...</div>
            ) : (
              <div className="text-2xl font-bold text-primary">{todayCount}</div>
            )}
            <div className="text-xs text-muted-foreground">Scheduled for today</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Adherence Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground animate-pulse">...</div>
            ) : (
              <div className="text-2xl font-bold text-primary">{adherenceRate}%</div>
            )}
            <div className="text-xs text-muted-foreground">This week</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Next Dose
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-muted-foreground animate-pulse">...</div>
            ) : nextDose ? (
              <>
                <div className="text-2xl font-bold text-primary">{nextDose.time}</div>
                <div className="text-xs text-muted-foreground">{nextDose.medicineName}</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">--:--</div>
                <div className="text-xs text-muted-foreground">No upcoming doses</div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Medicine Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : schedule.length > 0 ? (
              schedule.map((log) => (
                <div
                  key={log._id}
                  className={`p-4 rounded-lg border transition-all ${
                    log.status === 'taken'
                      ? 'bg-success/10 border-success/50'
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Pill className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{log.medicineName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {log.scheduledTime}
                            </div>
                            <Badge variant={log.status === 'taken' ? 'default' : 'secondary'}>
                              {log.status === 'taken' ? 'Taken' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {log.status !== 'taken' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkTaken(log._id, log.medicineName)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Mark Taken
                      </Button>
                    )}
                    
                    {log.status === 'taken' && (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Taken</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No medicines scheduled</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first medicine to start tracking
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
