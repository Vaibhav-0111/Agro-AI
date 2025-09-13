import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Droplet, Bug } from "lucide-react";

export const AIInsights = () => {
  const insights = [
    {
      title: "Crop Stress Level",
      value: "Low",
      confidence: 87,
      icon: <TrendingUp className="h-4 w-4" />,
      status: "success",
      description: "NDVI values are within optimal range"
    },
    {
      title: "Pest Risk Score", 
      value: "45/100",
      confidence: 92,
      icon: <Bug className="h-4 w-4" />,
      status: "warning",
      description: "Moderate risk detected in sector B"
    },
    {
      title: "Irrigation Need",
      value: "Critical",
      confidence: 95,
      icon: <Droplet className="h-4 w-4" />,
      status: "danger",
      description: "Soil moisture below 40% in multiple zones"
    },
    {
      title: "Disease Risk",
      value: "Low",
      confidence: 78,
      icon: <AlertTriangle className="h-4 w-4" />,
      status: "success", 
      description: "Environmental conditions not favorable for disease"
    }
  ];

  const statusColors = {
    success: "bg-[hsl(var(--agro-success))] text-white",
    warning: "bg-[hsl(var(--agro-warning))] text-black",
    danger: "bg-[hsl(var(--agro-danger))] text-white"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--agro-green))] animate-pulse" />
          AI Insights & Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10 text-primary">
                  {insight.icon}
                </div>
                <span className="font-medium text-foreground">{insight.title}</span>
              </div>
              <Badge className={statusColors[insight.status as keyof typeof statusColors]}>
                {insight.value}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div 
                  className="bg-[hsl(var(--agro-green))] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${insight.confidence}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground">{insight.confidence}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};