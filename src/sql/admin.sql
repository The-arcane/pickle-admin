-- Policies for Administrator (user_type = 2)

-- #################################
-- ### Helpers                   ###
-- #################################

-- (The helper functions get_my_user_type() and get_my_organisation_id() are assumed to exist from previous steps)


-- #################################
-- ### Tables with direct org_id ###
-- #################################

-- === courts ===
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view courts in their org" ON public.courts FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can insert courts into their org" ON public.courts FOR INSERT TO authenticated WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update courts in their org" ON public.courts FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id()) WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete courts in their org" ON public.courts FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === approvals ===
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view approvals in their org" ON public.approvals FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update approvals in their org" ON public.approvals FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete approvals in their org" ON public.approvals FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === packages ===
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view packages in their org" ON public.packages FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can insert packages into their org" ON public.packages FOR INSERT TO authenticated WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update packages in their org" ON public.packages FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete packages in their org" ON public.packages FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === package_bookings ===
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view package_bookings in their org" ON public.package_bookings FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can insert package_bookings into their org" ON public.package_bookings FOR INSERT TO authenticated WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update package_bookings in their org" ON public.package_bookings FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete package_bookings in their org" ON public.package_bookings FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === coaches ===
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view coaches in their org" ON public.coaches FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can insert coaches into their org" ON public.coaches FOR INSERT TO authenticated WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update coaches in their org" ON public.coaches FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete coaches in their org" ON public.coaches FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === user_organisations ===
ALTER TABLE public.user_organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view user_organisations in their org" ON public.user_organisations FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can insert user_organisations into their org" ON public.user_organisations FOR INSERT TO authenticated WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update user_organisations in their org" ON public.user_organisations FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete user_organisations in their org" ON public.user_organisations FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === residences ===
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view residences in their org" ON public.residences FOR SELECT TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can insert residences into their org" ON public.residences FOR INSERT TO authenticated WITH CHECK (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can update residences in their org" ON public.residences FOR UPDATE TO authenticated USING (organisation_id = get_my_organisation_id());
CREATE POLICY "Admin can delete residences in their org" ON public.residences FOR DELETE TO authenticated USING (organisation_id = get_my_organisation_id());

-- === realtime_channels ===
ALTER TABLE public.realtime_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view channels in their org" ON public.realtime_channels FOR SELECT TO authenticated USING (owner_org_id = get_my_organisation_id());
CREATE POLICY "Admin can insert channels into their org" ON public.realtime_channels FOR INSERT TO authenticated WITH CHECK (owner_org_id = get_my_organisation_id());
CREATE POLICY "Admin can update channels in their org" ON public.realtime_channels FOR UPDATE TO authenticated USING (owner_org_id = get_my_organisation_id());
CREATE POLICY "Admin can delete channels in their org" ON public.realtime_channels FOR DELETE TO authenticated USING (owner_org_id = get_my_organisation_id());


-- #######################################
-- ### Tables with indirect org linkage ###
-- #######################################

-- === Linked via courts.organisation_id ===
CREATE POLICY "Admin can view timeslots" ON public.timeslots FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = timeslots.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view availability_blocks" ON public.availability_blocks FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = availability_blocks.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view recurring_unavailability" ON public.recurring_unavailability FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = recurring_unavailability.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view court_rules" ON public.court_rules FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = court_rules.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view court_contacts" ON public.court_contacts FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = court_contacts.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view court_amenities" ON public.court_amenities FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = court_amenities.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view court_gallery" ON public.court_gallery FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = court_gallery.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view court_reviews" ON public.court_reviews FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = court_reviews.court_id) AND (courts.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view bookings" ON public.bookings FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM courts WHERE ((courts.id = bookings.court_id) AND (courts.organisation_id = get_my_organisation_id())))));

-- === Linked via events.organiser_org_id ===
CREATE POLICY "Admin can view events" ON public.events FOR SELECT TO authenticated USING (organiser_org_id = get_my_organisation_id());
CREATE POLICY "Admin can view event_bookings" ON public.event_bookings FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM events WHERE ((events.id = event_bookings.event_id) AND (events.organiser_org_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view event_sub_events" ON public.event_sub_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM events WHERE ((events.id = event_sub_events.event_id) AND (events.organiser_org_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view event_what_to_bring" ON public.event_what_to_bring FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM events WHERE ((events.id = event_what_to_bring.event_id) AND (events.organiser_org_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view event_gallery_images" ON public.event_gallery_images FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM events WHERE ((events.id = event_gallery_images.event_id) AND (events.organiser_org_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view event_category_map" ON public.event_category_map FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM events WHERE ((events.id = event_category_map.event_id) AND (events.organiser_org_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view event_tag_map" ON public.event_tag_map FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM events WHERE ((events.id = event_tag_map.event_id) AND (events.organiser_org_id = get_my_organisation_id())))));

-- === Linked via coaches.organisation_id ===
CREATE POLICY "Admin can view coach_sports" ON public.coach_sports FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM coaches WHERE ((coaches.id = coach_sports.coach_id) AND (coaches.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can view coach_pricing" ON public.coach_pricing FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM coaches WHERE ((coaches.id = coach_pricing.coach_id) AND (coaches.organisation_id = get_my_organisation_id())))));

-- === Linked via users in org ===
CREATE POLICY "Admin can view user_employee_permissions" ON public.user_employee_permissions FOR SELECT TO authenticated USING ((EXISTS (SELECT 1 FROM user_organisations WHERE user_organisations.user_id = user_employee_permissions.manager_id AND user_organisations.organisation_id = get_my_organisation_id())));
CREATE POLICY "Admin can view user_employee_entity_permissions" ON public.user_employee_entity_permissions FOR SELECT TO authenticated USING ((EXISTS (SELECT 1 FROM user_employee_permissions uep JOIN user_organisations uo ON uep.manager_id = uo.user_id WHERE uo.organisation_id = get_my_organisation_id() AND uep.id = user_employee_entity_permissions.user_employee_permission_id)));
CREATE POLICY "Admin can view channel_invitations" ON public.channel_invitations FOR SELECT TO authenticated USING ((EXISTS (SELECT 1 FROM realtime_channels WHERE realtime_channels.id = channel_invitations.channel_id AND realtime_channels.owner_org_id = get_my_organisation_id())));


-- #################################
-- ### Read-only and User Tables ###
-- #################################

-- Admins can read these tables freely
ALTER TABLE public.booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view booking_status" ON public.booking_status FOR SELECT TO authenticated USING (true);

ALTER TABLE public.event_booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view event_booking_status" ON public.event_booking_status FOR SELECT TO authenticated USING (true);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view sports" ON public.sports FOR SELECT TO authenticated USING (true);

ALTER TABLE public.organisation_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view organisation_roles" ON public.organisation_roles FOR SELECT TO authenticated USING (true);

ALTER TABLE public.permission_entity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view permission_entity" ON public.permission_entity FOR SELECT TO authenticated USING (true);

-- Admins can view users within their own organization.
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view users in their org" ON public."user" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM user_organisations WHERE (("user".id = user_organisations.user_id) AND (user_organisations.organisation_id = get_my_organisation_id())))));
CREATE POLICY "Admin can update users in their org" ON public."user" FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1 FROM user_organisations WHERE (("user".id = user_organisations.user_id) AND (user_organisations.organisation_id = get_my_organisation_id())))));
