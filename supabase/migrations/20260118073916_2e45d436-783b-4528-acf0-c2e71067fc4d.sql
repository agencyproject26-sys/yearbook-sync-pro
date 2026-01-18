-- Fix Security Issues: Remove public calendar access, restrict salary access, remove gmail_password

-- 1. Remove public SELECT policy for calendar_events
DROP POLICY IF EXISTS "Public can view calendar_events" ON public.calendar_events;

-- 2. Restrict salaries table access to admin and owner roles only
DROP POLICY IF EXISTS "Authenticated users can read salaries" ON public.salaries;
DROP POLICY IF EXISTS "Authenticated users can insert salaries" ON public.salaries;
DROP POLICY IF EXISTS "Authenticated users can update salaries" ON public.salaries;
DROP POLICY IF EXISTS "Authenticated users can delete salaries" ON public.salaries;

-- Create role-restricted policies for salaries
CREATE POLICY "Admin/Owner can read salaries"
ON public.salaries FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admin/Owner can insert salaries"
ON public.salaries FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admin/Owner can update salaries"
ON public.salaries FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admin/Owner can delete salaries"
ON public.salaries FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- 3. Remove gmail_password column from orders table
ALTER TABLE public.orders DROP COLUMN IF EXISTS gmail_password;