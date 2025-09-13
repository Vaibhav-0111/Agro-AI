import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane, useTexture, Environment, Cloud, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface SensorNodeProps {
  position: [number, number, number];
  status: 'healthy' | 'warning' | 'critical';
  onClick: () => void;
}

const SensorNode = ({ position, status, onClick }: SensorNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    if (glowRef.current && glowRef.current.material) {
      glowRef.current.rotation.y = -state.clock.elapsedTime * 0.8;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const colors = {
    healthy: '#10b981',
    warning: '#f59e0b', 
    critical: '#ef4444'
  };

  return (
    <group>
      {/* Outer glow ring */}
      <Sphere
        ref={glowRef}
        position={[position[0], position[1] + 0.05, position[2]]}
        scale={hovered ? 2.5 : 2}
        visible={status === 'critical'}
      >
        <meshBasicMaterial 
          color={colors[status]}
          transparent
          opacity={0.2}
        />
      </Sphere>
      
      {/* Main sensor node */}
      <Sphere
        ref={meshRef}
        position={position}
        scale={hovered ? 1.3 : 1}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhongMaterial 
          color={colors[status]} 
          emissive={colors[status]}
          emissiveIntensity={status === 'critical' ? 0.6 : 0.2}
          transparent
          opacity={0.9}
          shininess={100}
        />
      </Sphere>
      
      {/* Data beam effect */}
      {status !== 'critical' && (
        <Box 
          position={[position[0], position[1] + 1.5, position[2]]}
          scale={[0.02, 3, 0.02]}
        >
          <meshBasicMaterial 
            color={colors[status]}
            transparent
            opacity={0.4}
          />
        </Box>
      )}
      
      {/* Floating status indicator */}
      <Text
        position={[position[0], position[1] + 2, position[2]]}
        fontSize={0.2}
        color={colors[status]}
        anchorX="center"
        anchorY="middle"
      >
        {status.toUpperCase()}
      </Text>
    </group>
  );
};

const Field = () => {
  const fieldRef = useRef<THREE.Mesh>(null);
  const groundRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (fieldRef.current && fieldRef.current.material) {
      const material = fieldRef.current.material as THREE.MeshStandardMaterial;
      if (material.map) {
        material.map.offset.set(
          Math.sin(state.clock.elapsedTime * 0.1) * 0.01,
          state.clock.elapsedTime * 0.02
        );
      }
    }
  });

  return (
    <group>
      {/* Ground/Soil Base */}
      <Box ref={groundRef} args={[12, 0.2, 10]} position={[0, -0.6, 0]}>
        <meshPhongMaterial 
          color="#8B4513"
        />
      </Box>
      
      {/* Crop Field */}
      <Box ref={fieldRef} args={[10, 0.1, 8]} position={[0, -0.4, 0]}>
        <meshStandardMaterial 
          color="#22c55e"
        />
      </Box>
      
      {/* Field rows/patterns */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box 
          key={i}
          args={[10, 0.05, 0.1]} 
          position={[0, -0.35, -3.5 + i]}
        >
          <meshStandardMaterial 
            color="#2d5016"
            transparent
            opacity={0.6}
          />
        </Box>
      ))}
      
      {/* Irrigation lines */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Box 
          key={`irrigation-${i}`}
          args={[0.05, 0.05, 8]} 
          position={[-2.5 + i * 2.5, -0.3, 0]}
        >
          <meshStandardMaterial 
            color="#4A90E2"
            emissive="#4A90E2"
            emissiveIntensity={0.2}
          />
        </Box>
      ))}
    </group>
  );
};

// Weather Effects Component
const WeatherEffects = ({ weather }: { weather: string }) => {
  return (
    <>
      {weather === 'rainy' && (
        <>
          {Array.from({ length: 100 }).map((_, i) => (
            <Sphere key={i} args={[0.01]} position={[
              (Math.random() - 0.5) * 20,
              10 + Math.random() * 5,
              (Math.random() - 0.5) * 20
            ]}>
              <meshBasicMaterial color="#87CEEB" transparent opacity={0.6} />
            </Sphere>
          ))}
        </>
      )}
    </>
  );
};

