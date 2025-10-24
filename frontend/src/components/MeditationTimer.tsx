import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Play, Pause, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface MeditationTimerProps {
  userId: string | null;
}

export default function MeditationTimer({ userId }: MeditationTimerProps) {
  const [duration, setDuration] = useState(5); // in minutes
  const [customDuration, setCustomDuration] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning && !isPaused && !isCompleted && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsCompleted(true);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, isCompleted, timeRemaining]);

  const handleSetDuration = (mins: number) => {
    if (!isRunning) {
      setDuration(mins);
      setTimeRemaining(mins * 60);
      setIsCompleted(false);
    }
  };

  const handleCustomDuration = () => {
    const mins = parseInt(customDuration);
    if (mins > 0 && mins <= 120) {
      handleSetDuration(mins);
      setCustomDuration('');
    } else {
      toast({
        title: "Invalid Duration",
        description: "Please enter a value between 1-120 minutes",
        variant: "destructive"
      });
    }
  };

  const handleStart = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(duration * 60);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const elapsedSeconds = (duration * 60) - timeRemaining;
    const actualMinutes = Math.ceil(elapsedSeconds / 60);

    if (actualMinutes > 0) {
      await saveMeditation(actualMinutes);
    }
    
    resetTimer();
  };

  const handleComplete = async () => {
    await saveMeditation(duration);
    resetTimer();
  };

  const saveMeditation = async (minutes: number) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please login to save meditation",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/exercise/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          exerciseName: "Meditation Session",
          exerciseType: "meditation",
          duration: minutes,
          caloriesBurned: 0
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Meditation Saved! 🧘",
          description: `You meditated for ${minutes} minutes!`,
        });
      } else {
        throw new Error(data.message || "Failed to save");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save meditation",
        variant: "destructive"
      });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setTimeRemaining(duration * 60);
  };

  const progress = timeRemaining > 0 
    ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 
    : 0;

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Meditation Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          {/* Timer Display */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-4"
                >
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                  <h3 className="text-2xl font-bold text-primary">Session Complete! 🧘</h3>
                  <p className="text-sm text-muted-foreground">
                    You meditated for {duration} minutes
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-6xl font-light mb-4">
                    {formatTime(timeRemaining || duration * 60)}
                  </div>
                  {isRunning && (
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Duration Selector */}
          {!isRunning && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-sm">
                Set your own meditation duration
              </p>
              
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button
                  variant={duration === 5 ? "default" : "outline"}
                  onClick={() => handleSetDuration(5)}
                >
                  5 min
                </Button>
                <Button
                  variant={duration === 10 ? "default" : "outline"}
                  onClick={() => handleSetDuration(10)}
                >
                  10 min
                </Button>
                <Button
                  variant={duration === 15 ? "default" : "outline"}
                  onClick={() => handleSetDuration(15)}
                >
                  15 min
                </Button>
                <Button
                  variant={duration === 20 ? "default" : "outline"}
                  onClick={() => handleSetDuration(20)}
                >
                  20 min
                </Button>
              </div>

              {/* Custom Duration Input */}
              <div className="flex items-center gap-2 max-w-xs mx-auto">
                <Input
                  type="number"
                  placeholder="Custom (min)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomDuration()}
                  min="1"
                  max="120"
                  className="text-center"
                />
                <Button onClick={handleCustomDuration} variant="secondary">
                  Set
                </Button>
              </div>
            </motion.div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <AnimatePresence mode="wait">
              {!isRunning && !isCompleted && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button onClick={handleStart} size="lg" className="min-w-[200px]">
                    <Play className="h-5 w-5 mr-2" />
                    Start Timer
                  </Button>
                </motion.div>
              )}

              {isRunning && !isPaused && !isCompleted && (
                <motion.div
                  key="running"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <Button onClick={handlePause} size="lg" variant="secondary">
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={handleStop} size="lg" variant="destructive">
                    <X className="h-5 w-5 mr-2" />
                    Stop & Save
                  </Button>
                </motion.div>
              )}

              {isPaused && !isCompleted && (
                <motion.div
                  key="paused"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <Button onClick={handleResume} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Resume
                  </Button>
                  <Button onClick={handleStop} size="lg" variant="outline">
                    <X className="h-5 w-5 mr-2" />
                    Stop & Save
                  </Button>
                </motion.div>
              )}

              {isCompleted && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Save Session
                  </Button>
                  <Button onClick={resetTimer} size="lg" variant="outline">
                    New Session
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Indicator */}
          {isRunning && !isPaused && !isCompleted && (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-2 w-2 rounded-full bg-green-500"
              />
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Meditation in progress...
              </p>
            </div>
          )}
          {isPaused && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Meditation paused
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
