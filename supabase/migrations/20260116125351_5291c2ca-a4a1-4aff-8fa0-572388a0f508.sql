-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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
      AND role = _role
  )
$$;

-- Create function to check if user is authenticated (for RLS)
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- Policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for user_roles: only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop all existing public access policies
DROP POLICY IF EXISTS "Allow public delete access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public update access to customers" ON public.customers;

DROP POLICY IF EXISTS "Allow public delete access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON public.orders;

DROP POLICY IF EXISTS "Allow public delete access to calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow public insert access to calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow public read access to calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow public update access to calendar_events" ON public.calendar_events;

DROP POLICY IF EXISTS "Allow public delete access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public insert access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public read access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public update access to invoices" ON public.invoices;

DROP POLICY IF EXISTS "Allow public delete access to payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public insert access to payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public read access to payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public update access to payments" ON public.payments;

DROP POLICY IF EXISTS "Allow public delete access to salaries" ON public.salaries;
DROP POLICY IF EXISTS "Allow public insert access to salaries" ON public.salaries;
DROP POLICY IF EXISTS "Allow public read access to salaries" ON public.salaries;
DROP POLICY IF EXISTS "Allow public update access to salaries" ON public.salaries;

-- Create authenticated-only RLS policies for customers
CREATE POLICY "Authenticated users can read customers"
ON public.customers FOR SELECT TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert customers"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update customers"
ON public.customers FOR UPDATE TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete customers"
ON public.customers FOR DELETE TO authenticated
USING (public.is_authenticated());

-- Create authenticated-only RLS policies for orders
CREATE POLICY "Authenticated users can read orders"
ON public.orders FOR SELECT TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete orders"
ON public.orders FOR DELETE TO authenticated
USING (public.is_authenticated());

-- Create authenticated-only RLS policies for calendar_events
CREATE POLICY "Authenticated users can read calendar_events"
ON public.calendar_events FOR SELECT TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert calendar_events"
ON public.calendar_events FOR INSERT TO authenticated
WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update calendar_events"
ON public.calendar_events FOR UPDATE TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete calendar_events"
ON public.calendar_events FOR DELETE TO authenticated
USING (public.is_authenticated());

-- Create authenticated-only RLS policies for invoices
CREATE POLICY "Authenticated users can read invoices"
ON public.invoices FOR SELECT TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert invoices"
ON public.invoices FOR INSERT TO authenticated
WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update invoices"
ON public.invoices FOR UPDATE TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete invoices"
ON public.invoices FOR DELETE TO authenticated
USING (public.is_authenticated());

-- Create authenticated-only RLS policies for payments
CREATE POLICY "Authenticated users can read payments"
ON public.payments FOR SELECT TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update payments"
ON public.payments FOR UPDATE TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete payments"
ON public.payments FOR DELETE TO authenticated
USING (public.is_authenticated());

-- Create authenticated-only RLS policies for salaries
CREATE POLICY "Authenticated users can read salaries"
ON public.salaries FOR SELECT TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can insert salaries"
ON public.salaries FOR INSERT TO authenticated
WITH CHECK (public.is_authenticated());

CREATE POLICY "Authenticated users can update salaries"
ON public.salaries FOR UPDATE TO authenticated
USING (public.is_authenticated());

CREATE POLICY "Authenticated users can delete salaries"
ON public.salaries FOR DELETE TO authenticated
USING (public.is_authenticated());