interface Field3DProps {
  onSensorClick: (sensorId: string) => void;
  weather?: 'sunny' | 'cloudy' | 'rainy';
  timeOfDay?: 'day' | 'night';
}

export const Field3D = ({ onSensorClick, weather = 'sunny', timeOfDay = 'day' }: Field3DProps) => {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  
  const sensors = [
    { id: 'S001', position: [-2, 0, -1] as [number, number, number], status: 'healthy' as const, name: 'Moisture Sensor', value: '65%' },
    { id: 'S002', position: [1, 0, 1] as [number, number, number], status: 'warning' as const, name: 'Temperature Sensor', value: '32°C' },
    { id: 'S003', position: [3, 0, -2] as [number, number, number], status: 'critical' as const, name: 'pH Sensor', value: '8.2' },
    { id: 'S004', position: [-1, 0, 2] as [number, number, number], status: 'healthy' as const, name: 'Conductivity Sensor', value: '1.8 mS/cm' },
    { id: 'S005', position: [-3, 0, 1] as [number, number, number], status: 'healthy' as const, name: 'Nitrogen Sensor', value: '45 ppm' },
    { id: 'S006', position: [2, 0, -3] as [number, number, number], status: 'warning' as const, name: 'Light Sensor', value: '850 lux' },
  ];

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId);
    onSensorClick(sensorId);
  };

  return (
    <div className="relative w-full h-full">
      <Canvas 
        camera={{ position: [8, 6, 8], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={timeOfDay === 'day' ? 0.6 : 0.3} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={timeOfDay === 'day' ? 1.2 : 0.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight 
          position={[-5, 5, -5]} 
          color={weather === 'rainy' ? '#87CEEB' : '#ffffff'} 
          intensity={0.4} 
        />
        
        {/* Environment */}
        {timeOfDay === 'day' ? (
          <Sky 
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
          />
        ) : (
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        )}
        
        {/* Weather Effects */}
        <WeatherEffects weather={weather} />
        
        {/* Field */}
        <Field />
        
        {/* Sensors */}
        {sensors.map((sensor) => (
          <SensorNode
            key={sensor.id}
            position={sensor.position}
            status={sensor.status}
            onClick={() => handleSensorClick(sensor.id)}
          />
        ))}
        
        {/* Field Title */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.6}
          color={timeOfDay === 'day' ? '#1f2937' : '#e5e7eb'}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.ttf"
        >
          Smart Agricultural Field
        </Text>
        
        <Text
          position={[0, 3, 0]}
          fontSize={0.3}
          color={timeOfDay === 'day' ? '#6b7280' : '#9ca3af'}
          anchorX="center"
          anchorY="middle"
        >
          Real-time IoT Monitoring System
        </Text>
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxDistance={15}
          minDistance={3}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Sensor Information Overlay */}
      {selectedSensor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 border shadow-xl max-w-xs"
        >
          {sensors.filter(s => s.id === selectedSensor).map(sensor => (
            <div key={sensor.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{sensor.name}</h3>
                <Badge 
                  className={
                    sensor.status === 'healthy' ? 'bg-[hsl(var(--agro-success))]' :
                    sensor.status === 'warning' ? 'bg-[hsl(var(--agro-warning))]' :
                    'bg-[hsl(var(--agro-danger))]'
                  }
                >
                  {sensor.status}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--agro-primary))]">{sensor.value}</p>
              <p className="text-sm text-muted-foreground">Sensor ID: {sensor.id}</p>
              <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          ))}
        </motion.div>
      )}
      
      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click and drag to rotate</p>
          <p>• Scroll to zoom</p>
          <p>• Click sensors for details</p>
        </div>
      </div>
    </div>
  );
};