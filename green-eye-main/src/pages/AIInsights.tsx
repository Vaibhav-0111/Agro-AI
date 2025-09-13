import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AIInsights as AIInsightsComponent } from "@/components/dashboard/AIInsights";

const AIInsights = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Insights & Predictions</h1>
          <p className="text-muted-foreground">
            Machine learning powered analysis and crop health predictions.
          </p>
        </div>
        
        <AIInsightsComponent />
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;