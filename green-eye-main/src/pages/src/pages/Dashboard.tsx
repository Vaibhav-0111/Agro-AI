import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SensorChart } from "@/components/dashboard/SensorChart";
import { FieldMap } from "@/components/dashboard/FieldMap";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { AlertsCenter } from "@/components/features/AlertsCenter";
import { SensorDashboard } from "@/components/features/SensorDashboard";
import { RealtimeDashboard } from "@/components/features/RealtimeDashboard";
import { ImageUpload } from "@/components/features/ImageUpload";
import { LiveAnomalyMonitor } from "@/components/features/LiveAnomalyMonitor";
import { LiveSensorMap } from "@/components/features/LiveSensorMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, MapPin, Zap, Eye, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useFields, useSensors, useAlerts } from "@/hooks/useSupabaseData";

const Index = () => {
  const { fields, loading: fieldsLoading } = useFields();
  const { sensors, loading: sensorsLoading } = useSensors();
  const { alerts, loading: alertsLoading } = useAlerts();

  const loading = fieldsLoading || sensorsLoading || alertsLoading;

  // Calculate real stats from data
  const activeFields = fields?.length || 0;
  const totalSensors = sensors?.length || 0;
  const onlineSensors = sensors?.filter(s => s.status === 'online').length || 0;
  const activeAlerts = alerts?.filter(a => !a.is_resolved).length || 0;
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && !a.is_resolved).length || 0;
  
  const systemHealth = totalSensors > 0 ? Math.round((onlineSensors / totalSensors) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-sky))] bg-clip-text text-transparent">
                AgroLens Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered agricultural monitoring and crop optimization platform
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Field View
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </motion.div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard
              title="Active Fields"
              value={loading ? "..." : activeFields.toString()}
              change={`${activeFields > 0 ? "+2" : "0"} from last month`}
              icon={<MapPin className="h-6 w-6" />}
              changeType={activeFields > 0 ? "positive" : "neutral"}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard
              title="Online Sensors"
              value={loading ? "..." : `${onlineSensors}/${totalSensors}`}
              change={onlineSensors === totalSensors ? "All systems operational" : "Some sensors offline"}
              icon={<Zap className="h-6 w-6" />}
              changeType={onlineSensors === totalSensors ? "positive" : "negative"}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsCard
              title="System Health"
              value={loading ? "..." : `${systemHealth}%`}
              change={systemHealth >= 90 ? "Excellent performance" : "Needs attention"}
              icon={<TrendingUp className="h-6 w-6" />}
              changeType={systemHealth >= 90 ? "positive" : "negative"}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatsCard
              title="Active Alerts"
              value={loading ? "..." : activeAlerts.toString()}
              change={criticalAlerts > 0 ? `${criticalAlerts} critical alerts` : "All systems normal"}
              icon={<Activity className="h-6 w-6" />}
              changeType={criticalAlerts > 0 ? "negative" : "positive"}
            />
          </motion.div>
        </div>

        <Tabs defaultValue="realtime" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="realtime" className="gap-2">
              <Activity className="h-4 w-4" />
              Live
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime" className="space-y-4">
            <RealtimeDashboard />
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <LiveAnomalyMonitor />
              <LiveSensorMap />
            </div>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <SensorChart />
              <FieldMap />
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <AlertsCenter />
              <AIInsights />
            </div>
          </TabsContent>
          
          <TabsContent value="sensors">
            <SensorDashboard />
          </TabsContent>
          
          <TabsContent value="fields">
            <FieldMap />
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <ImageUpload />
              <AIInsights />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
