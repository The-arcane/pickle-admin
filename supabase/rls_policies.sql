-- Helper function to check if the user is an admin (user_type = 2)
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.user
    where user.user_uuid = auth.uid() and user.user_type = 2
  );
$$;

-- Enable RLS for all relevant tables
alter table public.user enable row level security;
alter table public.bookings enable row level security;
alter table public.courts enable row level security;
alter table public.organisations enable row level security;
alter table public.sports enable row level security;
alter table public.timeslots enable row level security;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow admins to read all users" ON public.user;
DROP POLICY IF EXISTS "Allow admins to read regular users" ON public.user;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.user;
DROP POLICY IF EXISTS "Allow admins to read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow admins to read all courts" ON public.courts;
DROP POLICY IF EXISTS "Allow admins to read all organisations" ON public.organisations;
DROP POLICY IF EXISTS "Allow admins to read all sports" ON public.sports;
DROP POLICY IF EXISTS "Allow admins to read all timeslots" ON public.timeslots;

-- Policies for 'user' table
-- Policy: Allow admins to read only regular user records (user_type = 1).
CREATE POLICY "Allow admins to read regular users"
ON public.user FOR SELECT
TO authenticated
USING (is_admin() and user_type = 1);

-- Policy: Allow individual users to read their own profile.
CREATE POLICY "Allow users to read their own profile"
ON public.user FOR SELECT
TO authenticated
USING (user_uuid = auth.uid());


-- Policies for other tables (admins only)
CREATE POLICY "Allow admins to read all bookings" ON public.bookings FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Allow admins to read all courts" ON public.courts FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Allow admins to read all organisations" ON public.organisations FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Allow admins to read all sports" ON public.sports FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Allow admins to read all timeslots" ON public.timeslots FOR SELECT TO authenticated USING (is_admin());
