import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useFields } from "@/hooks/useSupabaseData";
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Bug,
  Sprout,
  Thermometer,
  Droplets
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AnalysisResult {
  id: string;
  image_url: string;
  crop_health: any;
  disease_analysis: any;
  pest_analysis: any;
  growth_stage: any;
  soil_quality: any;
  overall_score: number;
  recommendations: string[];
}

interface BatchAnalysis {
  id: string;
  status: string;
  total_images: number;
  results_summary?: any;
}

export const AdvancedImageAnalysis = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [batchAnalysis, setBatchAnalysis] = useState<BatchAnalysis | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [progress, setProgress] = useState(0);

  const { fields } = useFields();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxFiles: 10
  });

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `analysis-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('analysis-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('analysis-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const startAnalysis = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    if (!selectedField) {
      toast.error("Please select a field");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Upload images
      const imageUrls = await uploadImages(selectedFiles);
      setProgress(30);

      // Start analysis
      setUploading(false);
      setAnalyzing(true);

      const { data, error } = await supabase.functions.invoke('advanced-image-analysis', {
        body: {
          imageUrls,
          fieldId: selectedField,
          analysisType
        }
      });

      if (error) {
        throw error;
      }

      setBatchAnalysis(data);
      setProgress(50);
      
      // Poll for results
      pollForResults(data.batchAnalysisId);
      
      toast.success("Analysis started! This may take a few minutes...");
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to start analysis");
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const pollForResults = async (batchId: string) => {
    const interval = setInterval(async () => {
      try {
        // Check batch status
        const { data: batch, error: batchError } = await supabase
          .from('batch_image_analysis')
          .select('*')
          .eq('id', batchId)
          .single();

        if (batchError) throw batchError;

        if (batch.status === 'completed') {
          setBatchAnalysis(batch);
          
          // Get individual results
          const { data: results, error: resultsError } = await supabase
            .from('advanced_image_results')
            .select('*')
            .eq('batch_id', batchId);

          if (resultsError) throw resultsError;

          setAnalysisResults(results || []);
          setProgress(100);
          setAnalyzing(false);
          clearInterval(interval);
          
          toast.success("Analysis completed!");
          
        } else if (batch.status === 'failed') {
          setBatchAnalysis(batch);
          setAnalyzing(false);
          clearInterval(interval);
          toast.error("Analysis failed");
        } else {
          // Update progress
          const currentProgress = Math.min(90, 50 + (Date.now() - new Date(batch.created_at).getTime()) / 1000 * 2);
          setProgress(currentProgress);
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        setAnalyzing(false);
      }
    }, 3000);

    // Cleanup after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (analyzing) {
        setAnalyzing(false);
        toast.error("Analysis timeout - please try again");
      }
    }, 600000);
  };

  const renderAnalysisCard = (result: AnalysisResult) => (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Image Analysis Result
            <Badge variant={result.overall_score >= 80 ? "default" : result.overall_score >= 60 ? "secondary" : "destructive"}>
              Score: {result.overall_score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img 
              src={result.image_url} 
              alt="Analysis" 
              className="w-full h-full object-cover"
            />
          </div>

          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="disease">Disease</TabsTrigger>
              <TabsTrigger value="pests">Pests</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Crop Health Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={result.crop_health?.health_score || 0} className="flex-1" />
                    <span className="text-sm font-medium">{result.crop_health?.health_score || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vegetation Density</p>
                  <div className="flex items-center gap-2">
                    <Progress value={result.crop_health?.vegetation_density || 0} className="flex-1" />
                    <span className="text-sm font-medium">{result.crop_health?.vegetation_density || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Conditions:</p>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Water: {result.crop_health?.water_status || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Nutrients: {result.crop_health?.nutrient_status || 'Unknown'}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="disease" className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Disease Analysis</span>
              </div>
              {result.disease_analysis?.diseases_detected ? (
                <div className="space-y-2">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Disease detected: {result.disease_analysis.disease_types?.join(', ')}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <Badge variant="destructive">{result.disease_analysis.severity_level}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Affected Area</p>
                      <span className="text-sm font-medium">{result.disease_analysis.affected_area_percentage}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">No diseases detected</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pests" className="space-y-3">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                <span className="font-semibold">Pest Analysis</span>
              </div>
              {result.pest_analysis?.pests_detected ? (
                <div className="space-y-2">
                  <Alert>
                    <Bug className="h-4 w-4" />
                    <AlertDescription>
                      Pests detected: {result.pest_analysis.pest_types?.join(', ')}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Infestation Level</p>
                      <Badge variant="destructive">{result.pest_analysis.infestation_level}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Damage</p>
                      <span className="text-sm font-medium">{result.pest_analysis.damage_percentage}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">No pests detected</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="growth" className="space-y-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Growth Stage Analysis</span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stage</p>
                    <Badge>{result.growth_stage?.growth_stage || 'Unknown'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Development</p>
                    <div className="flex items-center gap-2">
                      <Progress value={result.growth_stage?.development_percentage || 0} className="flex-1" />
                      <span className="text-sm font-medium">{result.growth_stage?.development_percentage || 0}%</span>
                    </div>
                  </div>
                </div>
                {result.growth_stage?.days_to_harvest && (
                  <p className="text-sm">
                    <span className="font-medium">Estimated harvest:</span> {result.growth_stage.days_to_harvest} days
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Recommendations:</h4>
              <ul className="space-y-1">
                {result.recommendations.slice(0, 5).map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Advanced Image Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field Selection */}
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

          {/* Analysis Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="comprehensive">Comprehensive Analysis</option>
              <option value="health_focused">Health Focused</option>
              <option value="disease_detection">Disease Detection</option>
              <option value="pest_monitoring">Pest Monitoring</option>
            </select>
          </div>

          {/* File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary">Drop the images here...</p>
            ) : (
              <div>
                <p className="font-medium">Drag & drop images here, or click to select</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Support for JPEG, PNG, WebP (max 10 images)
                </p>
              </div>
            )}
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Images ({selectedFiles.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {(uploading || analyzing) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {uploading ? 'Uploading images...' : 'Analyzing images...'}
                </span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={startAnalysis}
            disabled={uploading || analyzing || selectedFiles.length === 0 || !selectedField}
            className="w-full"
          >
            {uploading || analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploading ? 'Uploading...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Batch Summary */}
      {batchAnalysis && batchAnalysis.results_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{batchAnalysis.results_summary.successful_analyses}</p>
                <p className="text-sm text-muted-foreground">Images Analyzed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{Math.round(batchAnalysis.results_summary.average_health_score)}</p>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{batchAnalysis.results_summary.common_issues?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Issues Found</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{batchAnalysis.results_summary.priority_recommendations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Recommendations</p>
              </div>
            </div>

            {batchAnalysis.results_summary.priority_recommendations && (
              <div className="space-y-2">
                <h4 className="font-semibold">Priority Recommendations:</h4>
                <ul className="space-y-1">
                  {batchAnalysis.results_summary.priority_recommendations.slice(0, 5).map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Individual Results */}
      {analysisResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Individual Analysis Results</h3>
          {analysisResults.map((result) => renderAnalysisCard(result))}
        </div>
      )}
    </div>
  );
};