
// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Heart } from 'lucide-react';
// import { useAppStore } from '@/lib/store';
// import { toast } from '@/hooks/use-toast';
// import { GoogleLogin } from "@react-oauth/google";

// export default function AuthPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('login');
//   const login = useAppStore((state) => state.login);

//   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

//   const [loginForm, setLoginForm] = useState({
//     email: '',
//     password: '',
//   });

//   const [signupForm, setSignupForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     age: '',
//     gender: '',
//     weight: '',
//     height: '',
//     fitnessGoal: '',
//   });

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(loginForm),
//       });
//       const data = await res.json();
      
//       if (!res.ok) throw new Error(data.message || 'Login failed');
      
//       // ✅ SAVE TOKEN TO LOCALSTORAGE
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//         console.log("✅ Token saved:", data.token);
//       }
      
//       // ✅ SAVE LOGIN NOTIFICATION
//       localStorage.setItem('lastLogin', JSON.stringify({
//         timestamp: new Date().toISOString(),
//         email: data.user.email,
//         method: 'email'
//       }));
//       console.log("✅ Login notification saved");
      
//       login(data.user);
//       toast({ title: 'Welcome back!', description: data.user.name });
//     } catch (err: any) {
//       toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
//     }
//     setIsLoading(false);
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(signupForm),
//       });
//       const data = await res.json();
      
//       if (!res.ok) throw new Error(data.message || 'Signup failed');
      
//       // ✅ SAVE TOKEN TO LOCALSTORAGE
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//         console.log("✅ Token saved:", data.token);
//       }
      
//       // ✅ SAVE LOGIN NOTIFICATION
//       localStorage.setItem('lastLogin', JSON.stringify({
//         timestamp: new Date().toISOString(),
//         email: data.user.email,
//         method: 'signup'
//       }));
//       console.log("✅ Signup notification saved");
      
//       login(data.user);
//       toast({ title: 'Account created!', description: data.user.name });
//     } catch (err: any) {
//       toast({ title: 'Signup failed', description: err.message, variant: 'destructive' });
//     }
//     setIsLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-md"
//       >
//         <div className="text-center mb-8">
//           <motion.div
//             initial={{ scale: 0.8 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
//             className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow"
//           >
//             <Heart className="w-8 h-8 text-primary-foreground" />
//           </motion.div>
//           <h1 className="text-3xl font-bold text-foreground">WellnessHub</h1>
//           <p className="text-muted-foreground mt-2">Your complete health companion</p>
//         </div>

//         <Card className="shadow-elevated border-0">
//           <CardHeader>
//             <CardTitle className="text-center">Get Started</CardTitle>
//             <CardDescription className="text-center">
//               Join thousands on their wellness journey
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Tabs value={activeTab} onValueChange={setActiveTab}>
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="login">Login</TabsTrigger>
//                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
//               </TabsList>

//               {/* LOGIN */}
//               <TabsContent value="login">
//                 <div className="flex justify-center mb-4">
//                   <GoogleLogin
//                     onSuccess={async (credentialResponse) => {
//                       const idToken = credentialResponse?.credential;
//                       if (!idToken) {
//                         toast({ 
//                           title: "Google login failed", 
//                           description: "No credential",
//                           variant: "destructive"
//                         });
//                         return;
//                       }
                      
//                       setIsLoading(true);
//                       try {
//                         console.log("🔑 Sending Google token to backend...");
                        
//                         const res = await fetch(`${API_URL}/api/auth/google`, {
//                           method: "POST",
//                           headers: { "Content-Type": "application/json" },
//                           body: JSON.stringify({ idToken }),
//                         });
                        
//                         const data = await res.json();
//                         console.log("📥 Response from backend:", data);
                        
//                         if (!res.ok) {
//                           toast({ 
//                             title: "Google login failed", 
//                             description: data.message || "Server error",
//                             variant: "destructive"
//                           });
//                           return;
//                         }
                        
//                         // ✅ SAVE TOKEN TO LOCALSTORAGE
//                         if (data.token) {
//                           localStorage.setItem('token', data.token);
//                           console.log("✅ Token saved to localStorage:", data.token);
//                         } else {
//                           console.error("❌ No token in response!");
//                         }
                        
//                         // ✅ SAVE LOGIN NOTIFICATION
//                         localStorage.setItem('lastLogin', JSON.stringify({
//                           timestamp: new Date().toISOString(),
//                           email: data.user.email,
//                           method: 'google'
//                         }));
//                         console.log("✅ Login notification saved");
                        
//                         // Save user to store
//                         login(data.user);
                        
//                         toast({ 
//                           title: "Welcome!", 
//                           description: data.user.name || data.user.email 
//                         });
//                       } catch (err) {
//                         console.error("❌ Google login error:", err);
//                         toast({ 
//                           title: "Google login error", 
//                           description: "Network/server issue",
//                           variant: "destructive"
//                         });
//                       } finally {
//                         setIsLoading(false);
//                       }
//                     }}
//                     onError={() => {
//                       toast({ 
//                         title: "Google login failed", 
//                         description: "Try again later",
//                         variant: "destructive"
//                       });
//                     }}
//                     theme="outline"
//                     size="large"
//                     shape="circle"
//                     text="signin_with"
//                   />
//                 </div>

//                 <div className="relative my-6">
//                   <div className="absolute inset-0 flex items-center">
//                     <span className="w-full border-t" />
//                   </div>
//                   <div className="relative flex justify-center text-xs uppercase">
//                     <span className="bg-background px-2 text-muted-foreground">
//                       Or continue with
//                     </span>
//                   </div>
//                 </div>

