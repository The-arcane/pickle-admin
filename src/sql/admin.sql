
-- Helper function to get the current user's type
CREATE OR REPLACE FUNCTION get_my_user_type()
RETURNS integer AS $$
DECLARE
    user_type_val integer;
BEGIN
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::jsonb ->> 'user_type',
        (SELECT "user_type" FROM "user" WHERE "user_uuid" = auth.uid())
    )::integer INTO user_type_val;
    RETURN user_type_val;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Helper function to get the current user's organisation_id
CREATE OR REPLACE FUNCTION get_my_organisation_id()
RETURNS integer AS $$
DECLARE
    org_id integer;
BEGIN
    SELECT organisation_id INTO org_id
    FROM user_organisations
    WHERE user_id = (SELECT id FROM "user" WHERE user_uuid = auth.uid());
    RETURN org_id;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Policies for approvals
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view approvals" ON approvals;
CREATE POLICY "Allow admin to view approvals" ON approvals FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert approvals" ON approvals;
CREATE POLICY "Allow admin to insert approvals" ON approvals FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update approvals" ON approvals;
CREATE POLICY "Allow admin to update approvals" ON approvals FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete approvals" ON approvals;
CREATE POLICY "Allow admin to delete approvals" ON approvals FOR DELETE USING (get_my_user_type() = 2);

-- Policies for availability_blocks
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view availability_blocks" ON availability_blocks;
CREATE POLICY "Allow admin to view availability_blocks" ON availability_blocks FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert availability_blocks" ON availability_blocks;
CREATE POLICY "Allow admin to insert availability_blocks" ON availability_blocks FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update availability_blocks" ON availability_blocks;
CREATE POLICY "Allow admin to update availability_blocks" ON availability_blocks FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete availability_blocks" ON availability_blocks;
CREATE POLICY "Allow admin to delete availability_blocks" ON availability_blocks FOR DELETE USING (get_my_user_type() = 2);

-- Policies for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view bookings" ON bookings;
CREATE POLICY "Allow admin to view bookings" ON bookings FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert bookings" ON bookings;
CREATE POLICY "Allow admin to insert bookings" ON bookings FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update bookings" ON bookings;
CREATE POLICY "Allow admin to update bookings" ON bookings FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete bookings" ON bookings;
CREATE POLICY "Allow admin to delete bookings" ON bookings FOR DELETE USING (get_my_user_type() = 2);

