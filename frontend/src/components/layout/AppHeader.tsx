
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { toast } from '@/hooks/use-toast';
import NotificationPanel from '../NotificationPanel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function AppHeader() {
        const navigate = useNavigate();
  const { user: storeUser, logout } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user from database
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Check for upcoming medicine notifications
  useEffect(() => {
    if (userId) {
      checkNotifications();
      const interval = setInterval(checkNotifications, 60000); // Check every minute
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
    }
  };

  const checkNotifications = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/medicines/schedule/${userId}`);
      const data = await res.json();

      if (data.success) {
        const now = new Date();
        let count = 0;

        for (const log of data.schedule) {
          if (log.status === 'pending') {
            const [hours, minutes] = log.scheduledTime.split(':');
            const scheduledTime = new Date();
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const timeDiff = Math.floor((scheduledTime.getTime() - now.getTime()) / 60000);

            // Count medicines due in next 5 minutes
            if (timeDiff >= 0 && timeDiff <= 5) {
              count++;
            }
          }
        }

        // Add 1 for login notification if exists
        const loginNotif = localStorage.getItem('lastLogin');
        if (loginNotif) {
          const loginData = JSON.parse(loginNotif);
          const loginTime = new Date(loginData.timestamp);
          const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          // Show login notification for 24 hours
          if (hoursSinceLogin < 24) {
            count++;
          }
        }

        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Error checking notifications:", err);
    }
  };
         const handleSettingsClick = () => {
    navigate('/profile'); // Navigate to settings page
  };

  // ✅ NEW: Callback to update unread count from NotificationPanel
  const handleUnreadCountChange = (count: number) => {
    setUnreadCount(count);
  };

  const handleLogout = () => {
    // Clear login notification
    localStorage.removeItem('lastLogin');
    logout();
    toast({
      title: "Logged out successfully",
      description: "Take care and see you soon!",
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || storeUser?.name || 'User'}!
            </h2>
            <p className="text-sm text-muted-foreground">
              Ready for your wellness journey today?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || storeUser?.avatar} alt={user?.name || storeUser?.name} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {(user?.name || storeUser?.name)?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || storeUser?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || storeUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)}
        userId={userId}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </>
  );
}
