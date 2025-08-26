-- This file contains the RLS policies for employees (user_type = 4)

-- Enable RLS for all tables
ALTER TABLE alembic_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_booking_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_category_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sub_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tag_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_what_to_bring ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations_website ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE residence_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_reference_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_employee_entity_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_employee_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for employee role to ensure a clean slate
DROP POLICY IF EXISTS "Employee can view their own org's approvals" ON approvals;
DROP POLICY IF EXISTS "Employee can manage all approvals" ON approvals;

DROP POLICY IF EXISTS "Employee can view their own org's courts data" ON availability_blocks;
DROP POLICY IF EXISTS "Employee can manage all availability" ON availability_blocks;

DROP POLICY IF EXISTS "Employee can view logs for their org" ON booking_logs;
DROP POLICY IF EXISTS "Employee can manage all booking logs" ON booking_logs;

DROP POLICY IF EXISTS "Employee can view bookings for their org" ON bookings;
DROP POLICY IF EXISTS "Employee can manage all bookings" ON bookings;

DROP POLICY IF EXISTS "Employee can view their own org's coaches" ON coaches;
DROP POLICY IF EXISTS "Employee can manage all coaches" ON coaches;

DROP POLICY IF EXISTS "Employee can view their own org's court amenities" ON court_amenities;
DROP POLICY IF EXISTS "Employee can manage all court amenities" ON court_amenities;

DROP POLICY IF EXISTS "Employee can view their own org's court contacts" ON court_contacts;
DROP POLICY IF EXISTS "Employee can manage all court contacts" ON court_contacts;

DROP POLICY IF EXISTS "Employee can view their own org's court gallery" ON court_gallery;
DROP POLICY IF EXISTS "Employee can manage all court galleries" ON court_gallery;

DROP POLICY IF EXISTS "Employee can view their own org's court reviews" ON court_reviews;
DROP POLICY IF EXISTS "Employee can manage all court reviews" ON court_reviews;

DROP POLICY IF EXISTS "Employee can view their own org's court rules" ON court_rules;
DROP POLICY IF EXISTS "Employee can manage all court rules" ON court_rules;

DROP POLICY IF EXISTS "Employee can view their own org's courts" ON courts;
DROP POLICY IF EXISTS "Employee can manage all courts" ON courts;

DROP POLICY IF EXISTS "Employee can view their own org's event bookings" ON event_bookings;
DROP POLICY IF EXISTS "Employee can manage all event bookings" ON event_bookings;

DROP POLICY IF EXISTS "Employee can view their own org's events" ON events;
DROP POLICY IF EXISTS "Employee can manage all events" ON events;

DROP POLICY IF EXISTS "Employee can view their own org's residences" ON residences;
DROP POLICY IF EXISTS "Employee can manage all residences" ON residences;

DROP POLICY IF EXISTS "Employee can view their own org's timeslots" ON timeslots;
DROP POLICY IF EXISTS "Employee can manage all timeslots" ON timeslots;

DROP POLICY IF EXISTS "Employee can view users in their org" ON "user";
DROP POLICY IF EXISTS "Employee can manage all users" ON "user";

DROP POLICY IF EXISTS "Employee can view user-org links for their org" ON user_organisations;
DROP POLICY IF EXISTS "Employee can manage all user-org links" ON user_organisations;

-- Policies for tables with direct organisation_id
CREATE POLICY "Employee can view their own org's approvals" ON approvals FOR SELECT USING (organisation_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all approvals" ON approvals FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's coaches" ON coaches FOR SELECT USING (organisation_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all coaches" ON coaches FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's courts" ON courts FOR SELECT USING (organisation_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all courts" ON courts FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's events" ON events FOR SELECT USING (organiser_org_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all events" ON events FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's residences" ON residences FOR SELECT USING (organisation_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all residences" ON residences FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view users in their org" ON "user" FOR SELECT USING (organisation_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all users" ON "user" FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view user-org links for their org" ON user_organisations FOR SELECT USING (organisation_id = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all user-org links" ON user_organisations FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

-- Policies for tables with indirect organisation_id link (via courts)
CREATE POLICY "Employee can view their own org's courts data" ON availability_blocks FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all availability" ON availability_blocks FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's court amenities" ON court_amenities FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all court amenities" ON court_amenities FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's court contacts" ON court_contacts FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all court contacts" ON court_contacts FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's court gallery" ON court_gallery FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all court galleries" ON court_gallery FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's court reviews" ON court_reviews FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all court reviews" ON court_reviews FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's court rules" ON court_rules FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all court rules" ON court_rules FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

CREATE POLICY "Employee can view their own org's timeslots" ON timeslots FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = court_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all timeslots" ON timeslots FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

-- Policies for tables with indirect organisation_id link (via bookings -> courts)
CREATE POLICY "Employee can view logs for their org" ON booking_logs FOR SELECT USING ((SELECT organisation_id FROM courts WHERE id = (SELECT court_id FROM bookings WHERE id = booking_id)) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all booking logs" ON booking_logs FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

-- Policies for tables with indirect organisation_id link (via events)
CREATE POLICY "Employee can view their own org's event bookings" ON event_bookings FOR SELECT USING ((SELECT organiser_org_id FROM events WHERE id = event_id) = get_my_organisation_id() AND get_my_user_type() = 4);
CREATE POLICY "Employee can manage all event bookings" ON event_bookings FOR ALL USING (true) WITH CHECK (get_my_user_type() = 4);

-- Policies for global/non-org tables (Allow select, but restrict modification)
CREATE POLICY "Employees can view global data" ON amenities FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON booking_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON event_booking_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON event_categories FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON event_tags FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON sports FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON transaction_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON organisation_roles FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employees can view global data" ON shifts FOR SELECT USING (get_my_user_type() = 4);
