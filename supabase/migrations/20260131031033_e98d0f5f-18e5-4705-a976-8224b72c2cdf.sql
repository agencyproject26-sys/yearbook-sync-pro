-- Add proof_link column to payments table for Google Drive links
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS proof_link text;