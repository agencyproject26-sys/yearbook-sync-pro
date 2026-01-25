-- Add design status columns to orders table
ALTER TABLE public.orders
ADD COLUMN design_cover_status text DEFAULT 'belum_mulai',
ADD COLUMN design_isi_status text DEFAULT 'belum_mulai',
ADD COLUMN design_packaging_status text DEFAULT 'belum_mulai';