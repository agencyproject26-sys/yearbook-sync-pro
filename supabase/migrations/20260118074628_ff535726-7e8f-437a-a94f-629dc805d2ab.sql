-- Fix 1: Make company-signatures bucket private (security sensitive)
UPDATE storage.buckets SET public = false WHERE id = 'company-signatures';

-- Add storage RLS policies for company-signatures (authenticated access only)
CREATE POLICY "Authenticated users can view company signatures"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-signatures' AND (SELECT is_authenticated()));

CREATE POLICY "Authenticated users can upload company signatures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-signatures' AND (SELECT is_authenticated()));

CREATE POLICY "Authenticated users can update company signatures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-signatures' AND (SELECT is_authenticated()));

CREATE POLICY "Authenticated users can delete company signatures"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-signatures' AND (SELECT is_authenticated()));

-- Fix 2: Add public SELECT policy for calendar_events (intentional feature per context)
CREATE POLICY "Public can read calendar_events"
ON public.calendar_events
FOR SELECT
TO anon
USING (true);