-- Helper function to get the current user's organization ID
CREATE OR REPLACE FUNCTION get_my_organisation_id()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    org_id INT;
BEGIN
    SELECT organisation_id INTO org_id
    FROM user_organisations
    WHERE user_id = (SELECT id FROM "user" WHERE user_uuid = auth.uid());
    
    RETURN org_id;
END;
$$;

-- RLS Policies for Admins (user_type = 2)

-- Organisations Table
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view their own organisation" ON public.organisations;
CREATE POLICY "Admins can view their own organisation"
ON public.organisations
FOR SELECT
TO authenticated
USING (id = get_my_organisation_id());

DROP POLICY IF EXISTS "Admins can update their own organisation" ON public.organisations;
CREATE POLICY "Admins can update their own organisation"
ON public.organisations
FOR UPDATE
TO authenticated
USING (id = get_my_organisation_id());


-- Courts Table
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage courts in their own organisation" ON public.courts;
CREATE POLICY "Admins can manage courts in their own organisation"
ON public.courts
FOR ALL
TO authenticated
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());


-- Timeslots Table
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage timeslots for their org's courts" ON public.timeslots;
CREATE POLICY "Admins can manage timeslots for their org's courts"
ON public.timeslots
FOR ALL
TO authenticated
USING (
  court_id IN (
    SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()
  )
);

-- Bookings Table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage bookings in their own organisation" ON public.bookings;
CREATE POLICY "Admins can manage bookings in their own organisation"
ON public.bookings
FOR ALL
TO authenticated
USING (
  court_id IN (
    SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()
  )
);

-- Users Table (viewing users within their org)
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view users in their own organisation" ON public.user;
CREATE POLICY "Admins can view users in their own organisation"
ON public.user
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT user_id FROM user_organisations WHERE organisation_id = get_my_organisation_id()
  )
);

-- Approvals Table
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage approvals for their own organisation" ON public.approvals;
CREATE POLICY "Admins can manage approvals for their own organisation"
ON public.approvals
FOR ALL
TO authenticated
USING (organisation_id = get_my_organisation_id());


-- Events Table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage events in their own organisation" ON public.events;
CREATE POLICY "Admins can manage events in their own organisation"
ON public.events
FOR ALL
TO authenticated
USING (organiser_org_id = get_my_organisation_id());

-- Event Bookings Table
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage event bookings in their own organisation" ON public.event_bookings;
CREATE POLICY "Admins can manage event bookings in their own organisation"
ON public.event_bookings
FOR ALL
TO authenticated
USING (
  event_id IN (
    SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()
  )
);

-- Coaches Table
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage coaches in their own organisation" ON public.coaches;
CREATE POLICY "Admins can manage coaches in their own organisation"
ON public.coaches
FOR ALL
TO authenticated
USING (organisation_id = get_my_organisation_id());

-- Residences Table
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage residences in their own organisation" ON public.residences;
CREATE POLICY "Admins can manage residences in their own organisation"
ON public.residences
FOR ALL
TO authenticated
USING (organisation_id = get_my_organisation_id());

-- Realtime Channels Table
ALTER TABLE public.realtime_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage channels in their own organisation" ON public.realtime_channels;
CREATE POLICY "Admins can manage channels in their own organisation"
ON public.realtime_channels
FOR ALL
TO authenticated
USING (owner_org_id = get_my_organisation_id());

-- Channel Invitations Table
ALTER TABLE public.channel_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage channel invitations in their own organisation" ON public.channel_invitations;
CREATE POLICY "Admins can manage channel invitations in their own organisation"
ON public.channel_invitations
FOR ALL
TO authenticated
USING (
  channel_id IN (
    SELECT id FROM realtime_channels WHERE owner_org_id = get_my_organisation_id()
  )
);

-- User Organisations Table
ALTER TABLE public.user_organisations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage user links for their own organisation" ON public.user_organisations;
CREATE POLICY "Admins can manage user links for their own organisation"
ON public.user_organisations
FOR ALL
TO authenticated
USING (organisation_id = get_my_organisation_id());

-- Employees (user_employee_permissions)
ALTER TABLE public.user_employee_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage employees in their own org" ON public.user_employee_permissions;
CREATE POLICY "Admins can manage employees in their own org"
ON public.user_employee_permissions
FOR ALL
TO authenticated
USING (
  manager_id IN (
    SELECT id FROM "user" WHERE user_uuid IN (
      SELECT user_uuid FROM "user" u JOIN user_organisations uo ON u.id = uo.user_id WHERE uo.organisation_id = get_my_organisation_id()
    )
  )
);


-- Read-only tables for Admins
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view amenities" ON public.amenities FOR SELECT TO authenticated USING (true);

ALTER TABLE public.booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view booking statuses" ON public.booking_status FOR SELECT TO authenticated USING (true);

ALTER TABLE public.event_booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view event booking statuses" ON public.event_booking_status FOR SELECT TO authenticated USING (true);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view sports" ON public.sports FOR SELECT TO authenticated USING (true);

ALTER TABLE public.organisation_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view org roles" ON public.organisation_roles FOR SELECT TO authenticated USING (true);
