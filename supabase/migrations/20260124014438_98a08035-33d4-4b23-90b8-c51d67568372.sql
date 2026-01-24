-- Add pics column as JSONB array to store multiple PICs with their phones
-- Format: [{"name": "PIC 1", "phones": ["081xxx", "082xxx"]}, {"name": "PIC 2", "phones": ["083xxx"]}]
ALTER TABLE public.customers 
ADD COLUMN pics jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data from pic_name and phones to the new pics column
UPDATE public.customers 
SET pics = jsonb_build_array(
  jsonb_build_object(
    'name', COALESCE(pic_name, ''),
    'phones', COALESCE(phones, ARRAY[]::text[])
  )
)
WHERE pic_name IS NOT NULL OR (phones IS NOT NULL AND array_length(phones, 1) > 0);