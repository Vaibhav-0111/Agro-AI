import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useFields } from "@/hooks/useSupabaseData";
import { 
  TrendingUp, 
  Calendar, 
  CloudRain, 
  Target,
  BarChart3,
  AlertTriangle,
  Leaf,
  Thermometer
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Prediction {
  id: string;
  prediction_type: string;
  prediction_data: any;
  confidence_score: number;
  prediction_date: string;
  field_id: string;
}

export const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("");
  const [activeTab, setActiveTab] = useState("yield");

  const { fields } = useFields();

  useEffect(() => {
    if (selectedField) {
      fetchPredictions();
    }
  }, [selectedField]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('predictive_analytics')
        .select('*')
        .eq('field_id', selectedField)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (predictionType: string) => {
    if (!selectedField) {
      toast.error("Please select a field first");
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to generate predictions");
        return;
      }

      // Simulate AI prediction generation
      const predictionData = await generatePredictionData(predictionType, selectedField);
      
      const { error } = await supabase
        .from('predictive_analytics')
        .insert({
          user_id: user.id,
          field_id: selectedField,
          prediction_type: predictionType,
          prediction_data: predictionData,
          confidence_score: predictionData.confidence,
          prediction_date: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success(`${predictionType} prediction generated successfully`);
      fetchPredictions();
    } catch (error: any) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }  
  };

  const generatePredictionData = async (type: string, fieldId: string) => {
    // In a real implementation, this would call an AI model
    // For now, we'll simulate realistic prediction data
    
    const baseDate = new Date();
    const field = fields?.find(f => f.id === fieldId);
    
    switch (type) {
      case 'yield_forecast':
        return {
          predicted_yield: Math.round(2500 + Math.random() * 1000), // tons per hectare
          confidence: Math.round(75 + Math.random() * 20) / 100,
          factors: [
            { name: 'Weather conditions', impact: 0.3, status: 'favorable' },
            { name: 'Soil health', impact: 0.25, status: 'good' },
            { name: 'Crop stage', impact: 0.2, status: 'optimal' },
            { name: 'Disease risk', impact: 0.15, status: 'low' },
            { name: 'Market conditions', impact: 0.1, status: 'stable' }
          ],
          timeline: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1).toLocaleDateString('en-US', { month: 'short' }),
            yield: Math.round(2000 + Math.random() * 1500 + (i * 100))
          })),
          harvest_date: new Date(baseDate.getTime() + (120 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        };
        
      case 'disease_risk':
        return {
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          confidence: Math.round(70 + Math.random() * 25) / 100,
          diseases: [
            { name: 'Fungal infections', probability: Math.round(10 + Math.random() * 30), severity: 'medium' },
            { name: 'Bacterial blight', probability: Math.round(5 + Math.random() * 20), severity: 'high' },
            { name: 'Viral diseases', probability: Math.round(2 + Math.random() * 15), severity: 'low' }
          ],
          timeline: Array.from({ length: 8 }, (_, i) => ({
            week: `Week ${i + 1}`,
            risk: Math.round(10 + Math.random() * 60 + Math.sin(i * 0.5) * 20)
          })),
          prevention_measures: [
            'Apply preventive fungicide treatment',
            'Improve field drainage',
            'Monitor humidity levels',
            'Regular field inspections'
          ]
        };
        
      case 'weather_impact':
        return {
          impact_score: Math.round(60 + Math.random() * 30),
          confidence: Math.round(80 + Math.random() * 15) / 100,
          weather_factors: [
            { factor: 'Temperature', current: '22°C', optimal: '20-25°C', impact: 'positive' },
            { factor: 'Rainfall', current: '45mm', optimal: '40-60mm', impact: 'positive' },
            { factor: 'Humidity', current: '65%', optimal: '60-70%', impact: 'neutral' },
            { factor: 'Wind speed', current: '12 km/h', optimal: '5-15 km/h', impact: 'positive' }
          ],
          forecast: Array.from({ length: 14 }, (_, i) => ({
            date: new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temperature: Math.round(18 + Math.random() * 8 + Math.sin(i * 0.3) * 3),
            rainfall: Math.round(Math.random() * 15 + Math.sin(i * 0.2) * 5),
            impact: Math.round(50 + Math.random() * 40 + Math.cos(i * 0.4) * 15)
          })),
          recommendations: [
            'Monitor soil moisture levels closely',
            'Adjust irrigation schedule based on rainfall',
            'Consider protective measures for extreme weather',
            'Plan field activities around weather windows'
          ]
        };
        
      case 'growth_optimization':
        return {
          optimization_score: Math.round(70 + Math.random() * 25),
          confidence: Math.round(75 + Math.random() * 20) / 100,
          growth_stages: [
            { stage: 'Germination', duration: '7-10 days', status: 'completed', efficiency: 95 },
            { stage: 'Vegetative', duration: '30-45 days', status: 'current', efficiency: 82 },
            { stage: 'Flowering', duration: '20-30 days', status: 'upcoming', efficiency: 0 },
            { stage: 'Fruiting', duration: '40-60 days', status: 'future', efficiency: 0 },
            { stage: 'Maturation', duration: '15-25 days', status: 'future', efficiency: 0 }
          ],
          optimization_factors: [
            { factor: 'Nutrient management', current: 78, optimal: 85, improvement: '+7 points' },
            { factor: 'Water management', current: 85, optimal: 90, improvement: '+5 points' },
            { factor: 'Light exposure', current: 92, optimal: 95, improvement: '+3 points' },
            { factor: 'Pest control', current: 88, optimal: 90, improvement: '+2 points' }
          ],
          timeline: Array.from({ length: 10 }, (_, i) => ({
            week: `Week ${i + 1}`,
            growth: Math.round(10 + (i * 8) + Math.random() * 5),
            optimal: Math.round(15 + (i * 8))
          })),
          actions: [
            'Increase nitrogen application by 15%',
            'Adjust irrigation frequency to twice weekly',
            'Apply growth hormone treatment',
            'Monitor for early pest indicators'
          ]
        };
        
      default:
        return { message: 'Unknown prediction type' };
    }
  };

  const renderYieldForecast = (prediction: Prediction) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Predicted Yield</p>
                <p className="text-2xl font-bold">{prediction.prediction_data.predicted_yield} kg/ha</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expected Harvest</p>
                <p className="text-lg font-semibold">{new Date(prediction.prediction_data.harvest_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="flex items-center gap-2">
                  <Progress value={prediction.confidence_score * 100} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(prediction.confidence_score * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yield Forecast Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prediction.prediction_data.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contributing Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.prediction_data.factors.map((factor: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="font-medium">{factor.name}</span>
                  <Badge variant={factor.status === 'favorable' ? 'default' : factor.status === 'good' ? 'secondary' : 'destructive'}>
                    {factor.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Impact: {Math.round(factor.impact * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDiseaseRisk = (prediction: Prediction) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${
                prediction.prediction_data.risk_level === 'high' ? 'text-red-500' :
                prediction.prediction_data.risk_level === 'medium' ? 'text-yellow-500' : 'text-green-500'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge variant={prediction.prediction_data.risk_level === 'high' ? 'destructive' : 
                                prediction.prediction_data.risk_level === 'medium' ? 'secondary' : 'default'}>
                  {prediction.prediction_data.risk_level.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="flex items-center gap-2">
                  <Progress value={prediction.confidence_score * 100} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(prediction.confidence_score * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disease Risk Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={prediction.prediction_data.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Disease Probabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.prediction_data.diseases.map((disease: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{disease.name}</span>
                    <Badge variant={disease.severity === 'high' ? 'destructive' : 
                                   disease.severity === 'medium' ? 'secondary' : 'default'}>
                      {disease.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={disease.probability} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{disease.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prevention Measures</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prediction.prediction_data.prevention_measures.map((measure: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  {measure}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Field</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choose a field...</option>
              {fields?.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name} - {field.crop_type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePredictions('yield_forecast')}
              disabled={loading || !selectedField}
            >
              <Target className="h-4 w-4 mr-1" />
              Yield Forecast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePredictions('disease_risk')}
              disabled={loading || !selectedField}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Disease Risk
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePredictions('weather_impact')}
              disabled={loading || !selectedField}
            >
              <CloudRain className="h-4 w-4 mr-1" />
              Weather Impact
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePredictions('growth_optimization')}
              disabled={loading || !selectedField}
            >
              <Leaf className="h-4 w-4 mr-1" />
              Growth Optimization
            </Button>
          </div>
        </CardContent>
      </Card>

      {predictions.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="yield">Yield Forecast</TabsTrigger>
            <TabsTrigger value="disease">Disease Risk</TabsTrigger>
            <TabsTrigger value="weather">Weather Impact</TabsTrigger>
            <TabsTrigger value="growth">Growth Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="yield">
            {predictions.filter(p => p.prediction_type === 'yield_forecast').map((prediction) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderYieldForecast(prediction)}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="disease">
            {predictions.filter(p => p.prediction_type === 'disease_risk').map((prediction) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderDiseaseRisk(prediction)}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="weather">
            <div className="text-center py-8 text-muted-foreground">
              Generate weather impact prediction to see analysis here
            </div>
          </TabsContent>

          <TabsContent value="growth">
            <div className="text-center py-8 text-muted-foreground">
              Generate growth optimization prediction to see analysis here
            </div>
          </TabsContent>
        </Tabs>
      )}

      {predictions.length === 0 && selectedField && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No predictions available for this field. Generate your first prediction using the buttons above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};