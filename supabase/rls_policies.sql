-- Helper function to check if the user is an admin (user_type = 2)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."user"
    WHERE
      user_uuid = auth.uid() AND
      user_type = 2
  );
$$;

-- Enable RLS for all relevant tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts before creating new ones
DROP POLICY IF EXISTS "Allow admins to read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow admins to read all courts" ON public.courts;
DROP POLICY IF EXISTS "Allow admins to read all organisations" ON public.organisations;
DROP POLICY IF EXISTS "Allow admins to read all sports" ON public.sports;
DROP POLICY IF EXISTS "Allow admins to read all timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Allow admins to read user type 1" ON public."user";
DROP POLICY IF EXISTS "Allow users to read their own data" ON public."user";
DROP POLICY IF EXISTS "Allow access to own record and type 1 users for admins" ON public."user";


-- == RLS POLICIES ==

-- Policy: Allow admins to read all booking records.
CREATE POLICY "Allow admins to read all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (is_admin());

-- Policy: Allow admins to read all court records.
CREATE POLICY "Allow admins to read all courts"
ON public.courts FOR SELECT
TO authenticated
USING (is_admin());

-- Policy: Allow admins to read all organisation records.
CREATE POLICY "Allow admins to read all organisations"
ON public.organisations FOR SELECT
TO authenticated
USING (is_admin());

-- Policy: Allow admins to read all sport records.
CREATE POLICY "Allow admins to read all sports"
ON public.sports FOR SELECT
TO authenticated
USING (is_admin());

-- Policy: Allow admins to read all timeslot records.
CREATE POLICY "Allow admins to read all timeslots"
ON public.timeslots FOR SELECT
TO authenticated
USING (is_admin());

-- Policy for USER table
-- Allows any user to see their own record, and allows admins to see records for type 1 users.
CREATE POLICY "Allow access to own record and type 1 users for admins"
ON public."user" FOR SELECT
TO authenticated
USING (
  (user_uuid = auth.uid()) OR
  (
    (SELECT user_type FROM public.user WHERE user_uuid = auth.uid()) = 2
    AND
    "user".user_type = 1
  )
);
