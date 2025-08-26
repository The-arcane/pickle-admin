-- Policies for 'alembic_version'
CREATE POLICY "policy_superadmin_all_alembic_version" ON "public"."alembic_version" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'amenities'
CREATE POLICY "policy_superadmin_all_amenities" ON "public"."amenities" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'approvals'
CREATE POLICY "policy_superadmin_all_approvals" ON "public"."approvals" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'availability_blocks'
CREATE POLICY "policy_superadmin_all_availability_blocks" ON "public"."availability_blocks" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'booking_logs'
CREATE POLICY "policy_superadmin_all_booking_logs" ON "public"."booking_logs" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'booking_status'
CREATE POLICY "policy_superadmin_all_booking_status" ON "public"."booking_status" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'bookings'
CREATE POLICY "policy_superadmin_all_bookings" ON "public"."bookings" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'channel_invitations'
CREATE POLICY "policy_superadmin_all_channel_invitations" ON "public"."channel_invitations" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'channel_members'
CREATE POLICY "policy_superadmin_all_channel_members" ON "public"."channel_members" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'chat_messages'
CREATE POLICY "policy_superadmin_all_chat_messages" ON "public"."chat_messages" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'chat_preferences'
CREATE POLICY "policy_superadmin_all_chat_preferences" ON "public"."chat_preferences" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'chat_sessions'
CREATE POLICY "policy_superadmin_all_chat_sessions" ON "public"."chat_sessions" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'coach_pricing'
CREATE POLICY "policy_superadmin_all_coach_pricing" ON "public"."coach_pricing" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'coach_sports'
CREATE POLICY "policy_superadmin_all_coach_sports" ON "public"."coach_sports" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'coaches'
CREATE POLICY "policy_superadmin_all_coaches" ON "public"."coaches" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'community_messages'
CREATE POLICY "policy_superadmin_all_community_messages" ON "public"."community_messages" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'court_amenities'
CREATE POLICY "policy_superadmin_all_court_amenities" ON "public"."court_amenities" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'court_contacts'
CREATE POLICY "policy_superadmin_all_court_contacts" ON "public"."court_contacts" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'court_gallery'
CREATE POLICY "policy_superadmin_all_court_gallery" ON "public"."court_gallery" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'court_reviews'
CREATE POLICY "policy_superadmin_all_court_reviews" ON "public"."court_reviews" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'court_rules'
CREATE POLICY "policy_superadmin_all_court_rules" ON "public"."court_rules" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'court_status'
CREATE POLICY "policy_superadmin_all_court_status" ON "public"."court_status" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'courts'
CREATE POLICY "policy_superadmin_all_courts" ON "public"."courts" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_booking_status'
CREATE POLICY "policy_superadmin_all_event_booking_status" ON "public"."event_booking_status" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_bookings'
CREATE POLICY "policy_superadmin_all_event_bookings" ON "public"."event_bookings" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_categories'
CREATE POLICY "policy_superadmin_all_event_categories" ON "public"."event_categories" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_category_map'
CREATE POLICY "policy_superadmin_all_event_category_map" ON "public"."event_category_map" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_gallery_images'
CREATE POLICY "policy_superadmin_all_event_gallery_images" ON "public"."event_gallery_images" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_sub_events'
CREATE POLICY "policy_superadmin_all_event_sub_events" ON "public"."event_sub_events" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_tag_map'
CREATE POLICY "policy_superadmin_all_event_tag_map" ON "public"."event_tag_map" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_tags'
CREATE POLICY "policy_superadmin_all_event_tags" ON "public"."event_tags" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'event_what_to_bring'
CREATE POLICY "policy_superadmin_all_event_what_to_bring" ON "public"."event_what_to_bring" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'events'
CREATE POLICY "policy_superadmin_all_events" ON "public"."events" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'events_status'
CREATE POLICY "policy_superadmin_all_events_status" ON "public"."events_status" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'organisation_roles'
CREATE POLICY "policy_superadmin_all_organisation_roles" ON "public"."organisation_roles" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'organisation_types'
CREATE POLICY "policy_superadmin_all_organisation_types" ON "public"."organisation_types" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'organisations'
CREATE POLICY "policy_superadmin_all_organisations" ON "public"."organisations" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'organisations_website'
CREATE POLICY "policy_superadmin_all_organisations_website" ON "public"."organisations_website" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'package_bookings'
CREATE POLICY "policy_superadmin_all_package_bookings" ON "public"."package_bookings" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'packages'
CREATE POLICY "policy_superadmin_all_packages" ON "public"."packages" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'permission_entity'
CREATE POLICY "policy_superadmin_all_permission_entity" ON "public"."permission_entity" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'post'
CREATE POLICY "policy_superadmin_all_post" ON "public"."post" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'rate_limit'
CREATE POLICY "policy_superadmin_all_rate_limit" ON "public"."rate_limit" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'realtime_channels'
CREATE POLICY "policy_superadmin_all_realtime_channels" ON "public"."realtime_channels" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'recurring_unavailability'
CREATE POLICY "policy_superadmin_all_recurring_unavailability" ON "public"."recurring_unavailability" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'refunds'
CREATE POLICY "policy_superadmin_all_refunds" ON "public"."refunds" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'residence_status'
CREATE POLICY "policy_superadmin_all_residence_status" ON "public"."residence_status" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'residences'
CREATE POLICY "policy_superadmin_all_residences" ON "public"."residences" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'shifts'
CREATE POLICY "policy_superadmin_all_shifts" ON "public"."shifts" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'sports'
CREATE POLICY "policy_superadmin_all_sports" ON "public"."sports" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'tier'
CREATE POLICY "policy_superadmin_all_tier" ON "public"."tier" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'timeslots'
CREATE POLICY "policy_superadmin_all_timeslots" ON "public"."timeslots" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'token_blacklist'
CREATE POLICY "policy_superadmin_all_token_blacklist" ON "public"."token_blacklist" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'transaction_reference_types'
CREATE POLICY "policy_superadmin_all_transaction_reference_types" ON "public"."transaction_reference_types" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'transaction_status'
CREATE POLICY "policy_superadmin_all_transaction_status" ON "public"."transaction_status" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'transactions'
CREATE POLICY "policy_superadmin_all_transactions" ON "public"."transactions" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'user'
CREATE POLICY "policy_superadmin_all_user" ON "public"."user" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'user_employee_entity_permissions'
CREATE POLICY "policy_superadmin_all_user_employee_entity_permissions" ON "public"."user_employee_entity_permissions" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'user_employee_permissions'
CREATE POLICY "policy_superadmin_all_user_employee_permissions" ON "public"."user_employee_permissions" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'user_organisations'
CREATE POLICY "policy_superadmin_all_user_organisations" ON "public"."user_organisations" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));

-- Policies for 'user_profile'
CREATE POLICY "policy_superadmin_all_user_profile" ON "public"."user_profile" FOR ALL USING ((get_user_type() = 3)) WITH CHECK ((get_user_type() = 3));
