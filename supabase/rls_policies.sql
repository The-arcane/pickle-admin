-- This script contains the Row Level Security (RLS) policies required for the admin dashboard.
-- These policies ensure that only authenticated users with user_type = 2 (admins) can access
-- the necessary data.
--
-- You can apply this script in the Supabase SQL Editor:
-- Go to your project -> SQL Editor -> New query

-- Helper function to check if the current authenticated user is an admin (user_type = 2).
-- Using a helper function simplifies policy creation and management.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user
    WHERE user_uuid = auth.uid() AND user_type = 2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- RLS Policies
-- =================================================================

--
-- Table: user
--
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow individual users to read their own user record.
-- This is necessary for the login flow to check the user's role.
CREATE POLICY "Allow users to read their own record"
ON public."user" FOR SELECT
TO authenticated
USING (user_uuid = auth.uid());

-- Policy: Allow admins to read all user records.
CREATE POLICY "Allow admins to read all users"
ON public."user" FOR SELECT
TO authenticated
USING (is_admin());


--
-- Table: bookings
--
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to read all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (is_admin());


--
-- Table: courts
--
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to read all courts"
ON public.courts FOR SELECT
TO authenticated
USING (is_admin());


--
-- Table: timeslots
--
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to read all timeslots"
ON public.timeslots FOR SELECT
TO authenticated
USING (is_admin());


--
-- Table: organisations
--
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to read all organisations"
ON public.organisations FOR SELECT
TO authenticated
USING (is_admin());


--
-- Table: sports
--
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to read all sports"
ON public.sports FOR SELECT
TO authenticated
USING (is_admin());


--
-- Table: availability_blocks
--
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to read all availability blocks"
ON public.availability_blocks FOR SELECT
TO authenticated
USING (is_admin());
