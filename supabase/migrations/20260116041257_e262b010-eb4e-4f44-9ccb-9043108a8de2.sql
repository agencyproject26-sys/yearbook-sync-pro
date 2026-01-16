-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  phones TEXT[] DEFAULT '{}',
  city TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'prospek' CHECK (status IN ('prospek', 'aktif', 'selesai')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'proses' CHECK (status IN ('proses', 'desain', 'cetak', 'selesai')),
  value NUMERIC NOT NULL DEFAULT 0,
  has_mou BOOLEAN DEFAULT false,
  has_spreadsheet BOOLEAN DEFAULT false,
  has_drive BOOLEAN DEFAULT false,
  wa_desc TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'photo', 'design', 'print')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  items JSONB DEFAULT '[]',
  dp_date DATE,
  dp_amount NUMERIC,
  pelunasan_date DATE,
  pelunasan_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salaries table
CREATE TABLE public.salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('photographer', 'design', 'print', 'other')),
  amount NUMERIC NOT NULL,
  description TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables (public access for now, will add auth later)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

-- Create public access policies (will be updated when auth is added)
CREATE POLICY "Allow public read access to customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to customers" ON public.customers FOR DELETE USING (true);

CREATE POLICY "Allow public read access to orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public read access to calendar_events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to calendar_events" ON public.calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to calendar_events" ON public.calendar_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to calendar_events" ON public.calendar_events FOR DELETE USING (true);

CREATE POLICY "Allow public read access to invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to invoices" ON public.invoices FOR DELETE USING (true);

CREATE POLICY "Allow public read access to payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to payments" ON public.payments FOR DELETE USING (true);

CREATE POLICY "Allow public read access to salaries" ON public.salaries FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to salaries" ON public.salaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to salaries" ON public.salaries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to salaries" ON public.salaries FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();