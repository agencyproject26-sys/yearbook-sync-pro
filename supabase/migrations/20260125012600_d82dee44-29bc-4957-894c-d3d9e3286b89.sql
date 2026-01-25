-- Add design link columns to orders table
ALTER TABLE public.orders 
ADD COLUMN design_cover_link text,
ADD COLUMN design_isi_link text,
ADD COLUMN design_packaging_link text;