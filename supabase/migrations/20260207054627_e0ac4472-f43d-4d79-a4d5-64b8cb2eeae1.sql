-- Add pic_name column to payments table
ALTER TABLE public.payments 
ADD COLUMN pic_name text;