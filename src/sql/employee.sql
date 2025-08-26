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

-- Drop existing policies for the employee role to avoid conflicts
DROP POLICY IF EXISTS "Employee Policy" ON alembic_version;
DROP POLICY IF EXISTS "Employee Policy" ON amenities;
DROP POLICY IF EXISTS "Employee Policy" ON approvals;
DROP POLICY IF EXISTS "Employee Policy" ON availability_blocks;
DROP POLICY IF EXISTS "Employee Policy" ON booking_logs;
DROP POLICY IF EXISTS "Employee Policy" ON booking_status;
DROP POLICY IF EXISTS "Employee Policy" ON bookings;
DROP POLICY IF EXISTS "Employee Policy" ON channel_invitations;
DROP POLICY IF EXISTS "Employee Policy" ON channel_members;
DROP POLICY IF EXISTS "Employee Policy" ON chat_messages;
DROP POLICY IF EXISTS "Employee Policy" ON chat_preferences;
DROP POLICY IF EXISTS "Employee Policy" ON chat_sessions;
DROP POLICY IF EXISTS "Employee Policy" ON coach_pricing;
DROP POLICY IF EXISTS "Employee Policy" ON coach_sports;
DROP POLICY IF EXISTS "Employee Policy" ON coaches;
DROP POLICY IF EXISTS "Employee Policy" ON community_messages;
DROP POLICY IF EXISTS "Employee Policy" ON court_amenities;
DROP POLICY IF EXISTS "Employee Policy" ON court_contacts;
DROP POLICY IF EXISTS "Employee Policy" ON court_gallery;
DROP POLICY IF EXISTS "Employee Policy" ON court_reviews;
DROP POLICY IF EXISTS "Employee Policy" ON court_rules;
DROP POLICY IF EXISTS "Employee Policy" ON court_status;
DROP POLICY IF EXISTS "Employee Policy" ON courts;
DROP POLICY IF EXISTS "Employee Policy" ON event_booking_status;
DROP POLICY IF EXISTS "Employee Policy" ON event_bookings;
DROP POLICY IF EXISTS "Employee Policy" ON event_categories;
DROP POLICY IF EXISTS "Employee Policy" ON event_category_map;
DROP POLICY IF EXISTS "Employee Policy" ON event_gallery_images;
DROP POLICY IF EXISTS "Employee Policy" ON event_sub_events;
DROP POLICY IF EXISTS "Employee Policy" ON event_tag_map;
DROP POLICY IF EXISTS "Employee Policy" ON event_tags;
DROP POLICY IF EXISTS "Employee Policy" ON event_what_to_bring;
DROP POLICY IF EXISTS "Employee Policy" ON events;
DROP POLICY IF EXISTS "Employee Policy" ON events_status;
DROP POLICY IF EXISTS "Employee Policy" ON organisation_roles;
DROP POLICY IF EXISTS "Employee Policy" ON organisation_types;
DROP POLICY IF EXISTS "Employee Policy" ON organisations;
DROP POLICY IF EXISTS "Employee Policy" ON organisations_website;
DROP POLICY IF EXISTS "Employee Policy" ON package_bookings;
DROP POLICY IF EXISTS "Employee Policy" ON packages;
DROP POLICY IF EXISTS "Employee Policy" ON permission_entity;
DROP POLICY IF EXISTS "Employee Policy" ON post;
DROP POLICY IF EXISTS "Employee Policy" ON rate_limit;
DROP POLICY IF EXISTS "Employee Policy" ON realtime_channels;
DROP POLICY IF EXISTS "Employee Policy" ON recurring_unavailability;
DROP POLICY IF EXISTS "Employee Policy" ON refunds;
DROP POLICY IF EXISTS "Employee Policy" ON residence_status;
DROP POLICY IF EXISTS "Employee Policy" ON residences;
DROP POLICY IF EXISTS "Employee Policy" ON shifts;
DROP POLICY IF EXISTS "Employee Policy" ON sports;
DROP POLICY IF EXISTS "Employee Policy" ON tier;
DROP POLICY IF EXISTS "Employee Policy" ON timeslots;
DROP POLICY IF EXISTS "Employee Policy" ON token_blacklist;
DROP POLICY IF EXISTS "Employee Policy" ON transaction_reference_types;
DROP POLICY IF EXISTS "Employee Policy" ON transaction_status;
DROP POLICY IF EXISTS "Employee Policy" ON transactions;
DROP POLICY IF EXISTS "Employee Policy" ON "user";
DROP POLICY IF EXISTS "Employee Policy" ON user_employee_entity_permissions;
DROP POLICY IF EXISTS "Employee Policy" ON user_employee_permissions;
DROP POLICY IF EXISTS "Employee Policy" ON user_organisations;
DROP POLICY IF EXISTS "Employee Policy" ON user_profile;

