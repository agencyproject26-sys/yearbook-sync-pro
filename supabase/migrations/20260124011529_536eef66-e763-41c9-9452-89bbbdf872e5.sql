-- Drop overly permissive write policies on company_settings
DROP POLICY IF EXISTS "Authenticated users can insert company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can update company_settings" ON public.company_settings;

-- Create role-restricted write policies for company_settings
CREATE POLICY "Admin/Owner can insert company_settings"
ON public.company_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admin/Owner can update company_settings"
ON public.company_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));