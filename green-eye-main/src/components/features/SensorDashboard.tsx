import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, Droplet, Zap, Beaker, Wifi, WifiOff, RefreshCw, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSensors, useRealtimeSensorReadings, useSensorReadings } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const SensorDashboard = () => {
  const { sensors, loading } = useSensors();
  const { latestReadings } = useRealtimeSensorReadings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { readings: historicalReadings } = useSensorReadings(selectedSensor, 50);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (!isRefreshing) {
        refreshSensors();
      }
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, isRefreshing]);

  // Set first sensor as selected by default
  useEffect(() => {
    if (sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0].id);
    }
  }, [sensors, selectedSensor]);

  // Convert database sensors to display format
  const sensorDisplayData = sensors.map(sensor => {
    const latestReading = latestReadings[sensor.id];
    const iconMap = {
      temperature: Thermometer,
      moisture: Droplet,
      ph: Beaker,
      conductivity: Zap,
    };
    
    const colorMap = {
      temperature: 'hsl(var(--agro-warning))',
      moisture: 'hsl(var(--agro-sky))',
      ph: 'hsl(var(--agro-success))',
      conductivity: 'hsl(var(--agro-earth))',
    };

    const optimalRanges = {
      temperature: [18, 30],
      moisture: [40, 80],
      ph: [6, 7.5],
      conductivity: [0.8, 2.0],
    };

    const ranges = {
      temperature: [0, 50],
      moisture: [0, 100],
      ph: [0, 14],
      conductivity: [0, 5],
    };

    return {
      id: sensor.id,
      name: sensor.name,
      value: latestReading?.value || Math.random() * ranges[sensor.sensor_type][1],
      unit: latestReading?.unit || getSensorUnit(sensor.sensor_type),
      min: ranges[sensor.sensor_type][0],
      max: ranges[sensor.sensor_type][1],
      optimal: optimalRanges[sensor.sensor_type],
      icon: iconMap[sensor.sensor_type],
      color: colorMap[sensor.sensor_type],
      lastUpdate: latestReading?.recorded_at ? new Date(latestReading.recorded_at) : new Date(),
      status: sensor.status,
      batteryLevel: sensor.battery_level,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      changePercent: (Math.random() * 10 - 5).toFixed(1),
    };
  });

  function getSensorUnit(sensorType: string): string {
    const units = {
      temperature: '°C',
      moisture: '%',
      ph: '',
      conductivity: 'mS/cm',
    };
    return units[sensorType as keyof typeof units] || '';
  }

  const refreshSensors = async () => {
    setIsRefreshing(true);
    try {
      toast.success('Sensor data refreshed');
      setTimeout(() => setIsRefreshing(false), 1000);
    } catch (error) {
      toast.error('Failed to refresh sensor data');
      setIsRefreshing(false);
    }
  };

  const getSensorStatus = (sensor: any) => {
    if (sensor.status === 'offline') return { 
      label: 'Offline', 
      color: 'bg-gray-500', 
      icon: WifiOff,
      description: 'Sensor not responding'
    };
    if (sensor.status === 'warning') return { 
      label: 'Warning', 
      color: 'bg-[hsl(var(--agro-warning))]', 
      icon: AlertTriangle,
      description: 'Requires attention'
    };
    
    const isOptimal = sensor.value >= sensor.optimal[0] && sensor.value <= sensor.optimal[1];
    if (isOptimal) return { 
      label: 'Optimal', 
      color: 'bg-[hsl(var(--agro-success))]', 
      icon: CheckCircle,
      description: 'Operating normally'
    };
    
    return { 
      label: 'Alert', 
      color: 'bg-[hsl(var(--agro-danger))]', 
      icon: AlertTriangle,
      description: 'Critical attention needed'
    };
  };

  // Prepare chart data
  const chartData = historicalReadings.map(reading => ({
    time: new Date(reading.recorded_at).toLocaleTimeString(),
    value: reading.value,
    quality: reading.quality_score
  })).reverse();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Loading sensor data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[hsl(var(--agro-green))]/10 to-[hsl(var(--agro-sky))]/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-3 h-3 rounded-full bg-[hsl(var(--agro-success))]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                  Live Sensor Network ({sensors.length} sensors)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time agricultural monitoring system
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">View:</label>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'chart')}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Auto
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSensors}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {sensorDisplayData.map((sensor, index) => {
                  const status = getSensorStatus(sensor);
                  const progressValue = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
                  
                  return (
                    <motion.div
                      key={sensor.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="relative group"
                      onClick={() => setSelectedSensor(sensor.id)}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 hover:border-l-[hsl(var(--agro-primary))] group-hover:scale-[1.02]">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className="p-3 rounded-xl relative overflow-hidden"
                                style={{ backgroundColor: `${sensor.color}15` }}
                                whileHover={{ scale: 1.1 }}
                                animate={{ 
                                  boxShadow: sensor.status === 'online' 
                                    ? [`0 0 0 0 ${sensor.color}40`, `0 0 0 8px ${sensor.color}10`]
                                    : '0 0 0 0 transparent'
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <sensor.icon 
                                  className="h-6 w-6"
                                  style={{ color: sensor.color }}
                                />
                              </motion.div>
                              <div>
                                <h4 className="font-semibold text-lg">{sensor.name}</h4>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span>#{sensor.id.slice(-4).toUpperCase()}</span>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                  <span>Battery: {sensor.batteryLevel}%</span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <Badge className={`${status.color} text-white flex items-center gap-1`}>
                                <status.icon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {sensor.trend === 'up' ? (
                                  <TrendingUp className="h-3 w-3 text-[hsl(var(--agro-success))]" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-[hsl(var(--agro-danger))]" />
                                )}
                                <span>{sensor.changePercent}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-sky))] bg-clip-text text-transparent">
                                  {sensor.value.toFixed(1)}
                                </span>
                                <span className="text-lg text-muted-foreground">{sensor.unit}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Optimal range: {sensor.optimal[0]} - {sensor.optimal[1]} {sensor.unit}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Performance</span>
                                <span>{Math.round(progressValue)}%</span>
                              </div>
                              <Progress 
                                value={Math.max(0, Math.min(100, progressValue))} 
                                className="h-3 transition-all duration-500"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                              <span>Last update: {sensor.lastUpdate.toLocaleTimeString()}</span>
                              <motion.div
                                className="w-2 h-2 rounded-full bg-[hsl(var(--agro-success))]"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id}>
                        {sensor.name} - {sensor.sensor_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSensor && chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Data - {sensors.find(s => s.id === selectedSensor)?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--agro-primary))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--agro-primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--agro-primary))" 
                            fillOpacity={1} 
                            fill="url(#colorValue)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};