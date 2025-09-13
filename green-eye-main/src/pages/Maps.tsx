import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field3D } from "@/components/3d/Field3D";
import { MapPin, Layers, Satellite, Navigation, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Maps = () => {
  const [mapType, setMapType] = useState("3d");
  const [selectedField, setSelectedField] = useState("field1");
  const [layerVisible, setLayerVisible] = useState({
    sensors: true,
    moisture: true,
    temperature: false,
    ph: false,
  });

  const fields = [
    { id: "field1", name: "North Field", area: "45.2 hectares", crops: "Wheat", health: "excellent" },
    { id: "field2", name: "South Field", area: "32.8 hectares", crops: "Corn", health: "good" },
    { id: "field3", name: "East Field", area: "28.5 hectares", crops: "Soybeans", health: "warning" },
  ];

  const mapLayers = [
    { key: "sensors", label: "Sensor Locations", icon: MapPin, color: "bg-blue-500" },
    { key: "moisture", label: "Soil Moisture", icon: Layers, color: "bg-green-500" },
    { key: "temperature", label: "Temperature Zones", icon: Satellite, color: "bg-orange-500" },
    { key: "ph", label: "pH Levels", icon: Navigation, color: "bg-purple-500" },
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent": return "bg-[hsl(var(--agro-success))]";
      case "good": return "bg-[hsl(var(--agro-sky))]";
      case "warning": return "bg-[hsl(var(--agro-warning))]";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Field Maps</h1>
          <p className="text-muted-foreground">
            Interactive field visualization with real-time data layers and 3D analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Controls */}
          <motion.div 
            className="lg:col-span-1 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                  Map Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">View Type</label>
                  <Select value={mapType} onValueChange={setMapType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3d">3D Interactive</SelectItem>
                      <SelectItem value="satellite">Satellite View</SelectItem>
                      <SelectItem value="terrain">Terrain Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Selected Field</label>
                  <Select value={selectedField} onValueChange={setSelectedField}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Map Actions</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Layers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mapLayers.map((layer) => (
                  <motion.div
                    key={layer.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setLayerVisible(prev => ({
                      ...prev,
                      [layer.key]: !prev[layer.key]
                    }))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${layer.color} ${layerVisible[layer.key] ? 'opacity-100' : 'opacity-30'}`} />
                      <layer.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{layer.label}</span>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 ${layerVisible[layer.key] ? 'bg-primary border-primary' : 'border-muted-foreground'} transition-colors`}>
                      {layerVisible[layer.key] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full bg-primary rounded-sm"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Field Information</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {fields.filter(f => f.id === selectedField).map(field => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{field.name}</h4>
                        <Badge className={`${getHealthColor(field.health)} text-white`}>
                          {field.health}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Area:</span>
                          <span className="font-medium">{field.area}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Crops:</span>
                          <span className="font-medium">{field.crops}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Map Area */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="h-[600px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    Interactive Field Map - {fields.find(f => f.id === selectedField)?.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--agro-success))] animate-pulse" />
                    <span className="text-sm text-muted-foreground">Live Data</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] p-0">
                {mapType === "3d" ? (
                  <Field3D 
                    onSensorClick={(sensorId) => console.log('Sensor clicked:', sensorId)}
                    weather="sunny"
                    timeOfDay="day"
                  />
                ) : (
                  <motion.div 
                    className="w-full h-full bg-gradient-to-br from-[hsl(var(--agro-green))]/20 to-[hsl(var(--agro-sky))]/20 flex items-center justify-center relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Animated background pattern */}
                    <motion.div 
                      className="absolute inset-0 opacity-20"
                      animate={{ 
                        backgroundPosition: ["0% 0%", "100% 100%"],
                      }}
                      transition={{ 
                        duration: 20, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                      style={{
                        backgroundImage: `radial-gradient(circle, hsl(var(--agro-primary)) 2px, transparent 2px)`,
                        backgroundSize: '40px 40px'
                      }}
                    />
                    
                    {/* Map placeholder content */}
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Satellite className="h-16 w-16 text-[hsl(var(--agro-primary))] mx-auto" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {mapType === "satellite" ? "Satellite View" : "Terrain Map"}
                        </h3>
                        <p className="text-muted-foreground">
                          Loading high-resolution imagery...
                        </p>
                      </div>
                      
                      {/* Animated sensors */}
                      {layerVisible.sensors && (
                        <div className="absolute inset-0">
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg"
                              style={{
                                top: `${20 + (i * 10)}%`,
                                left: `${15 + (i * 12)}%`,
                              }}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Maps;