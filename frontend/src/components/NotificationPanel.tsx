import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Pill, LogIn, Clock, X, CheckCircle, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { API_BASE_URL } from '@/lib/config';


interface Notification {
  id: string;
  type: 'login' | 'medicine' | 'medicine-due' | 'exercise-complete' | 'streak-achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  medicineName?: string;
  medicineTime?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationPanel({ 
  isOpen, 
  onClose, 
  userId,
  onUnreadCountChange
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
      checkUpcomingMedicines();
      
      const interval = setInterval(checkUpcomingMedicines, 60000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${userId}?limit=50`);
      const data = await res.json();
      
      if (data.success) {
        const dbNotifications = data.notifications.map((n: any) => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          read: n.read,
          ...n.metadata
        }));

        setNotifications(prev => {
          const medicineNotifs = prev.filter(n => n.type.includes('medicine'));
          return [...dbNotifications, ...medicineNotifs].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const checkUpcomingMedicines = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/medicines/schedule/${userId}`);
      const data = await res.json();

      if (data.success) {
        const now = new Date();
        const upcomingNotifications: Notification[] = [];

        for (const log of data.schedule) {
          if (log.status === 'pending') {
            const [hours, minutes] = log.scheduledTime.split(':');
            const scheduledTime = new Date();
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const timeDiff = Math.floor((scheduledTime.getTime() - now.getTime()) / 60000);

            if (timeDiff >= 0 && timeDiff <= 5) {
              const notifId = `medicine-due-${log._id}`;
              const exists = notifications.some(n => n.id === notifId);
              
              if (!exists) {
                upcomingNotifications.push({
                  id: notifId,
                  type: 'medicine-due',
                  title: 'Medicine Reminder',
                  message: `Time to take ${log.medicineName}`,
                  timestamp: new Date(),
                  read: false,
                  medicineName: log.medicineName,
                  medicineTime: log.scheduledTime
                });
              }
            }
          }
        }

        if (upcomingNotifications.length > 0) {
          setNotifications(prev => {
            const filtered = prev.filter(n => 
              !upcomingNotifications.some(un => un.id === n.id)
            );
            return [...upcomingNotifications, ...filtered].sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        }
      }
    } catch (err) {
      console.error("Error checking upcoming medicines:", err);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${userId}/mark-all-read`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const clearNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // ✅ FIXED: Clear all notifications
  const clearAll = async () => {
    try {
      // Clear each notification individually
      const deletePromises = notifications.map(notification => 
        fetch(`${API_BASE_URL}/api/notifications/${notification.id}`, {
          method: 'DELETE'
        })
      );
      
      await Promise.all(deletePromises);
      
      // ✅ UPDATE LOCAL STATE
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing all notifications:", err);
    }
  };

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    onUnreadCountChange(count);
  }, [notifications, onUnreadCountChange]);

  // ✅ FIXED: Added new notification types
  const getIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'medicine':
        return <Pill className="h-4 w-4 text-blue-500" />;
      case 'medicine-due':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'exercise-complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'streak-achievement':
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* ✅ BACKDROP OVERLAY - Click to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* ✅ NOTIFICATION PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-96 bg-background/80 backdrop-blur-3xl border-l border-border/30 shadow-2xl z-50"
        onClick={(e) => e.stopPropagation()} // ✅ Prevent closing when clicking inside
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border/30 bg-background/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <h2 className="text-base sm:text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="default" className="rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs flex-1 sm:flex-none"
                >
                  Mark all read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs flex-1 sm:flex-none"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            <div className="p-2 sm:p-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer bg-card/30 backdrop-blur-md ${
                        notif.read
                          ? 'border-border/30 hover:bg-card/50'
                          : 'border-primary/20 hover:bg-card/50 ring-1 ring-primary/20'
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-full bg-card/20 backdrop-blur-md border border-border/30">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-medium line-clamp-2">{notif.title}</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notif.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          {notif.medicineTime && (
                            <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-xs text-orange-600 dark:text-orange-400">
                              <Clock className="h-3 w-3" />
                              <span>At {notif.medicineTime}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!notif.read && (
                        <div className="flex justify-end mt-1.5 sm:mt-2">
                          <Badge variant="secondary" className="text-xs bg-primary/10 backdrop-blur-md border border-primary/20">
                            New
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
