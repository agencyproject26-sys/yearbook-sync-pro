ALTER TABLE public.orders
  ADD COLUMN cetak_cover_status text DEFAULT 'belum',
  ADD COLUMN cetak_isi_status text DEFAULT 'belum',
  ADD COLUMN cetak_packaging_status text DEFAULT 'belum';