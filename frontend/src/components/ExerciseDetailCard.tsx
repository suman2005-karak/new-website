import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Play, Pause, CheckCircle2, Trophy, Clock, Flame, ChevronDown, ChevronUp } from 'lucide-react';

interface ExerciseDetailCardProps {
  exercise: {
    id: string;
    name: string;
    duration: number;
    calories: number;
    category: string;
    level: string;
    steps: string[];
  };
  onComplete: (actualMinutes: number, caloriesBurned: number) => void;
  onCancel: () => void;
}

export default function ExerciseDetailCard({
  exercise, 
  onComplete, 
  onCancel
}: ExerciseDetailCardProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!exercise) return null;

  const totalDuration = exercise.duration * 60;
  const caloriesPerSecond = exercise.calories / totalDuration;
  const currentCalories = Math.round(timeElapsed * caloriesPerSecond);
  const progress = Math.min((timeElapsed / totalDuration) * 100, 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= totalDuration) {
            setIsCompleted(true);
            setIsRunning(false);
            return totalDuration;
          }
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, isCompleted, totalDuration]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);
  const handleStop = () => {
    if (timeElapsed > 0) {
      const actualMinutes = Math.ceil(timeElapsed / 60);
      onComplete(actualMinutes, currentCalories);
    } else {
      onCancel();
    }
  };
  const handleMarkComplete = () => {
    const actualMinutes = Math.ceil(timeElapsed / 60);
    onComplete(actualMinutes, currentCalories);
  };

  return (
    <Card className="w-full max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto shadow-elevated px-2 py-2 sm:px-4 sm:py-4 rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl mb-2 break-words">{exercise.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="capitalize">{exercise.level}</Badge>
              <Badge variant="secondary" className="capitalize">{exercise.category}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleStop} className="h-8 w-8 min-w-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          {/* Timer & Stats */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="text-center py-4 sm:py-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg"
                >
                  <Trophy className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-3 text-yellow-500" />
                  <h3 className="text-xl sm:text-2xl font-bold text-primary mb-1">Workout Complete! 🎉</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">This workout is done! Do your best! 💪</p>
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4 sm:py-6 bg-muted/30 rounded-lg"
                >
                  <div className="text-4xl sm:text-6xl font-light font-mono mb-2 text-primary">
                    {formatTime(timeElapsed)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    Target: {exercise.duration}min ({formatTime(totalDuration)})
                  </p>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{progress.toFixed(0)}% Complete</p>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-none p-1">
                <CardContent className="p-1 text-center">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {currentCalories}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Calories Burned</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-none p-1">
                <CardContent className="p-1 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {Math.ceil(timeElapsed / 60)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Minutes Active</div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Steps */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 text-sm md:text-base"
              onClick={() => setShowSteps(!showSteps)}
            >
              <span className="font-semibold">Exercise Steps ({exercise.steps.length})</span>
              {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <AnimatePresence>
              {showSteps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 max-h-40 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2"
                >
                  {exercise.steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex gap-2 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 text-xs sm:text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 pt-2 w-full">
          <AnimatePresence mode="wait">
            {!isRunning && !isCompleted && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full md:flex-1"
              >
                <Button onClick={handleStart} size="lg" className="w-full">
                  <Play className="h-5 w-5 mr-2" /> Start Workout
                </Button>
              </motion.div>
            )}
            {isRunning && !isPaused && !isCompleted && (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 w-full"
              >
                <Button onClick={handlePause} size="lg" variant="secondary" className="w-1/2">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={handleStop} size="lg" variant="destructive" className="w-1/2">
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
                className="flex w-full gap-2"
              >
                <Button onClick={handleResume} size="lg" className="w-1/2">
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
                <Button onClick={handleStop} size="lg" variant="outline" className="w-1/2">
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
                transition={{ type: 'spring' }}
                className="w-full"
              >
                <Button
                  onClick={handleMarkComplete}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Mark as Complete
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Status Indicator */}
        <div className="text-center mt-3">
          {!isRunning && !isCompleted && (
            <p className="text-xs text-muted-foreground">Press Start to begin your workout</p>
          )}
          {isRunning && !isPaused && !isCompleted && (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-2 w-2 rounded-full bg-green-500"
              />
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Workout in progress...
              </p>
            </div>
          )}
          {isPaused && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Workout paused - Take a break if needed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
