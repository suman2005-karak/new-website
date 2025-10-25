import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Target, 
  Bell, 
  Shield, 
  Moon, 
  Sun,
  Camera,
  Save,
  LogOut,
  Upload,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/config';


export default function ProfileSettings() {
  const { user, updateUser, logout } = useAppStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || 30,
    gender: user?.gender || 'male',
    weight: user?.weight || 70,
    height: user?.height || 170,
    fitnessGoal: user?.fitnessGoal || 'maintain',
  });

  const [notifications, setNotifications] = useState({
    medicineReminders: true,
    workoutReminders: true,
    mealReminders: false,
    progressUpdates: true,
  });

  // ============================================
  // 📸 PHOTO UPLOAD HANDLER
  // ============================================

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📸 File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result?.toString();
          if (!base64) {
            throw new Error('Failed to read file');
          }

          console.log('📸 Base64 created, length:', base64.length);

          // Get user ID
          const userId = user?.id || localStorage.getItem('userId');
          if (!userId) {
            throw new Error('No user ID found');
          }

          console.log('📸 Uploading to:', `${API_BASE_URL}/api/user/${userId}/avatar`);

          // Upload to backend
          const response = await fetch(`${API_BASE_URL}/api/user/${userId}/avatar`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ avatar: base64 }),
          });

          console.log('📸 Response status:', response.status);

          const data = await response.json();
          console.log('📸 Response data:', data);

          if (data.success) {
            console.log('✅ Upload successful!');
            
            // Update user in store
            updateUser({ ...user, avatar: data.avatar });
            
            toast({
              title: "Photo updated! 📸",
              description: "Your profile photo has been updated successfully.",
            });
          } else {
            throw new Error(data.message || 'Upload failed');
          }
        } catch (error: any) {
          console.error('❌ Upload error:', error);
          toast({
            title: "Upload failed",
            description: error.message || "Failed to upload photo. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingPhoto(false);
        }
      };

      reader.onerror = () => {
        console.error('❌ FileReader error');
        toast({
          title: "Error reading file",
          description: "Failed to read the image file.",
          variant: "destructive",
        });
        setIsUploadingPhoto(false);
      };

      console.log('📸 Starting to read file...');
      reader.readAsDataURL(file);

    } catch (error: any) {
      console.error('❌ Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsUploadingPhoto(false);
    }
  };

  // ============================================
  // 💾 SAVE PROFILE HANDLER
  // ============================================

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    
    try {
     const response = await fetch(`${API_BASE_URL}/api/user/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (data.success) {
        updateUser({ ...user, ...profileForm });
        setIsEditing(false);
        
        toast({
          title: "Profile updated ✅",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('❌ Save profile error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ============================================
  // 🚪 LOGOUT HANDLER
  // ============================================

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // ============================================
  // 📊 BMI CALCULATION
  // ============================================

  const bmi = profileForm.height > 0 
    ? (profileForm.weight / ((profileForm.height / 100) ** 2)).toFixed(1) 
    : "0";
    
  const getBMICategory = (bmiString: string) => {
    const bmi = parseFloat(bmiString);
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="health">Health Goals</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* ==================== PROFILE TAB ==================== */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      'Edit Profile'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture with Click-to-View */}
                <div className="flex items-center gap-6">
                  {/* Clickable Avatar */}
                  <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
                    <DialogTrigger asChild>
                      <div className="relative cursor-pointer group">
                        <Avatar className="h-24 w-24 border-4 border-primary/20 transition-transform group-hover:scale-105">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Hover Overlay */}
                        {user?.avatar && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">🔍 View</span>
                          </div>
                        )}
                        
                        {/* Loading Spinner */}
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    </DialogTrigger>
                    
                    {/* Full-Size Image Modal */}
                    <DialogContent className="max-w-2xl p-0">
                      <div className="flex flex-col items-center gap-4 p-6">
                        <h3 className="text-xl font-semibold">Profile Picture</h3>
                        <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-6xl">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-lg">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* User Info and Change Photo Button */}
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click avatar to view full size. Max size: 5MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={profileForm.gender}
                      onValueChange={(value) => setProfileForm({ ...profileForm, gender: value as any })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm({ ...profileForm, weight: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* BMI Display */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">Body Mass Index (BMI)</p>
                      <p className="text-sm text-muted-foreground">Calculated from your height and weight</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{bmi}</div>
                      <div className={`text-sm font-medium ${getBMICategory(bmi).color}`}>
                        {getBMICategory(bmi).category}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==================== HEALTH GOALS TAB ==================== */}
        <TabsContent value="health">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Health & Fitness Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Primary Fitness Goal</Label>
                  <Select
                    value={profileForm.fitnessGoal}
                    onValueChange={(value) => setProfileForm({ ...profileForm, fitnessGoal: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Weight (kg)</Label>
                    <Input type="number" placeholder="70" />
                  </div>

                  <div className="space-y-2">
                    <Label>Weekly Goal</Label>
                    <Input placeholder="Lose 0.5 kg per week" />
                  </div>

                  <div className="space-y-2">
                    <Label>Daily Calorie Target</Label>
                    <Input type="number" placeholder="1800" />
                  </div>

                  <div className="space-y-2">
                    <Label>Exercise Days per Week</Label>
                    <Input type="number" placeholder="5" />
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Update Health Goals
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==================== NOTIFICATIONS TAB ==================== */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==================== PREFERENCES TAB ==================== */}
        <TabsContent value="preferences">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Export</p>
                    <p className="text-sm text-muted-foreground">
                      Export your wellness data
                    </p>
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-destructive">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
