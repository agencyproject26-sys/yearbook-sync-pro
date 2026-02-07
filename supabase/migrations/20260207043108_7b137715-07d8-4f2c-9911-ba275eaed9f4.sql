-- Create function to check if user is NOT calendar_only (can modify calendar)
CREATE OR REPLACE FUNCTION public.can_modify_calendar(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'owner', 'staff')
  )
$$;

-- Drop existing policies that allow all authenticated users to modify
DROP POLICY IF EXISTS "Authenticated users can insert calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can update calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can delete calendar_events" ON public.calendar_events;

-- Create new policies that only allow admin/owner/staff to modify
CREATE POLICY "Staff and above can insert calendar_events"
ON public.calendar_events
FOR INSERT
WITH CHECK (can_modify_calendar(auth.uid()));

CREATE POLICY "Staff and above can update calendar_events"
ON public.calendar_events
FOR UPDATE
USING (can_modify_calendar(auth.uid()));

CREATE POLICY "Staff and above can delete calendar_events"
ON public.calendar_events
FOR DELETE
USING (can_modify_calendar(auth.uid()));