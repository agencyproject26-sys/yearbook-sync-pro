-- Create company_settings table for storing permanent logo and signature
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read company_settings"
ON public.company_settings
FOR SELECT
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert company_settings"
ON public.company_settings
FOR INSERT
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update company_settings"
ON public.company_settings
FOR UPDATE
USING (is_authenticated());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-signatures', 'company-signatures', true);

-- Create policies for signatures bucket
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'company-signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view signatures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-signatures');

CREATE POLICY "Authenticated users can update signatures"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'company-signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete signatures"
ON storage.objects
FOR DELETE
USING (bucket_id = 'company-signatures' AND auth.uid() IS NOT NULL);