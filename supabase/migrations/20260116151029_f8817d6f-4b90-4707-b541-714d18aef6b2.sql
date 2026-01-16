-- Add issue_date (tanggal terbit) and company_logo_url columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN issue_date date,
ADD COLUMN company_logo_url text;