import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SensorDashboard } from "@/components/features/SensorDashboard";

const SensorData = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sensor Data Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of soil conditions and environmental parameters.
          </p>
        </div>
        
        <SensorDashboard />
      </div>
    </DashboardLayout>
  );
};

export default SensorData;