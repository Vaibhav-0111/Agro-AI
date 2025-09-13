import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  gradient?: boolean;
}

export const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon,
  gradient = false 
}: StatsCardProps) => {
  const changeColors = {
    positive: "bg-[hsl(var(--agro-success))] text-white",
    negative: "bg-[hsl(var(--agro-danger))] text-white", 
    neutral: "bg-muted text-muted-foreground"
  };

  return (
    <Card className={`overflow-hidden ${gradient ? 'bg-gradient-to-br from-card to-muted/30' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            {change && (
              <Badge className={`mt-3 ${changeColors[changeType]}`}>
                {change}
              </Badge>
            )}
          </div>
          <div className="ml-4 p-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};