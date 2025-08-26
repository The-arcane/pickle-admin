
-- Enable RLS for all tables
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(t_name) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- Policies for Residence Users (user_type = 1)
-- They should only be able to see/edit their own data.
-- This is a placeholder, more specific policies will be needed.
-- We are starting with a broad view policy for associated data.

-- Policies for Super Admins (user_type = 3)
-- Super Admins can see all data.
CREATE POLICY "Super admin users can view all data"
ON public.organisations
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all users"
ON public.user
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all user_organisations"
ON public.user_organisations
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all courts"
ON public.courts
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all timeslots"
ON public.timeslots
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all event_bookings"
ON public.event_bookings
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all approvals"
ON public.approvals
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all residences"
ON public.residences
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all channels"
ON public.realtime_channels
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all channel_invitations"
ON public.channel_invitations
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all coaches"
ON public.coaches
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all packages"
ON public.packages
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);

CREATE POLICY "Super admin can view all package bookings"
ON public.package_bookings
FOR SELECT
TO authenticated
USING (get_my_user_type() = 3);