-- Policies for channel_invitations
ALTER TABLE channel_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view channel_invitations" ON channel_invitations;
CREATE POLICY "Allow admin to view channel_invitations" ON channel_invitations FOR SELECT USING (get_my_user_type() = 2 AND channel_id IN (SELECT id FROM realtime_channels WHERE owner_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert channel_invitations" ON channel_invitations;
CREATE POLICY "Allow admin to insert channel_invitations" ON channel_invitations FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update channel_invitations" ON channel_invitations;
CREATE POLICY "Allow admin to update channel_invitations" ON channel_invitations FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete channel_invitations" ON channel_invitations;
CREATE POLICY "Allow admin to delete channel_invitations" ON channel_invitations FOR DELETE USING (get_my_user_type() = 2);

-- Policies for coach_pricing
ALTER TABLE coach_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view coach_pricing" ON coach_pricing;
CREATE POLICY "Allow admin to view coach_pricing" ON coach_pricing FOR SELECT USING (get_my_user_type() = 2 AND coach_id IN (SELECT id FROM coaches WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert coach_pricing" ON coach_pricing;
CREATE POLICY "Allow admin to insert coach_pricing" ON coach_pricing FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update coach_pricing" ON coach_pricing;
CREATE POLICY "Allow admin to update coach_pricing" ON coach_pricing FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete coach_pricing" ON coach_pricing;
CREATE POLICY "Allow admin to delete coach_pricing" ON coach_pricing FOR DELETE USING (get_my_user_type() = 2);

-- Policies for coach_sports
ALTER TABLE coach_sports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view coach_sports" ON coach_sports;
CREATE POLICY "Allow admin to view coach_sports" ON coach_sports FOR SELECT USING (get_my_user_type() = 2 AND coach_id IN (SELECT id FROM coaches WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert coach_sports" ON coach_sports;
CREATE POLICY "Allow admin to insert coach_sports" ON coach_sports FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update coach_sports" ON coach_sports;
CREATE POLICY "Allow admin to update coach_sports" ON coach_sports FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete coach_sports" ON coach_sports;
CREATE POLICY "Allow admin to delete coach_sports" ON coach_sports FOR DELETE USING (get_my_user_type() = 2);

-- Policies for coaches
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view coaches" ON coaches;
CREATE POLICY "Allow admin to view coaches" ON coaches FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert coaches" ON coaches;
CREATE POLICY "Allow admin to insert coaches" ON coaches FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update coaches" ON coaches;
CREATE POLICY "Allow admin to update coaches" ON coaches FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete coaches" ON coaches;
CREATE POLICY "Allow admin to delete coaches" ON coaches FOR DELETE USING (get_my_user_type() = 2);

-- Policies for court_amenities
ALTER TABLE court_amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view court_amenities" ON court_amenities;
CREATE POLICY "Allow admin to view court_amenities" ON court_amenities FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert court_amenities" ON court_amenities;
CREATE POLICY "Allow admin to insert court_amenities" ON court_amenities FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update court_amenities" ON court_amenities;
CREATE POLICY "Allow admin to update court_amenities" ON court_amenities FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete court_amenities" ON court_amenities;
CREATE POLICY "Allow admin to delete court_amenities" ON court_amenities FOR DELETE USING (get_my_user_type() = 2);

-- Policies for court_contacts
ALTER TABLE court_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view court_contacts" ON court_contacts;
CREATE POLICY "Allow admin to view court_contacts" ON court_contacts FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert court_contacts" ON court_contacts;
CREATE POLICY "Allow admin to insert court_contacts" ON court_contacts FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update court_contacts" ON court_contacts;
CREATE POLICY "Allow admin to update court_contacts" ON court_contacts FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete court_contacts" ON court_contacts;
CREATE POLICY "Allow admin to delete court_contacts" ON court_contacts FOR DELETE USING (get_my_user_type() = 2);

-- Policies for court_gallery
ALTER TABLE court_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view court_gallery" ON court_gallery;
CREATE POLICY "Allow admin to view court_gallery" ON court_gallery FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert court_gallery" ON court_gallery;
CREATE POLICY "Allow admin to insert court_gallery" ON court_gallery FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update court_gallery" ON court_gallery;
CREATE POLICY "Allow admin to update court_gallery" ON court_gallery FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete court_gallery" ON court_gallery;
CREATE POLICY "Allow admin to delete court_gallery" ON court_gallery FOR DELETE USING (get_my_user_type() = 2);

-- Policies for court_reviews
ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view court_reviews" ON court_reviews;
CREATE POLICY "Allow admin to view court_reviews" ON court_reviews FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert court_reviews" ON court_reviews;
CREATE POLICY "Allow admin to insert court_reviews" ON court_reviews FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update court_reviews" ON court_reviews;
CREATE POLICY "Allow admin to update court_reviews" ON court_reviews FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete court_reviews" ON court_reviews;
CREATE POLICY "Allow admin to delete court_reviews" ON court_reviews FOR DELETE USING (get_my_user_type() = 2);

-- Policies for court_rules
ALTER TABLE court_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view court_rules" ON court_rules;
CREATE POLICY "Allow admin to view court_rules" ON court_rules FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert court_rules" ON court_rules;
CREATE POLICY "Allow admin to insert court_rules" ON court_rules FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update court_rules" ON court_rules;
CREATE POLICY "Allow admin to update court_rules" ON court_rules FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete court_rules" ON court_rules;
CREATE POLICY "Allow admin to delete court_rules" ON court_rules FOR DELETE USING (get_my_user_type() = 2);

-- Policies for courts
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view courts" ON courts;
CREATE POLICY "Allow admin to view courts" ON courts FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert courts" ON courts;
CREATE POLICY "Allow admin to insert courts" ON courts FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update courts" ON courts;
CREATE POLICY "Allow admin to update courts" ON courts FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete courts" ON courts;
CREATE POLICY "Allow admin to delete courts" ON courts FOR DELETE USING (get_my_user_type() = 2);

-- Policies for event_bookings
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view event_bookings" ON event_bookings;
CREATE POLICY "Allow admin to view event_bookings" ON event_bookings FOR SELECT USING (get_my_user_type() = 2 AND event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert event_bookings" ON event_bookings;
CREATE POLICY "Allow admin to insert event_bookings" ON event_bookings FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update event_bookings" ON event_bookings;
CREATE POLICY "Allow admin to update event_bookings" ON event_bookings FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete event_bookings" ON event_bookings;
CREATE POLICY "Allow admin to delete event_bookings" ON event_bookings FOR DELETE USING (get_my_user_type() = 2);

-- Policies for event_category_map
ALTER TABLE event_category_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view event_category_map" ON event_category_map;
CREATE POLICY "Allow admin to view event_category_map" ON event_category_map FOR SELECT USING (get_my_user_type() = 2 AND event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert event_category_map" ON event_category_map;
CREATE POLICY "Allow admin to insert event_category_map" ON event_category_map FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update event_category_map" ON event_category_map;
CREATE POLICY "Allow admin to update event_category_map" ON event_category_map FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete event_category_map" ON event_category_map;
CREATE POLICY "Allow admin to delete event_category_map" ON event_category_map FOR DELETE USING (get_my_user_type() = 2);

-- Policies for event_gallery_images
ALTER TABLE event_gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view event_gallery_images" ON event_gallery_images;
CREATE POLICY "Allow admin to view event_gallery_images" ON event_gallery_images FOR SELECT USING (get_my_user_type() = 2 AND event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert event_gallery_images" ON event_gallery_images;
CREATE POLICY "Allow admin to insert event_gallery_images" ON event_gallery_images FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update event_gallery_images" ON event_gallery_images;
CREATE POLICY "Allow admin to update event_gallery_images" ON event_gallery_images FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete event_gallery_images" ON event_gallery_images;
CREATE POLICY "Allow admin to delete event_gallery_images" ON event_gallery_images FOR DELETE USING (get_my_user_type() = 2);

-- Policies for event_sub_events
ALTER TABLE event_sub_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view event_sub_events" ON event_sub_events;
CREATE POLICY "Allow admin to view event_sub_events" ON event_sub_events FOR SELECT USING (get_my_user_type() = 2 AND event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert event_sub_events" ON event_sub_events;
CREATE POLICY "Allow admin to insert event_sub_events" ON event_sub_events FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update event_sub_events" ON event_sub_events;
CREATE POLICY "Allow admin to update event_sub_events" ON event_sub_events FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete event_sub_events" ON event_sub_events;
CREATE POLICY "Allow admin to delete event_sub_events" ON event_sub_events FOR DELETE USING (get_my_user_type() = 2);

-- Policies for event_tag_map
ALTER TABLE event_tag_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view event_tag_map" ON event_tag_map;
CREATE POLICY "Allow admin to view event_tag_map" ON event_tag_map FOR SELECT USING (get_my_user_type() = 2 AND event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert event_tag_map" ON event_tag_map;
CREATE POLICY "Allow admin to insert event_tag_map" ON event_tag_map FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update event_tag_map" ON event_tag_map;
CREATE POLICY "Allow admin to update event_tag_map" ON event_tag_map FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete event_tag_map" ON event_tag_map;
CREATE POLICY "Allow admin to delete event_tag_map" ON event_tag_map FOR DELETE USING (get_my_user_type() = 2);

-- Policies for event_what_to_bring
ALTER TABLE event_what_to_bring ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view event_what_to_bring" ON event_what_to_bring;
CREATE POLICY "Allow admin to view event_what_to_bring" ON event_what_to_bring FOR SELECT USING (get_my_user_type() = 2 AND event_id IN (SELECT id FROM events WHERE organiser_org_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert event_what_to_bring" ON event_what_to_bring;
CREATE POLICY "Allow admin to insert event_what_to_bring" ON event_what_to_bring FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update event_what_to_bring" ON event_what_to_bring;
CREATE POLICY "Allow admin to update event_what_to_bring" ON event_what_to_bring FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete event_what_to_bring" ON event_what_to_bring;
CREATE POLICY "Allow admin to delete event_what_to_bring" ON event_what_to_bring FOR DELETE USING (get_my_user_type() = 2);

-- Policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view events" ON events;
CREATE POLICY "Allow admin to view events" ON events FOR SELECT USING (get_my_user_type() = 2 AND organiser_org_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert events" ON events;
CREATE POLICY "Allow admin to insert events" ON events FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update events" ON events;
CREATE POLICY "Allow admin to update events" ON events FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete events" ON events;
CREATE POLICY "Allow admin to delete events" ON events FOR DELETE USING (get_my_user_type() = 2);

-- Policies for organisations
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view their own organisation" ON organisations;
CREATE POLICY "Allow admin to view their own organisation" ON organisations FOR SELECT USING (get_my_user_type() = 2 AND id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert organisations" ON organisations;
CREATE POLICY "Allow admin to insert organisations" ON organisations FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update organisations" ON organisations;
CREATE POLICY "Allow admin to update organisations" ON organisations FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete organisations" ON organisations;
CREATE POLICY "Allow admin to delete organisations" ON organisations FOR DELETE USING (get_my_user_type() = 2);

-- Policies for package_bookings
ALTER TABLE package_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view package_bookings" ON package_bookings;
CREATE POLICY "Allow admin to view package_bookings" ON package_bookings FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert package_bookings" ON package_bookings;
CREATE POLICY "Allow admin to insert package_bookings" ON package_bookings FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update package_bookings" ON package_bookings;
CREATE POLICY "Allow admin to update package_bookings" ON package_bookings FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete package_bookings" ON package_bookings;
CREATE POLICY "Allow admin to delete package_bookings" ON package_bookings FOR DELETE USING (get_my_user_type() = 2);

-- Policies for packages
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view packages" ON packages;
CREATE POLICY "Allow admin to view packages" ON packages FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert packages" ON packages;
CREATE POLICY "Allow admin to insert packages" ON packages FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update packages" ON packages;
CREATE POLICY "Allow admin to update packages" ON packages FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete packages" ON packages;
CREATE POLICY "Allow admin to delete packages" ON packages FOR DELETE USING (get_my_user_type() = 2);

-- Policies for post
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view posts" ON post;
CREATE POLICY "Allow admin to view posts" ON post FOR SELECT USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to insert posts" ON post;
CREATE POLICY "Allow admin to insert posts" ON post FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update posts" ON post;
CREATE POLICY "Allow admin to update posts" ON post FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete posts" ON post;
CREATE POLICY "Allow admin to delete posts" ON post FOR DELETE USING (get_my_user_type() = 2);

-- Policies for realtime_channels
ALTER TABLE realtime_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view realtime_channels" ON realtime_channels;
CREATE POLICY "Allow admin to view realtime_channels" ON realtime_channels FOR SELECT USING (get_my_user_type() = 2 AND owner_org_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert realtime_channels" ON realtime_channels;
CREATE POLICY "Allow admin to insert realtime_channels" ON realtime_channels FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update realtime_channels" ON realtime_channels;
CREATE POLICY "Allow admin to update realtime_channels" ON realtime_channels FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete realtime_channels" ON realtime_channels;
CREATE POLICY "Allow admin to delete realtime_channels" ON realtime_channels FOR DELETE USING (get_my_user_type() = 2);

-- Policies for recurring_unavailability
ALTER TABLE recurring_unavailability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view recurring_unavailability" ON recurring_unavailability;
CREATE POLICY "Allow admin to view recurring_unavailability" ON recurring_unavailability FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert recurring_unavailability" ON recurring_unavailability;
CREATE POLICY "Allow admin to insert recurring_unavailability" ON recurring_unavailability FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update recurring_unavailability" ON recurring_unavailability;
CREATE POLICY "Allow admin to update recurring_unavailability" ON recurring_unavailability FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete recurring_unavailability" ON recurring_unavailability;
CREATE POLICY "Allow admin to delete recurring_unavailability" ON recurring_unavailability FOR DELETE USING (get_my_user_type() = 2);

-- Policies for residences
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view residences" ON residences;
CREATE POLICY "Allow admin to view residences" ON residences FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert residences" ON residences;
CREATE POLICY "Allow admin to insert residences" ON residences FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update residences" ON residences;
CREATE POLICY "Allow admin to update residences" ON residences FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete residences" ON residences;
CREATE POLICY "Allow admin to delete residences" ON residences FOR DELETE USING (get_my_user_type() = 2);

-- Policies for timeslots
ALTER TABLE timeslots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view timeslots" ON timeslots;
CREATE POLICY "Allow admin to view timeslots" ON timeslots FOR SELECT USING (get_my_user_type() = 2 AND court_id IN (SELECT id FROM courts WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert timeslots" ON timeslots;
CREATE POLICY "Allow admin to insert timeslots" ON timeslots FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update timeslots" ON timeslots;
CREATE POLICY "Allow admin to update timeslots" ON timeslots FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete timeslots" ON timeslots;
CREATE POLICY "Allow admin to delete timeslots" ON timeslots FOR DELETE USING (get_my_user_type() = 2);

-- Policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view transactions" ON transactions;
CREATE POLICY "Allow admin to view transactions" ON transactions FOR SELECT USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to insert transactions" ON transactions;
CREATE POLICY "Allow admin to insert transactions" ON transactions FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update transactions" ON transactions;
CREATE POLICY "Allow admin to update transactions" ON transactions FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete transactions" ON transactions;
CREATE POLICY "Allow admin to delete transactions" ON transactions FOR DELETE USING (get_my_user_type() = 2);

-- Policies for "user" table
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view users in their org" ON "user";
CREATE POLICY "Allow admin to view users in their org" ON "user" FOR SELECT USING (get_my_user_type() = 2 AND id IN (SELECT user_id FROM user_organisations WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert users" ON "user";
CREATE POLICY "Allow admin to insert users" ON "user" FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update users" ON "user";
CREATE POLICY "Allow admin to update users" ON "user" FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete users" ON "user";
CREATE POLICY "Allow admin to delete users" ON "user" FOR DELETE USING (get_my_user_type() = 2);

-- Policies for user_employee_entity_permissions
ALTER TABLE user_employee_entity_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view user_employee_entity_permissions" ON user_employee_entity_permissions;
CREATE POLICY "Allow admin to view user_employee_entity_permissions" ON user_employee_entity_permissions FOR SELECT USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to insert user_employee_entity_permissions" ON user_employee_entity_permissions;
CREATE POLICY "Allow admin to insert user_employee_entity_permissions" ON user_employee_entity_permissions FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update user_employee_entity_permissions" ON user_employee_entity_permissions;
CREATE POLICY "Allow admin to update user_employee_entity_permissions" ON user_employee_entity_permissions FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete user_employee_entity_permissions" ON user_employee_entity_permissions;
CREATE POLICY "Allow admin to delete user_employee_entity_permissions" ON user_employee_entity_permissions FOR DELETE USING (get_my_user_type() = 2);

-- Policies for user_employee_permissions
ALTER TABLE user_employee_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view user_employee_permissions" ON user_employee_permissions;
CREATE POLICY "Allow admin to view user_employee_permissions" ON user_employee_permissions FOR SELECT USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to insert user_employee_permissions" ON user_employee_permissions;
CREATE POLICY "Allow admin to insert user_employee_permissions" ON user_employee_permissions FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update user_employee_permissions" ON user_employee_permissions;
CREATE POLICY "Allow admin to update user_employee_permissions" ON user_employee_permissions FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete user_employee_permissions" ON user_employee_permissions;
CREATE POLICY "Allow admin to delete user_employee_permissions" ON user_employee_permissions FOR DELETE USING (get_my_user_type() = 2);

-- Policies for user_organisations
ALTER TABLE user_organisations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view their own organisation links" ON user_organisations;
CREATE POLICY "Allow admin to view their own organisation links" ON user_organisations FOR SELECT USING (get_my_user_type() = 2 AND organisation_id = get_my_organisation_id());
DROP POLICY IF EXISTS "Allow admin to insert user_organisations" ON user_organisations;
CREATE POLICY "Allow admin to insert user_organisations" ON user_organisations FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update user_organisations" ON user_organisations;
CREATE POLICY "Allow admin to update user_organisations" ON user_organisations FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete user_organisations" ON user_organisations;
CREATE POLICY "Allow admin to delete user_organisations" ON user_organisations FOR DELETE USING (get_my_user_type() = 2);

-- Policies for user_profile
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin to view user_profiles" ON user_profile;
CREATE POLICY "Allow admin to view user_profiles" ON user_profile FOR SELECT USING (get_my_user_type() = 2 AND id IN (SELECT id FROM "user" WHERE organisation_id = get_my_organisation_id()));
DROP POLICY IF EXISTS "Allow admin to insert user_profiles" ON user_profile;
CREATE POLICY "Allow admin to insert user_profiles" ON user_profile FOR INSERT WITH CHECK (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to update user_profiles" ON user_profile;
CREATE POLICY "Allow admin to update user_profiles" ON user_profile FOR UPDATE USING (get_my_user_type() = 2);
DROP POLICY IF EXISTS "Allow admin to delete user_profiles" ON user_profile;
CREATE POLICY "Allow admin to delete user_profiles" ON user_profile FOR DELETE USING (get_my_user_type() = 2);