-- Policies for tables without direct organisation_id
CREATE POLICY "Employee Select Policy" ON alembic_version FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON alembic_version FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON alembic_version FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON alembic_version FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON amenities FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON amenities FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON amenities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON amenities FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON booking_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON booking_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON booking_status FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON booking_status FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON court_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON court_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON court_status FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON court_status FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_booking_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON event_booking_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_booking_status FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_booking_status FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_categories FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON event_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_categories FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_tags FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON event_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_tags FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_tags FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON events_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON events_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON events_status FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON events_status FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON organisation_roles FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON organisation_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON organisation_roles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON organisation_roles FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON organisation_types FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON organisation_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON organisation_types FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON organisation_types FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON permission_entity FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON permission_entity FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON permission_entity FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON permission_entity FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON residence_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON residence_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON residence_status FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON residence_status FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON shifts FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON shifts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON shifts FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON sports FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON sports FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON sports FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON sports FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON tier FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON tier FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON tier FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON tier FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON token_blacklist FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON token_blacklist FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON token_blacklist FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON token_blacklist FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON transaction_reference_types FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON transaction_reference_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON transaction_reference_types FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON transaction_reference_types FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON transaction_status FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON transaction_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON transaction_status FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON transaction_status FOR DELETE USING (true);

