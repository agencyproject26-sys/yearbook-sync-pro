-- Add kecamatan and kelurahan columns to customers table
ALTER TABLE public.customers 
ADD COLUMN kecamatan TEXT,
ADD COLUMN kelurahan TEXT;