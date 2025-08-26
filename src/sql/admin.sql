-- src/sql/admin.sql

-- Helper function to get the organization ID of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_organisation_id()
RETURNS INT AS $$
DECLARE
    organisation_id_val INT;
BEGIN
    SELECT o.organisation_id INTO organisation_id_val
    FROM user_organisations o
    JOIN "user" u ON o.user_id = u.id
    WHERE u.user_uuid = auth.uid()
    LIMIT 1;
    RETURN organisation_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- Table: approvals
-- =================================================================
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage approvals in their own org" ON approvals;
CREATE POLICY "Allow admins to manage approvals in their own org" ON approvals
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: availability_blocks
-- =================================================================
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage availability_blocks for their org's courts" ON availability_blocks;
CREATE POLICY "Allow admins to manage availability_blocks for their org's courts" ON availability_blocks
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: booking_logs
-- =================================================================
ALTER TABLE booking_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage booking_logs for their org's bookings" ON booking_logs;
CREATE POLICY "Allow admins to manage booking_logs for their org's bookings" ON booking_logs
FOR ALL
USING (
    booking_id IN (SELECT id FROM bookings WHERE court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()))
)
WITH CHECK (
    booking_id IN (SELECT id FROM bookings WHERE court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()))
);

-- =================================================================
-- Table: bookings
-- =================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage bookings in their own org" ON bookings;
CREATE POLICY "Allow admins to manage bookings in their own org" ON bookings
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: channel_invitations
-- =================================================================
ALTER TABLE channel_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage channel invitations in their own org" ON channel_invitations;
CREATE POLICY "Allow admins to manage channel invitations in their own org" ON channel_invitations
FOR ALL
USING (
    channel_id IN (SELECT id FROM realtime_channels WHERE owner_org_id = get_my_organisation_id())
)
WITH CHECK (
    channel_id IN (SELECT id FROM realtime_channels WHERE owner_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: channel_members
-- =================================================================
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage channel members in their own org" ON channel_members;
CREATE POLICY "Allow admins to manage channel members in their own org" ON channel_members
FOR ALL
USING (
    channel_id IN (SELECT id FROM realtime_channels WHERE owner_org_id = get_my_organisation_id())
)
WITH CHECK (
    channel_id IN (SELECT id FROM realtime_channels WHERE owner_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: coach_pricing
-- =================================================================
ALTER TABLE coach_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage coach_pricing for their org's coaches" ON coach_pricing;
CREATE POLICY "Allow admins to manage coach_pricing for their org's coaches" ON coach_pricing
FOR ALL
USING (
    coach_id IN (SELECT id FROM coaches WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    coach_id IN (SELECT id FROM coaches WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: coach_sports
-- =================================================================
ALTER TABLE coach_sports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage coach_sports for their org's coaches" ON coach_sports;
CREATE POLICY "Allow admins to manage coach_sports for their org's coaches" ON coach_sports
FOR ALL
USING (
    coach_id IN (SELECT id FROM coaches WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    coach_id IN (SELECT id FROM coaches WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: coaches
-- =================================================================
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage coaches in their own org" ON coaches;
CREATE POLICY "Allow admins to manage coaches in their own org" ON coaches
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: court_amenities
-- =================================================================
ALTER TABLE court_amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage court_amenities for their org's courts" ON court_amenities;
CREATE POLICY "Allow admins to manage court_amenities for their org's courts" ON court_amenities
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: court_contacts
-- =================================================================
ALTER TABLE court_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage court_contacts for their org's courts" ON court_contacts;
CREATE POLICY "Allow admins to manage court_contacts for their org's courts" ON court_contacts
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: court_gallery
-- =================================================================
ALTER TABLE court_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage court_gallery for their org's courts" ON court_gallery;
CREATE POLICY "Allow admins to manage court_gallery for their org's courts" ON court_gallery
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: court_reviews
-- =================================================================
ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage court_reviews for their org's courts" ON court_reviews;
CREATE POLICY "Allow admins to manage court_reviews for their org's courts" ON court_reviews
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: court_rules
-- =================================================================
ALTER TABLE court_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage court_rules for their org's courts" ON court_rules;
CREATE POLICY "Allow admins to manage court_rules for their org's courts" ON court_rules
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: courts
-- =================================================================
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage courts in their own org" ON courts;
CREATE POLICY "Allow admins to manage courts in their own org" ON courts
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: event_bookings
-- =================================================================
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage event_bookings for their org's events" ON event_bookings;
CREATE POLICY "Allow admins to manage event_bookings for their org's events" ON event_bookings
FOR ALL
USING (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
)
WITH CHECK (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: event_category_map
-- =================================================================
ALTER TABLE event_category_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage event_category_map for their org's events" ON event_category_map;
CREATE POLICY "Allow admins to manage event_category_map for their org's events" ON event_category_map
FOR ALL
USING (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
)
WITH CHECK (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: event_gallery_images
-- =================================================================
ALTER TABLE event_gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage event_gallery for their org's events" ON event_gallery_images;
CREATE POLICY "Allow admins to manage event_gallery for their org's events" ON event_gallery_images
FOR ALL
USING (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
)
WITH CHECK (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: event_sub_events
-- =================================================================
ALTER TABLE event_sub_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage sub_events for their org's events" ON event_sub_events;
CREATE POLICY "Allow admins to manage sub_events for their org's events" ON event_sub_events
FOR ALL
USING (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
)
WITH CHECK (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: event_tag_map
-- =================================================================
ALTER TABLE event_tag_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage event_tag_map for their org's events" ON event_tag_map;
CREATE POLICY "Allow admins to manage event_tag_map for their org's events" ON event_tag_map
FOR ALL
USING (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
)
WITH CHECK (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: event_what_to_bring
-- =================================================================
ALTER TABLE event_what_to_bring ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage what_to_bring for their org's events" ON event_what_to_bring;
CREATE POLICY "Allow admins to manage what_to_bring for their org's events" ON event_what_to_bring
FOR ALL
USING (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
)
WITH CHECK (
    event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id())
);

-- =================================================================
-- Table: events
-- =================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage events in their own org" ON events;
CREATE POLICY "Allow admins to manage events in their own org" ON events
FOR ALL
USING (organiser_org_id = get_my_organisation_id())
WITH CHECK (organiser_org_id = get_my_organisation_id());

-- =================================================================
-- Table: package_bookings
-- =================================================================
ALTER TABLE package_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage package_bookings in their own org" ON package_bookings;
CREATE POLICY "Allow admins to manage package_bookings in their own org" ON package_bookings
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: packages
-- =================================================================
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage packages in their own org" ON packages;
CREATE POLICY "Allow admins to manage packages in their own org" ON packages
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: realtime_channels
-- =================================================================
ALTER TABLE realtime_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage channels in their own org" ON realtime_channels;
CREATE POLICY "Allow admins to manage channels in their own org" ON realtime_channels
FOR ALL
USING (owner_org_id = get_my_organisation_id())
WITH CHECK (owner_org_id = get_my_organisation_id());

-- =================================================================
-- Table: recurring_unavailability
-- =================================================================
ALTER TABLE recurring_unavailability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage recurring_unavailability for their org's courts" ON recurring_unavailability;
CREATE POLICY "Allow admins to manage recurring_unavailability for their org's courts" ON recurring_unavailability
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: residences
-- =================================================================
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage residences in their own org" ON residences;
CREATE POLICY "Allow admins to manage residences in their own org" ON residences
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: timeslots
-- =================================================================
ALTER TABLE timeslots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage timeslots for their org's courts" ON timeslots;
CREATE POLICY "Allow admins to manage timeslots for their org's courts" ON timeslots
FOR ALL
USING (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: user_employee_entity_permissions
-- =================================================================
ALTER TABLE user_employee_entity_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage permissions for employees in their org" ON user_employee_entity_permissions;
CREATE POLICY "Allow admins to manage permissions for employees in their org" ON user_employee_entity_permissions
FOR ALL
USING (
    user_employee_permission_id IN (
        SELECT uep.id
        FROM user_employee_permissions uep
        JOIN "user" u ON uep.manager_id = u.id
        WHERE u.organisation_id = get_my_organisation_id()
    )
)
WITH CHECK (
    user_employee_permission_id IN (
        SELECT uep.id
        FROM user_employee_permissions uep
        JOIN "user" u ON uep.manager_id = u.id
        WHERE u.organisation_id = get_my_organisation_id()
    )
);

-- =================================================================
-- Table: user_employee_permissions
-- =================================================================
ALTER TABLE user_employee_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage employee permissions in their org" ON user_employee_permissions;
CREATE POLICY "Allow admins to manage employee permissions in their org" ON user_employee_permissions
FOR ALL
USING (
    manager_id IN (SELECT id FROM "user" WHERE organisation_id = get_my_organisation_id())
)
WITH CHECK (
    manager_id IN (SELECT id FROM "user" WHERE organisation_id = get_my_organisation_id())
);

-- =================================================================
-- Table: user_organisations
-- =================================================================
ALTER TABLE user_organisations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage user links within their own org" ON user_organisations;
CREATE POLICY "Allow admins to manage user links within their own org" ON user_organisations
FOR ALL
USING (organisation_id = get_my_organisation_id())
WITH CHECK (organisation_id = get_my_organisation_id());

-- =================================================================
-- Table: user
-- Note: Admins can view all users within their org, but can only manage
-- users that are NOT superusers or sales.
-- =================================================================
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view users in their org" ON "user";
CREATE POLICY "Admins can view users in their org" ON "user"
FOR SELECT USING (
    id IN (SELECT user_id FROM user_organisations WHERE organisation_id = get_my_organisation_id())
);

DROP POLICY IF EXISTS "Admins can manage non-privileged users in their org" ON "user";
CREATE POLICY "Admins can manage non-privileged users in their org" ON "user"
FOR ALL
USING (
    id IN (SELECT user_id FROM user_organisations WHERE organisation_id = get_my_organisation_id())
    AND user_type NOT IN (3, 6) -- Cannot manage Super Admins or Sales
)
WITH CHECK (
    id IN (SELECT user_id FROM user_organisations WHERE organisation_id = get_my_organisation_id())
    AND user_type NOT IN (3, 6) -- Cannot manage Super Admins or Sales
);
