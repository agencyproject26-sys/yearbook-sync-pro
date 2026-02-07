-- Add new role 'calendar_only' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'calendar_only';

-- Update has_role function to handle new role (optional, already works)
-- Create a helper function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id uuid)
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
      AND role IN ('admin', 'owner')
  )
$$;