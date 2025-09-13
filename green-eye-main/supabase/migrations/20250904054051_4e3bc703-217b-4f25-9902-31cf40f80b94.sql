-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'farmer',
  location TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create fields table
CREATE TABLE public.fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  area_hectares DECIMAL(10,2),
  crop_type TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  description TEXT,
  health_status TEXT DEFAULT 'good' CHECK (health_status IN ('excellent', 'good', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on fields
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Fields policies
CREATE POLICY "Users can manage their own fields" ON public.fields
  FOR ALL USING (auth.uid() = user_id);

-- Create sensors table
CREATE TABLE public.sensors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES public.fields ON DELETE CASCADE,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'moisture', 'ph', 'conductivity')),
  name TEXT NOT NULL,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning')),
  battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  last_reading_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sensors
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;

-- Sensors policies
CREATE POLICY "Users can manage sensors in their fields" ON public.sensors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.fields 
      WHERE fields.id = sensors.field_id 
      AND fields.user_id = auth.uid()
    )
  );

-- Create sensor_readings table
CREATE TABLE public.sensor_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.sensors ON DELETE CASCADE,
  value DECIMAL(10,4) NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quality_score INTEGER DEFAULT 100 CHECK (quality_score >= 0 AND quality_score <= 100)
);

-- Enable RLS on sensor_readings
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Sensor readings policies
CREATE POLICY "Users can view readings from their sensors" ON public.sensor_readings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sensors s
      JOIN public.fields f ON s.field_id = f.id
      WHERE s.id = sensor_readings.sensor_id 
      AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert sensor readings" ON public.sensor_readings
  FOR INSERT WITH CHECK (true);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields ON DELETE CASCADE,
  sensor_id UUID REFERENCES public.sensors ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('sensor_offline', 'low_moisture', 'high_temperature', 'ph_imbalance', 'low_battery', 'crop_disease', 'weather_warning')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Alerts policies
CREATE POLICY "Users can manage their own alerts" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);

-- Create image_analysis table
CREATE TABLE public.image_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  vegetation_index DECIMAL(5,4),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  disease_detected BOOLEAN DEFAULT FALSE,
  disease_type TEXT,
  confidence_score DECIMAL(5,4),
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on image_analysis
ALTER TABLE public.image_analysis ENABLE ROW LEVEL SECURITY;

-- Image analysis policies
CREATE POLICY "Users can manage their own image analysis" ON public.image_analysis
  FOR ALL USING (auth.uid() = user_id);

-- Create reports table
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('yield', 'health', 'alerts', 'performance')),
  title TEXT NOT NULL,
  parameters JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can manage their own reports" ON public.reports
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fields_updated_at
  BEFORE UPDATE ON public.fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sensors_updated_at
  BEFORE UPDATE ON public.sensors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_image_analysis_updated_at
  BEFORE UPDATE ON public.image_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.sensors REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors;