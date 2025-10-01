-- Enable realtime for additional domain tables
-- This assumes the tables already exist; if not, the statements will fail.

-- Use FULL replica identity so row-level data is included in change payloads
DO $$
BEGIN
  -- Fields
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fields') THEN
    EXECUTE 'ALTER TABLE public.fields REPLICA IDENTITY FULL';
  END IF;

  -- Predictive analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'predictive_analytics') THEN
    EXECUTE 'ALTER TABLE public.predictive_analytics REPLICA IDENTITY FULL';
  END IF;

  -- Advanced image results
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advanced_image_results') THEN
    EXECUTE 'ALTER TABLE public.advanced_image_results REPLICA IDENTITY FULL';
  END IF;

  -- Batch image analysis
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'batch_image_analysis') THEN
    EXECUTE 'ALTER TABLE public.batch_image_analysis REPLICA IDENTITY FULL';
  END IF;

  -- Image analysis
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'image_analysis') THEN
    EXECUTE 'ALTER TABLE public.image_analysis REPLICA IDENTITY FULL';
  END IF;

  -- Reports
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
    EXECUTE 'ALTER TABLE public.reports REPLICA IDENTITY FULL';
  END IF;

  -- Weather correlations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weather_correlations') THEN
    EXECUTE 'ALTER TABLE public.weather_correlations REPLICA IDENTITY FULL';
  END IF;
END $$;

-- Add tables to the supabase_realtime publication if present
DO $$
DECLARE
  pub_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO pub_exists;

  IF pub_exists THEN
    -- Use dynamic checks to avoid errors if a table is missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fields') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.fields';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'predictive_analytics') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.predictive_analytics';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advanced_image_results') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.advanced_image_results';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'batch_image_analysis') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_image_analysis';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'image_analysis') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.image_analysis';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.reports';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weather_correlations') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_correlations';
    END IF;
  END IF;
END $$;


