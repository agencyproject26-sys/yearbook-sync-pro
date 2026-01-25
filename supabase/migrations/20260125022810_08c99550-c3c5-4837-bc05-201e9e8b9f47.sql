-- Add deleted_at column to all main tables for soft delete functionality

-- Customers table
ALTER TABLE public.customers ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Orders table
ALTER TABLE public.orders ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Invoices table
ALTER TABLE public.invoices ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Payments table
ALTER TABLE public.payments ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Calendar events table
ALTER TABLE public.calendar_events ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Salaries table
ALTER TABLE public.salaries ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Create indexes for better performance on deleted_at queries
CREATE INDEX idx_customers_deleted_at ON public.customers(deleted_at);
CREATE INDEX idx_orders_deleted_at ON public.orders(deleted_at);
CREATE INDEX idx_invoices_deleted_at ON public.invoices(deleted_at);
CREATE INDEX idx_payments_deleted_at ON public.payments(deleted_at);
CREATE INDEX idx_calendar_events_deleted_at ON public.calendar_events(deleted_at);
CREATE INDEX idx_salaries_deleted_at ON public.salaries(deleted_at);