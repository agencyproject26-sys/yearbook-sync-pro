-- Add sph_link to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS sph_link text;

-- Add new columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS mou_link text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gmail_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gmail_password text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS spreadsheet_link text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS drive_link text;

-- Add payment_terms to invoices table for flexible termin management
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_terms jsonb DEFAULT '[]'::jsonb;