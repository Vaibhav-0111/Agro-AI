import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Bell, X, Settings, Check, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  field: string;
  resolved: boolean;
  actions?: string[];
}

export const AlertsCenter = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Low Soil Moisture Alert',
      description: 'Sector B moisture levels have dropped below 35%. Immediate irrigation recommended.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      field: 'North Field',
      resolved: false,
      actions: ['Start Irrigation', 'Schedule Inspection']
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Pest Risk Detected',
      description: 'AI model predicts 78% chance of pest outbreak in the next 48 hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      field: 'South Field',
      resolved: false,
      actions: ['Deploy Traps', 'Apply Treatment']
    },
    {
      id: '3',
      type: 'info',
      title: 'Sensor Maintenance Due',
      description: 'Temperature sensor T-004 requires calibration check.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      field: 'East Field',
      resolved: true,
      actions: ['Schedule Maintenance']
    }
  ]);

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: Math.random() > 0.7 ? 'warning' : 'info',
          title: 'New Sensor Reading',
          description: 'Unusual readings detected in automated monitoring system.',
          timestamp: new Date(),
          field: ['North Field', 'South Field', 'East Field'][Math.floor(Math.random() * 3)],
          resolved: false,
          actions: ['Investigate', 'Dismiss']
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-l-[hsl(var(--agro-danger))] bg-red-50/50 dark:bg-red-900/10';
      case 'warning': return 'border-l-[hsl(var(--agro-warning))] bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'info': return 'border-l-[hsl(var(--agro-sky))] bg-blue-50/50 dark:bg-blue-900/10';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-[hsl(var(--agro-danger))]" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-[hsl(var(--agro-warning))]" />;
      case 'info': return <Bell className="h-5 w-5 text-[hsl(var(--agro-sky))]" />;
    }
  };

  const getBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'bg-[hsl(var(--agro-danger))] text-white';
      case 'warning': return 'bg-[hsl(var(--agro-warning))] text-black';
      case 'info': return 'bg-[hsl(var(--agro-sky))] text-white';
    }
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-6">
      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive real-time alerts on your device
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get critical alerts via email
              </p>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={setEmailAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--agro-warning))]" />
              Active Alerts
              {activeAlerts.length > 0 && (
                <Badge className="bg-[hsl(var(--agro-danger))] text-white ml-2">
                  {activeAlerts.length}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout">
            {activeAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Check className="mx-auto h-12 w-12 text-[hsl(var(--agro-success))] mb-4" />
                <p className="text-lg font-medium mb-2">All Clear!</p>
                <p className="text-muted-foreground">No active alerts at the moment.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {activeAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getAlertIcon(alert.type)}
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getBadgeColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{alert.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleString()}
                          </div>
                          <span>Field: {alert.field}</span>
                        </div>
                        
                        {alert.actions && (
                          <div className="flex gap-2 mb-2">
                            {alert.actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant="outline"
                                size="sm"
                                onClick={() => resolveAlert(alert.id)}
                              >
                                {action}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-4"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[hsl(var(--agro-success))]" />
              Resolved Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[hsl(var(--agro-success))]" />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.field} • {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[hsl(var(--agro-success))]">
                    Resolved
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};