-- Policies for tables with direct organisation_id
CREATE POLICY "Employee Select Policy" ON approvals FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON approvals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON approvals FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON coaches FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON coaches FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON coaches FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON coaches FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON courts FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON courts FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON courts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON courts FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON organisations FOR SELECT USING (get_my_user_type() = 4 AND id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON organisations FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON organisations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON organisations FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON package_bookings FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON package_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON package_bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON package_bookings FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON packages FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON packages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON packages FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON realtime_channels FOR SELECT USING (get_my_user_type() = 4 AND owner_org_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON realtime_channels FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON realtime_channels FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON realtime_channels FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON residences FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON residences FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON residences FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON residences FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON "user" FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON "user" FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON "user" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON "user" FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON user_organisations FOR SELECT USING (get_my_user_type() = 4 AND organisation_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON user_organisations FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON user_organisations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON user_organisations FOR DELETE USING (true);

-- Policies for tables with indirect organisation_id
CREATE POLICY "Employee Select Policy" ON availability_blocks FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = availability_blocks.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON availability_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON availability_blocks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON availability_blocks FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON booking_logs FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_logs.booking_id AND EXISTS (SELECT 1 FROM courts WHERE courts.id = bookings.court_id AND courts.organisation_id = get_my_organisation_id())));
CREATE POLICY "Employee Insert Policy" ON booking_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON booking_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON booking_logs FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON bookings FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = bookings.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON bookings FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON channel_invitations FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM realtime_channels WHERE realtime_channels.id = channel_invitations.channel_id AND realtime_channels.owner_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON channel_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON channel_invitations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON channel_invitations FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON channel_members FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM realtime_channels WHERE realtime_channels.id = channel_members.channel_id AND realtime_channels.owner_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON channel_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON channel_members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON channel_members FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON coach_pricing FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM coaches WHERE coaches.id = coach_pricing.coach_id AND coaches.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON coach_pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON coach_pricing FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON coach_pricing FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON coach_sports FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM coaches WHERE coaches.id = coach_sports.coach_id AND coaches.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON coach_sports FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON coach_sports FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON coach_sports FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON community_messages FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM realtime_channels WHERE realtime_channels.id = community_messages.channel_id AND realtime_channels.owner_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON community_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON community_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON community_messages FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON court_amenities FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = court_amenities.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON court_amenities FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON court_amenities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON court_amenities FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON court_contacts FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = court_contacts.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON court_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON court_contacts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON court_contacts FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON court_gallery FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = court_gallery.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON court_gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON court_gallery FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON court_gallery FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON court_reviews FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = court_reviews.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON court_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON court_reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON court_reviews FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON court_rules FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = court_rules.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON court_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON court_rules FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON court_rules FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_bookings FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM events WHERE events.id = event_bookings.event_id AND events.organiser_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON event_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_bookings FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_category_map FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM events WHERE events.id = event_category_map.event_id AND events.organiser_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON event_category_map FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_category_map FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_category_map FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_gallery_images FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM events WHERE events.id = event_gallery_images.event_id AND events.organiser_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON event_gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_gallery_images FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_gallery_images FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_sub_events FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM events WHERE events.id = event_sub_events.event_id AND events.organiser_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON event_sub_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_sub_events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_sub_events FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_tag_map FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM events WHERE events.id = event_tag_map.event_id AND events.organiser_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON event_tag_map FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_tag_map FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_tag_map FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON event_what_to_bring FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM events WHERE events.id = event_what_to_bring.event_id AND events.organiser_org_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON event_what_to_bring FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON event_what_to_bring FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON event_what_to_bring FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON events FOR SELECT USING (get_my_user_type() = 4 AND organiser_org_id = get_my_organisation_id());
CREATE POLICY "Employee Insert Policy" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON events FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON recurring_unavailability FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = recurring_unavailability.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON recurring_unavailability FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON recurring_unavailability FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON recurring_unavailability FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON refunds FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM transactions WHERE transactions.id = refunds.transaction_id));
CREATE POLICY "Employee Insert Policy" ON refunds FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON refunds FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON refunds FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON timeslots FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM courts WHERE courts.id = timeslots.court_id AND courts.organisation_id = get_my_organisation_id()));
CREATE POLICY "Employee Insert Policy" ON timeslots FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON timeslots FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON timeslots FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON transactions FOR SELECT USING (get_my_user_type() = 4 AND EXISTS (SELECT 1 FROM bookings WHERE bookings.id = transactions.reference_id AND reference_type = 'booking' AND EXISTS (SELECT 1 FROM courts WHERE courts.id = bookings.court_id AND courts.organisation_id = get_my_organisation_id())) OR EXISTS (SELECT 1 FROM event_bookings WHERE event_bookings.id = transactions.reference_id AND reference_type = 'event_booking' AND EXISTS (SELECT 1 FROM events WHERE events.id = event_bookings.event_id AND events.organiser_org_id = get_my_organisation_id())));
CREATE POLICY "Employee Insert Policy" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON transactions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON transactions FOR DELETE USING (true);

-- User-specific tables
CREATE POLICY "Employee Select Policy" ON chat_messages FOR SELECT USING (get_my_user_type() = 4 AND user_id = get_my_user_id());
CREATE POLICY "Employee Insert Policy" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON chat_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON chat_messages FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON chat_preferences FOR SELECT USING (get_my_user_type() = 4 AND user_id = get_my_user_id());
CREATE POLICY "Employee Insert Policy" ON chat_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON chat_preferences FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON chat_preferences FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON chat_sessions FOR SELECT USING (get_my_user_type() = 4 AND user_id = get_my_user_id());
CREATE POLICY "Employee Insert Policy" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON chat_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON chat_sessions FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON post FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON post FOR INSERT WITH CHECK (created_by_user_id = get_my_user_id());
CREATE POLICY "Employee Update Policy" ON post FOR UPDATE USING (created_by_user_id = get_my_user_id()) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON post FOR DELETE USING (created_by_user_id = get_my_user_id());

CREATE POLICY "Employee Select Policy" ON user_employee_entity_permissions FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON user_employee_entity_permissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON user_employee_entity_permissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON user_employee_entity_permissions FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON user_employee_permissions FOR SELECT USING (get_my_user_type() = 4);
CREATE POLICY "Employee Insert Policy" ON user_employee_permissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON user_employee_permissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON user_employee_permissions FOR DELETE USING (true);

CREATE POLICY "Employee Select Policy" ON user_profile FOR SELECT USING (get_my_user_type() = 4 AND id = get_my_user_id());
CREATE POLICY "Employee Insert Policy" ON user_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Employee Update Policy" ON user_profile FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Employee Delete Policy" ON user_profile FOR DELETE USING (true);

    