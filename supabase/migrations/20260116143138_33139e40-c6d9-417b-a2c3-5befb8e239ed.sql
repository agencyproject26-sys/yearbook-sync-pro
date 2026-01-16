-- Add public read policy for calendar_events (view-only for non-authenticated users)
CREATE POLICY "Public can view calendar_events" 
ON public.calendar_events 
FOR SELECT 
USING (true);