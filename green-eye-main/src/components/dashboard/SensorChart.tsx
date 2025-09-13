import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SensorChart = () => {
  // Mock sensor data for visualization
  const sensorData = [
    { time: "00:00", moisture: 65, temp: 22, ph: 6.8 },
    { time: "04:00", moisture: 63, temp: 20, ph: 6.9 },
    { time: "08:00", moisture: 68, temp: 25, ph: 7.0 },
    { time: "12:00", moisture: 70, temp: 28, ph: 7.1 },
    { time: "16:00", moisture: 72, temp: 30, ph: 7.0 },
    { time: "20:00", moisture: 69, temp: 26, ph: 6.9 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Soil Sensor Data - Last 24 Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Moisture Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Soil Moisture</span>
              <span className="text-sm font-bold text-[hsl(var(--agro-sky))]">68%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[hsl(var(--agro-sky))] to-[hsl(var(--agro-green))] h-2 rounded-full transition-all duration-500" 
                style={{ width: "68%" }}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Temperature</span>
              <span className="text-sm font-bold text-[hsl(var(--agro-warning))]">26°C</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[hsl(var(--agro-warning))] to-[hsl(var(--agro-earth))] h-2 rounded-full transition-all duration-500" 
                style={{ width: "65%" }}
              />
            </div>
          </div>

          {/* pH Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">pH Level</span>
              <span className="text-sm font-bold text-[hsl(var(--agro-success))]">6.9</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[hsl(var(--agro-success))] to-[hsl(var(--agro-green))] h-2 rounded-full transition-all duration-500" 
                style={{ width: "70%" }}
              />
            </div>
          </div>

          {/* Mini chart visualization */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-end justify-between h-20">
              {sensorData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="flex flex-col gap-1">
                    <div 
                      className="w-2 bg-[hsl(var(--agro-sky))] rounded-t"
                      style={{ height: `${data.moisture}%` }}
                    />
                    <div 
                      className="w-2 bg-[hsl(var(--agro-warning))] rounded-t"
                      style={{ height: `${(data.temp / 35) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};