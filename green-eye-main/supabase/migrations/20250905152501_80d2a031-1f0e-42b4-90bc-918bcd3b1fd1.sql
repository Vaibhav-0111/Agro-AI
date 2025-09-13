-- Create storage buckets for image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('field-images', 'field-images', true),
  ('analysis-images', 'analysis-images', false),
  ('user-avatars', 'user-avatars', true);

-- Storage policies for field-images bucket (public read, authenticated write)
CREATE POLICY "Public can view field images" ON storage.objects
  FOR SELECT USING (bucket_id = 'field-images');

CREATE POLICY "Authenticated users can upload field images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'field-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own field images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'field-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own field images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'field-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for analysis-images bucket (private)
CREATE POLICY "Users can view their own analysis images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'analysis-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload analysis images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'analysis-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own analysis images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'analysis-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own analysis images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'analysis-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for user-avatars bucket (public read, own write)
CREATE POLICY "Public can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );