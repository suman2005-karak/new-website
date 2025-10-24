import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, Activity, Flame, Heart, TrendingDown, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Progress() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/api/me`, {
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
      const res = await fetch(`${API_URL}/api/progress/${userId}/current`);
      const data = await res.json();
      
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
        <p className="text-muted-foreground">Monitor your wellness journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Weight Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {progress?.weight || 0} kg
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {parseFloat(progress?.weightChange || 0) < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{Math.abs(progress?.weightChange)} kg this month</span>
                </>
              ) : progress?.weightChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  <span className="text-orange-500">+{progress?.weightChange} kg this month</span>
                </>
              ) : (
                <span>No change</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BMI Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {progress?.bmi || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {progress?.bmi < 18.5 ? 'Underweight' :
               progress?.bmi < 25 ? 'Normal range' :
               progress?.bmi < 30 ? 'Overweight' : 'Obese'}
            </div>
          </CardContent>
        </Card>

        {/* Steps Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Daily Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {progress?.dailySteps?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              7-day average: {progress?.dailyStepsAverage?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        {/* Calories Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {progress?.caloriesBurned || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Daily average: {progress?.caloriesAverage || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section - You can add weight/BMI charts here */}
    </div>
  );
}
