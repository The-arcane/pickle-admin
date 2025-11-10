-- This script creates all the necessary storage buckets for the application
-- and applies Row Level Security (RLS) policies to them.
-- It's designed to be idempotent, meaning it can be run multiple times without causing errors.

-- =================================================================
-- 1. Create `court-images` Bucket
-- For main court images and court gallery images.
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('court-images', 'court-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for `court-images`
-- Allow public read access
CREATE POLICY "Public Read Access for court-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'court-images');

-- Allow authenticated users to upload, update, and delete
CREATE POLICY "Authenticated Write Access for court-images"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =================================================================
-- 2. Create `event-gallery` Bucket
-- For event cover images and event gallery images.
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-gallery', 'event-gallery', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for `event-gallery`
-- Allow public read access
CREATE POLICY "Public Read Access for event-gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-gallery');

-- Allow authenticated users to write
CREATE POLICY "Authenticated Write Access for event-gallery"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =================================================================
-- 3. Create `organisation-logos` Bucket
-- For logos of all organizations.
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('organisation-logos', 'organisation-logos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for `organisation-logos`
-- Allow public read access
CREATE POLICY "Public Read Access for organisation-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organisation-logos');

-- Allow authenticated users (specifically admins/sales) to write
CREATE POLICY "Authenticated Write Access for organisation-logos"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =================================================================
-- 4. Create `coach-profiles` Bucket
-- For profile pictures of coaches.
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-profiles', 'coach-profiles', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for `coach-profiles`
-- Allow public read access
CREATE POLICY "Public Read Access for coach-profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'coach-profiles');

-- Allow authenticated users to write
CREATE POLICY "Authenticated Write Access for coach-profiles"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =================================================================
-- 5. Create `advertisements` Bucket
-- For advertisement creative images.
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('advertisements', 'advertisements', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for `advertisements`
-- Allow public read access
CREATE POLICY "Public Read Access for advertisements"
ON storage.objects FOR SELECT
USING (bucket_id = 'advertisements');

-- Allow authenticated users (admins) to write
CREATE POLICY "Authenticated Write Access for advertisements"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- =================================================================
-- 6. Create `organisation-websites` Bucket
-- For images used on public-facing organization web pages.
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('organisation-websites', 'organisation-websites', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for `organisation-websites`
-- Allow public read access
CREATE POLICY "Public Read Access for organisation-websites"
ON storage.objects FOR SELECT
USING (bucket_id = 'organisation-websites');

-- Allow authenticated users (sales/super-admin) to write
CREATE POLICY "Authenticated Write Access for organisation-websites"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Note: The policies above are intentionally broad for simplicity. In a production environment,
-- you would create more granular policies, likely using security definer functions,
-- to check if a user is an admin of the specific organization they are trying to upload an image for.
-- For example: `USING (is_org_admin(auth.uid(), (storage.foldername(name))[1]::bigint))`
-- where `is_org_admin` is a custom SQL function.
