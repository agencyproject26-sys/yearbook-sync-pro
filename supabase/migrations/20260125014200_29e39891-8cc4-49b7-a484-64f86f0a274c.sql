-- Add WhatsApp group link column to orders table
ALTER TABLE public.orders
ADD COLUMN wa_group_link text DEFAULT NULL;