//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <div>
//                     <Label>Email</Label>
//                     <Input
//                       type="email"
//                       value={loginForm.email}
//                       onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label>Password</Label>
//                     <Input
//                       type="password"
//                       value={loginForm.password}
//                       onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? 'Signing in...' : 'Sign In'}
//                   </Button>
//                 </form>
//               </TabsContent>

//               {/* SIGNUP */}
//               <TabsContent value="signup">
//                 <form onSubmit={handleSignup} className="space-y-4">
//                   <div>
//                     <Label>Name</Label>
//                     <Input
//                       value={signupForm.name}
//                       onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label>Email</Label>
//                     <Input
//                       type="email"
//                       value={signupForm.email}
//                       onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label>Password</Label>
//                     <Input
//                       type="password"
//                       value={signupForm.password}
//                       onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label>Age</Label>
//                     <Input
//                       type="number"
//                       value={signupForm.age}
//                       onChange={(e) => setSignupForm({ ...signupForm, age: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <Label>Gender</Label>
//                     <Select onValueChange={(val) => setSignupForm({ ...signupForm, gender: val })}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select gender" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="male">Male</SelectItem>
//                         <SelectItem value="female">Female</SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <Label>Weight (kg)</Label>
//                     <Input
//                       type="number"
//                       value={signupForm.weight}
//                       onChange={(e) => setSignupForm({ ...signupForm, weight: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <Label>Height (cm)</Label>
//                     <Input
//                       type="number"
//                       value={signupForm.height}
//                       onChange={(e) => setSignupForm({ ...signupForm, height: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <Label>Fitness Goal</Label>
//                     <Select onValueChange={(val) => setSignupForm({ ...signupForm, fitnessGoal: val })}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select goal" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="lose">Lose Weight</SelectItem>
//                         <SelectItem value="gain">Gain Weight</SelectItem>
//                         <SelectItem value="maintain">Maintain</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? 'Creating Account...' : 'Create Account'}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { GoogleLogin } from "@react-oauth/google";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const login = useAppStore((state) => state.login);

  // ✅ UPDATED: Use correct environment variable name
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    fitnessGoal: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // ✅ SAVE TOKEN TO LOCALSTORAGE
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log("✅ Token saved:", data.token);
      }
      
      // ✅ SAVE LOGIN NOTIFICATION
      localStorage.setItem('lastLogin', JSON.stringify({
        timestamp: new Date().toISOString(),
        email: data.user.email,
        method: 'email'
      }));
      console.log("✅ Login notification saved");
      
      login(data.user);
      toast({ title: 'Welcome back!', description: data.user.name });
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      
      // ✅ SAVE TOKEN TO LOCALSTORAGE
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log("✅ Token saved:", data.token);
      }
      
      // ✅ SAVE LOGIN NOTIFICATION
      localStorage.setItem('lastLogin', JSON.stringify({
        timestamp: new Date().toISOString(),
        email: data.user.email,
        method: 'signup'
      }));
      console.log("✅ Signup notification saved");
      
      login(data.user);
      toast({ title: 'Account created!', description: data.user.name });
    } catch (err: any) {
      toast({ title: 'Signup failed', description: err.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow"
          >
            <Heart className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">WellnessHub</h1>
          <p className="text-muted-foreground mt-2">Your complete health companion</p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Join thousands on their wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <div className="flex justify-center mb-4">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      const idToken = credentialResponse?.credential;
                      if (!idToken) {
                        toast({ 
                          title: "Google login failed", 
                          description: "No credential",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      setIsLoading(true);
                      try {
                        console.log("🔑 Sending Google token to backend...");
                        
                        const res = await fetch(`${API_URL}/api/auth/google`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ idToken }),
                        });
                        
                        const data = await res.json();
                        console.log("📥 Response from backend:", data);
                        
                        if (!res.ok) {
                          toast({ 
                            title: "Google login failed", 
                            description: data.message || "Server error",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // ✅ SAVE TOKEN TO LOCALSTORAGE
                        if (data.token) {
                          localStorage.setItem('token', data.token);
                          console.log("✅ Token saved to localStorage:", data.token);
                        } else {
                          console.error("❌ No token in response!");
                        }
                        
                        // ✅ SAVE LOGIN NOTIFICATION
                        localStorage.setItem('lastLogin', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          email: data.user.email,
                          method: 'google'
                        }));
                        console.log("✅ Login notification saved");
                        
                        // Save user to store
                        login(data.user);
                        
                        toast({ 
                          title: "Welcome!", 
                          description: data.user.name || data.user.email 
                        });
                      } catch (err) {
                        console.error("❌ Google login error:", err);
                        toast({ 
                          title: "Google login error", 
                          description: "Network/server issue",
                          variant: "destructive"
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    onError={() => {
                      toast({ 
                        title: "Google login failed", 
                        description: "Try again later",
                        variant: "destructive"
                      });
                    }}
                    theme="outline"
                    size="large"
                    shape="circle"
                    text="signin_with"
                  />
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* SIGNUP */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={signupForm.age}
                      onChange={(e) => setSignupForm({ ...signupForm, age: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Select onValueChange={(val) => setSignupForm({ ...signupForm, gender: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={signupForm.weight}
                      onChange={(e) => setSignupForm({ ...signupForm, weight: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      value={signupForm.height}
                      onChange={(e) => setSignupForm({ ...signupForm, height: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Fitness Goal</Label>
                    <Select onValueChange={(val) => setSignupForm({ ...signupForm, fitnessGoal: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="gain">Gain Weight</SelectItem>
                        <SelectItem value="maintain">Maintain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


