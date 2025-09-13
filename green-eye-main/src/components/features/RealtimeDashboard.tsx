import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Thermometer, 
  Droplet, 
  Zap, 
  Beaker,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Cloud,
  Sun,
  CloudRain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFields, useSensors, useAlerts, useRealtimeSensorReadings } from '@/hooks/useSupabaseData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  forecast: string;
}

export const RealtimeDashboard = () => {
  const { fields, loading: fieldsLoading } = useFields();
  const { sensors, loading: sensorsLoading } = useSensors();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { latestReadings } = useRealtimeSensorReadings();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    condition: 'sunny',
    forecast: 'Clear skies expected for the next 3 days'
  });

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated weather updates
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      setWeatherData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(30, Math.min(95, prev.humidity + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 2)
      }));
    }, 10000);
    return () => clearInterval(weatherTimer);
  }, []);

  const loading = fieldsLoading || sensorsLoading || alertsLoading;

  // Calculate system health metrics
  const totalSensors = sensors.length;
  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const systemHealth = totalSensors > 0 ? (onlineSensors / totalSensors) * 100 : 0;
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length;
  const totalUnreadAlerts = alerts.filter(a => !a.is_read && !a.is_resolved).length;

  // Field health distribution
  const fieldHealthData = [
    { name: 'Excellent', value: fields.filter(f => f.health_status === 'excellent').length, color: '#10b981' },
    { name: 'Good', value: fields.filter(f => f.health_status === 'good').length, color: '#3b82f6' },
    { name: 'Warning', value: fields.filter(f => f.health_status === 'warning').length, color: '#f59e0b' },
    { name: 'Critical', value: fields.filter(f => f.health_status === 'critical').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return Sun;
      case 'cloudy': return Cloud;
      case 'rainy': return CloudRain;
      default: return Sun;
    }
  };

  const WeatherIcon = getWeatherIcon(weatherData.condition);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card className="overflow-hidden bg-gradient-to-r from-[hsl(var(--agro-green))]/10 via-background to-[hsl(var(--agro-sky))]/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-[hsl(var(--agro-primary))]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentTime.toLocaleTimeString()}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <WeatherIcon className="h-8 w-8 text-[hsl(var(--agro-warning))]" />
                <span className="text-2xl font-bold">{weatherData.temperature.toFixed(1)}°C</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {weatherData.humidity.toFixed(0)}% humidity • {weatherData.windSpeed.toFixed(1)} km/h wind
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-6 w-6 text-[hsl(var(--agro-success))]" />
                <span className="text-2xl font-bold">{systemHealth.toFixed(0)}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                System Health • {onlineSensors}/{totalSensors} sensors online
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {criticalAlerts > 0 ? (
                  <>
                    <AlertCircle className="h-6 w-6 text-[hsl(var(--agro-danger))]" />
                    <span className="text-2xl font-bold text-[hsl(var(--agro-danger))]">{criticalAlerts}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 text-[hsl(var(--agro-success))]" />
                    <span className="text-2xl font-bold text-[hsl(var(--agro-success))]">0</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Critical Alerts • {totalUnreadAlerts} unread
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Sensors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--agro-sky))]/20">
                <Wifi className="h-4 w-4 text-[hsl(var(--agro-sky))]" />
              </div>
              Active Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold">{onlineSensors}</div>
                <p className="text-sm text-muted-foreground">of {totalSensors} total</p>
              </div>
              <Progress value={systemHealth} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Connectivity</span>
                <span>{systemHealth.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--agro-green))]/20">
                <Activity className="h-4 w-4 text-[hsl(var(--agro-green))]" />
              </div>
              Field Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold">{fields.length}</div>
                <p className="text-sm text-muted-foreground">active fields</p>
              </div>
              {fieldHealthData.length > 0 && (
                <div className="space-y-2">
                  {fieldHealthData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--agro-primary))]/20">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--agro-primary))]" />
              </div>
              Data Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold">
                  {Object.keys(latestReadings).length.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">readings today</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-[hsl(var(--agro-success))]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-muted-foreground">Live updates active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--agro-warning))]/20">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--agro-warning))]" />
              </div>
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold">{totalUnreadAlerts}</div>
                <p className="text-sm text-muted-foreground">unresolved alerts</p>
              </div>
              {criticalAlerts > 0 && (
                <Badge variant="destructive" className="w-full justify-center">
                  {criticalAlerts} Critical
                </Badge>
              )}
              <Button variant="outline" size="sm" className="w-full">
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Health Chart */}
      {fieldHealthData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Field Health Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fieldHealthData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {fieldHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WeatherIcon className="h-5 w-5" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{weatherData.forecast}</p>
        </CardContent>
      </Card>
    </div>
  );
};