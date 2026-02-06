-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload payment proofs
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update payment proofs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view payment proofs (public bucket)
CREATE POLICY "Anyone can view payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Allow authenticated users to delete payment proofs
CREATE POLICY "Authenticated users can delete payment proofs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid() IS NOT NULL
);