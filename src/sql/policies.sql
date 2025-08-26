-- This file will contain all RLS policies for the application.

-- Helper function to get the user_type of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_user_type()
RETURNS INT AS $$
DECLARE
    user_type_val INT;
BEGIN
    SELECT user_type INTO user_type_val
    FROM "user"
    WHERE id = (SELECT auth.uid())::text::integer; -- This assumes the user's primary key `id` is an integer that matches the auth.uid(). You may need to adjust this join.
    RETURN user_type_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- RLS Policy for allowing read access to user_type 1, 2, and 3
-- =================================================================

-- Table: alembic_version
ALTER TABLE alembic_version ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON alembic_version FOR SELECT USING (true);

-- Table: amenities
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON amenities FOR SELECT USING (true);

-- Table: approvals
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON approvals FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: availability_blocks
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON availability_blocks FOR SELECT USING (true);

-- Table: booking_logs
ALTER TABLE booking_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON booking_logs FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: booking_status
ALTER TABLE booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON booking_status FOR SELECT USING (true);

-- Table: bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON bookings FOR SELECT USING (true);

-- Table: channel_invitations
ALTER TABLE channel_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON channel_invitations FOR SELECT USING (true);

-- Table: channel_members
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON channel_members FOR SELECT USING (true);

-- Table: chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON chat_messages FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: chat_preferences
ALTER TABLE chat_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON chat_preferences FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON chat_sessions FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: coach_pricing
ALTER TABLE coach_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON coach_pricing FOR SELECT USING (true);

-- Table: coach_sports
ALTER TABLE coach_sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON coach_sports FOR SELECT USING (true);

-- Table: coaches
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON coaches FOR SELECT USING (true);

-- Table: community_messages
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON community_messages FOR SELECT USING (true);

-- Table: court_amenities
ALTER TABLE court_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON court_amenities FOR SELECT USING (true);

-- Table: court_contacts
ALTER TABLE court_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON court_contacts FOR SELECT USING (true);

-- Table: court_gallery
ALTER TABLE court_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON court_gallery FOR SELECT USING (true);

-- Table: court_reviews
ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON court_reviews FOR SELECT USING (true);

-- Table: court_rules
ALTER TABLE court_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON court_rules FOR SELECT USING (true);

-- Table: court_status
ALTER TABLE court_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON court_status FOR SELECT USING (true);

-- Table: courts
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON courts FOR SELECT USING (true);

-- Table: event_booking_status
ALTER TABLE event_booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_booking_status FOR SELECT USING (true);

-- Table: event_bookings
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_bookings FOR SELECT USING (true);

-- Table: event_categories
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_categories FOR SELECT USING (true);

-- Table: event_category_map
ALTER TABLE event_category_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_category_map FOR SELECT USING (true);

-- Table: event_gallery_images
ALTER TABLE event_gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_gallery_images FOR SELECT USING (true);

-- Table: event_sub_events
ALTER TABLE event_sub_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_sub_events FOR SELECT USING (true);

-- Table: event_tag_map
ALTER TABLE event_tag_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_tag_map FOR SELECT USING (true);

-- Table: event_tags
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_tags FOR SELECT USING (true);

-- Table: event_what_to_bring
ALTER TABLE event_what_to_bring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON event_what_to_bring FOR SELECT USING (true);

-- Table: events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON events FOR SELECT USING (true);

-- Table: events_status
ALTER TABLE events_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON events_status FOR SELECT USING (true);

-- Table: organisation_roles
ALTER TABLE organisation_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON organisation_roles FOR SELECT USING (true);

-- Table: organisation_types
ALTER TABLE organisation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON organisation_types FOR SELECT USING (true);

-- Table: organisations
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON organisations FOR SELECT USING (true);

-- Table: organisations_website
ALTER TABLE organisations_website ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON organisations_website FOR SELECT USING (true);

-- Table: package_bookings
ALTER TABLE package_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON package_bookings FOR SELECT USING (true);

-- Table: packages
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON packages FOR SELECT USING (true);

-- Table: permission_entity
ALTER TABLE permission_entity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON permission_entity FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: post
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON post FOR SELECT USING (true);

-- Table: rate_limit
ALTER TABLE rate_limit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON rate_limit FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: realtime_channels
ALTER TABLE realtime_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON realtime_channels FOR SELECT USING (true);

-- Table: recurring_unavailability
ALTER TABLE recurring_unavailability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON recurring_unavailability FOR SELECT USING (true);

-- Table: refunds
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON refunds FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: residence_status
ALTER TABLE residence_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON residence_status FOR SELECT USING (true);

-- Table: residences
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON residences FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: shifts
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON shifts FOR SELECT USING (true);

-- Table: sports
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON sports FOR SELECT USING (true);

-- Table: tier
ALTER TABLE tier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON tier FOR SELECT USING (true);

-- Table: timeslots
ALTER TABLE timeslots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON timeslots FOR SELECT USING (true);

-- Table: token_blacklist
ALTER TABLE token_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON token_blacklist FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: transaction_reference_types
ALTER TABLE transaction_reference_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON transaction_reference_types FOR SELECT USING (true);

-- Table: transaction_status
ALTER TABLE transaction_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON transaction_status FOR SELECT USING (true);

-- Table: transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON transactions FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: user
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON "user" FOR SELECT USING (true);

-- Table: user_employee_entity_permissions
ALTER TABLE user_employee_entity_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON user_employee_entity_permissions FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: user_employee_permissions
ALTER TABLE user_employee_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for admins and superusers" ON user_employee_permissions FOR SELECT USING (get_my_user_type() IN (2, 3));

-- Table: user_organisations
ALTER TABLE user_organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON user_organisations FOR SELECT USING (true);

-- Table: user_profile
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view for all users" ON user_profile FOR SELECT USING (true);
