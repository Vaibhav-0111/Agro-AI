-- Create batch image analysis table
CREATE TABLE public.batch_image_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_id UUID REFERENCES public.fields(id),
  analysis_type TEXT NOT NULL DEFAULT 'comprehensive',
  total_images INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  results_summary JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create advanced image results table
CREATE TABLE public.advanced_image_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batch_image_analysis(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  crop_health JSONB,
  disease_analysis JSONB,
  pest_analysis JSONB,
  growth_stage JSONB,
  soil_quality JSONB,
  overall_score NUMERIC(5,2),
  recommendations TEXT[],
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  error_message TEXT,
  analysis_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictive analytics table
CREATE TABLE public.predictive_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_id UUID REFERENCES public.fields(id),
  prediction_type TEXT NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence_score NUMERIC(3,2),
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_outcome JSONB,
  accuracy_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather correlation table
CREATE TABLE public.weather_correlations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES public.fields(id),
  weather_data JSONB NOT NULL,
  crop_response JSONB,
  correlation_score NUMERIC(3,2),
  analysis_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.batch_image_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_image_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_correlations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for batch_image_analysis
CREATE POLICY "Users can view their own batch analyses" 
ON public.batch_image_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batch analyses" 
ON public.batch_image_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batch analyses" 
ON public.batch_image_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for advanced_image_results
CREATE POLICY "Users can view results from their batches" 
ON public.advanced_image_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.batch_image_analysis 
    WHERE id = batch_id AND user_id = auth.uid()
  )
);

CREATE POLICY "System can insert analysis results" 
ON public.advanced_image_results 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for predictive_analytics
CREATE POLICY "Users can view their own predictions" 
ON public.predictive_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions" 
ON public.predictive_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions" 
ON public.predictive_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for weather_correlations
CREATE POLICY "Users can view weather correlations for their fields" 
ON public.weather_correlations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.fields 
    WHERE id = field_id AND user_id = auth.uid()
  )
);

CREATE POLICY "System can insert weather correlations" 
ON public.weather_correlations 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_batch_image_analysis_user_id ON public.batch_image_analysis(user_id);
CREATE INDEX idx_batch_image_analysis_field_id ON public.batch_image_analysis(field_id);
CREATE INDEX idx_batch_image_analysis_status ON public.batch_image_analysis(status);

CREATE INDEX idx_advanced_image_results_batch_id ON public.advanced_image_results(batch_id);
CREATE INDEX idx_advanced_image_results_overall_score ON public.advanced_image_results(overall_score);

CREATE INDEX idx_predictive_analytics_user_id ON public.predictive_analytics(user_id);
CREATE INDEX idx_predictive_analytics_field_id ON public.predictive_analytics(field_id);
CREATE INDEX idx_predictive_analytics_prediction_date ON public.predictive_analytics(prediction_date);

CREATE INDEX idx_weather_correlations_field_id ON public.weather_correlations(field_id);
CREATE INDEX idx_weather_correlations_analysis_date ON public.weather_correlations(analysis_date);

-- Create updated_at triggers
CREATE TRIGGER update_predictive_analytics_updated_at
  BEFORE UPDATE ON public.predictive_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();