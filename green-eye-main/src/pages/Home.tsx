import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Environment, PerspectiveCamera } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Brain, 
  Satellite, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Sparkles,
  Eye
} from 'lucide-react';
import * as THREE from 'three';
import { useAuth } from '@/contexts/AuthContext';

// 3D Animated Sphere Component
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.5}>
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// Floating particles
function Particles() {
  const count = 500;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3b82f6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Satellite,
      title: "Hyperspectral Imaging",
      description: "Advanced satellite imagery analysis with AI-powered crop health detection",
      color: "hsl(var(--agro-sky))"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms predict crop yields and detect diseases early",
      color: "hsl(var(--agro-primary))"
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "Live sensor data with instant anomaly detection and smart alerts",
      color: "hsl(var(--agro-warning))"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Data-driven forecasts for optimal harvest timing and resource allocation",
      color: "hsl(var(--agro-success))"
    },
    {
      icon: Shield,
      title: "Disease Prevention",
      description: "Early detection system preventing crop loss before it spreads",
      color: "hsl(var(--agro-danger))"
    },
    {
      icon: Sprout,
      title: "Sustainable Farming",
      description: "Optimize resources, reduce waste, and increase yield sustainably",
      color: "hsl(var(--agro-green))"
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(var(--agro-green))]/5 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] bg-clip-text text-transparent">
                AgroLens
              </span>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="hidden sm:flex"
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] hover:opacity-90"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with 3D */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* 3D Background */}
        <div className="absolute inset-0 -z-10">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Suspense fallback={null}>
              <AnimatedSphere />
              <Particles />
              <Environment preset="sunset" />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="container mx-auto px-6 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="gap-2 px-4 py-2 text-sm bg-[hsl(var(--agro-primary))]/10 text-[hsl(var(--agro-primary))] border-[hsl(var(--agro-primary))]/20">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Agricultural Intelligence
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="bg-gradient-to-r from-[hsl(var(--agro-primary))] via-[hsl(var(--agro-green))] to-[hsl(var(--agro-sky))] bg-clip-text text-transparent">
                    Smart Farming
                  </span>
                  <br />
                  <span className="text-foreground">Starts Here</span>
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Revolutionize your agricultural operations with AI-driven insights, 
                  hyperspectral imaging, and real-time monitoring. Maximize yields while 
                  minimizing resources.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] hover:opacity-90 text-lg px-8 py-6"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-8 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--agro-primary))]">98%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--agro-success))]">35%</div>
                  <div className="text-sm text-muted-foreground">Yield Increase</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--agro-sky))]">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[hsl(var(--agro-primary))]/10 text-[hsl(var(--agro-primary))] border-[hsl(var(--agro-primary))]/20">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for
              <span className="block bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] bg-clip-text text-transparent">
                Precision Agriculture
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology meets agricultural expertise
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <Card 
                  className={`p-6 h-full transition-all duration-300 cursor-pointer ${
                    hoveredFeature === index 
                      ? 'shadow-2xl scale-105 border-primary' 
                      : 'hover:shadow-xl'
                  }`}
                  style={{
                    borderLeft: hoveredFeature === index ? `4px solid ${feature.color}` : undefined
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon 
                      className="h-6 w-6"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-[hsl(var(--agro-primary))]/10 via-background to-[hsl(var(--agro-green))]/10 border-2">
              <div className="p-12 text-center space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Ready to Transform Your Farm?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of farmers already using AgroLens to increase yields 
                  and optimize their operations.
                </p>
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] hover:opacity-90 text-lg px-8 py-6"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--agro-primary))] to-[hsl(var(--agro-green))] flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">AgroLens</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AgroLens. Revolutionizing agriculture with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
