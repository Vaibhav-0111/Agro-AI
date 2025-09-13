import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AlertsCenter } from "@/components/features/AlertsCenter";

const Alerts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Smart Alert System</h1>
          <p className="text-muted-foreground">
            Manage and configure intelligent alerts for crop health and environmental conditions.
          </p>
        </div>
        
        <AlertsCenter />
      </div>
    </DashboardLayout>
  );
};

export default Alerts;