import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Wifi, WifiOff, Maximize2 } from "lucide-react";
import { Field3D } from "@/components/3d/Field3D";
import { motion } from "framer-motion";

export const FieldMap = () => {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  const fields = [
    { id: "F001", name: "North Field", health: "Good", sensors: 12, active: 11 },
    { id: "F002", name: "South Field", health: "Warning", sensors: 8, active: 7 },
    { id: "F003", name: "East Field", health: "Critical", sensors: 15, active: 13 },
    { id: "F004", name: "West Field", health: "Good", sensors: 10, active: 10 },
  ];

  const healthColors = {
    Good: "bg-[hsl(var(--agro-success))]",
    Warning: "bg-[hsl(var(--agro-warning))]",
    Critical: "bg-[hsl(var(--agro-danger))]"
  };

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          Field Overview
          <div className="flex gap-2">
            <Button
              variant={viewMode === '2d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('2d')}
            >
              2D
            </Button>
            <Button
              variant={viewMode === '3d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('3d')}
            >
              3D
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === '3d' ? (
            <div className="relative rounded-lg h-64 mb-4 overflow-hidden border bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-900/20 dark:to-green-900/20">
              <Field3D onSensorClick={handleSensorClick} />
              {selectedSensor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg"
                >
                  <p className="font-medium">Sensor {selectedSensor}</p>
                  <p className="text-sm text-muted-foreground">Click sensor for details</p>
                </motion.div>
              )}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative bg-gradient-to-br from-[hsl(var(--agro-green-light))] to-[hsl(var(--agro-sky))] rounded-lg h-48 mb-4 overflow-hidden">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  className="absolute w-16 h-16 rounded-lg border-2 border-white/50 flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${20 + (index * 20)}%`,
                    top: `${30 + (index % 2) * 30}%`,
                    backgroundColor: `hsl(var(--agro-${field.health === 'Good' ? 'success' : field.health === 'Warning' ? 'warning' : 'danger'}))`
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: field.health === 'Critical' 
                      ? ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)']
                      : ['0 0 0 0 rgba(0, 0, 0, 0)', '0 0 0 0 rgba(0, 0, 0, 0)']
                  }}
                  transition={{ 
                    duration: field.health === 'Critical' ? 1.5 : 0,
                    repeat: field.health === 'Critical' ? Infinity : 0
                  }}
                >
                  <MapPin className="h-6 w-6 text-white" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Field status list */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`w-3 h-3 rounded-full ${healthColors[field.health as keyof typeof healthColors]}`}
                  animate={{
                    scale: field.health === 'Critical' ? [1, 1.3, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: field.health === 'Critical' ? Infinity : 0
                  }}
                />
                <div>
                  <p className="font-medium text-foreground">{field.name}</p>
                  <p className="text-sm text-muted-foreground">{field.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <motion.div
                    animate={{
                      scale: field.active !== field.sensors ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: field.active !== field.sensors ? Infinity : 0
                    }}
                  >
                    {field.active === field.sensors ? (
                      <Wifi className="h-3 w-3 text-[hsl(var(--agro-success))]" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-[hsl(var(--agro-danger))]" />
                    )}
                  </motion.div>
                  <span className="text-muted-foreground">{field.active}/{field.sensors}</span>
                </div>
                
                <Badge variant={field.health === 'Good' ? 'default' : 'destructive'}>
                  {field.health}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};