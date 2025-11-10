-- Step 1: Add the foreign key column to advertisement_placements
-- This links each placement to a specific type (web or mobile).
ALTER TABLE public.advertisement_placements
ADD COLUMN IF NOT EXISTS type_id BIGINT REFERENCES public.advertisement_types(id);

-- Add an index for performance
CREATE INDEX IF NOT EXISTS idx_ad_placements_type_id ON public.advertisement_placements(type_id);


-- Step 2: Update existing placements to assign them to a type using subqueries
-- This is a safer way that does not assume the IDs for 'web' and 'mobile'.

-- Assign mobile placements
UPDATE public.advertisement_placements
SET type_id = (SELECT id FROM public.advertisement_types WHERE type_name = 'mobile')
WHERE id IN (1, 2, 3); -- Home Screen Banner, Booking Confirmation Pop-up, Profile Page Footer

-- Assign web placements
UPDATE public.advertisement_placements
SET type_id = (SELECT id FROM public.advertisement_types WHERE type_name = 'web')
WHERE id IN (4, 5, 6); -- Dashboard Sidebar, Login Page Banner, Global Footer


-- Step 3: Now that data is populated, make the column NOT NULL for future entries.
ALTER TABLE public.advertisement_placements
ALTER COLUMN type_id SET NOT NULL;
