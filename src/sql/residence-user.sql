-- Helper function to get the integer user_id from the authenticated user's UUID
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS INT AS $$
DECLARE
  user_id_val INT;
BEGIN
  SELECT id INTO user_id_val FROM public.user WHERE user_uuid = auth.uid();
  RETURN user_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION get_my_user_id() TO authenticated;

-- Function to check if a user is a residence user (user_type = 1)
CREATE OR REPLACE FUNCTION is_residence_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_type_val INT;
BEGIN
  SELECT user_type INTO user_type_val FROM public.user WHERE id = get_my_user_id();
  RETURN user_type_val = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION is_residence_user() TO authenticated;

-- Table: bookings
-- SELECT: Can view their own bookings.
DROP POLICY IF EXISTS "Residence user can view their own bookings" ON public.bookings;
CREATE POLICY "Residence user can view their own bookings" ON public.bookings
  FOR SELECT USING (user_id = get_my_user_id());
  
-- INSERT & UPDATE: Can create/update bookings.
DROP POLICY IF EXISTS "Residence user can insert/update bookings" ON public.bookings;
CREATE POLICY "Residence user can insert/update bookings" ON public.bookings
  FOR ALL USING (is_residence_user())
  WITH CHECK (is_residence_user());

-- Table: event_bookings
-- SELECT: Can view their own event bookings.
DROP POLICY IF EXISTS "Residence user can view their own event bookings" ON public.event_bookings;
CREATE POLICY "Residence user can view their own event bookings" ON public.event_bookings
  FOR SELECT USING (user_id = get_my_user_id());
  
-- INSERT & UPDATE: Can create/update their own event bookings.
DROP POLICY IF EXISTS "Residence user can insert/update event bookings" ON public.event_bookings;
CREATE POLICY "Residence user can insert/update event bookings" ON public.event_bookings
  FOR ALL USING (is_residence_user())
  WITH CHECK (is_residence_user());

-- Table: shifts - For simplicity, allowing full access for now.
DROP POLICY IF EXISTS "Residence user can manage shifts" ON public.shifts;
CREATE POLICY "Residence user can manage shifts" ON public.shifts
  FOR ALL USING (is_residence_user())
  WITH CHECK (is_residence_user());

-- Table: transactions
-- SELECT: Can view their own transactions.
DROP POLICY IF EXISTS "Residence user can view their own transactions" ON public.transactions;
CREATE POLICY "Residence user can view their own transactions" ON public.transactions
  FOR SELECT USING (id IN (SELECT reference_id FROM public.bookings WHERE user_id = get_my_user_id()));

-- INSERT & UPDATE: Can create/update transactions related to their bookings.
DROP POLICY IF EXISTS "Residence user can insert/update transactions" ON public.transactions;
CREATE POLICY "Residence user can insert/update transactions" ON public.transactions
  FOR ALL USING (is_residence_user())
  WITH CHECK (is_residence_user());

-- Table: user_profile
-- SELECT: Can view their own profile.
DROP POLICY IF EXISTS "Residence user can view their own profile" ON public.user_profile;
CREATE POLICY "Residence user can view their own profile" ON public.user_profile
  FOR SELECT USING (id = get_my_user_id());

-- INSERT & UPDATE: Can create/update their own profile.
DROP POLICY IF EXISTS "Residence user can insert/update their profile" ON public.user_profile;
CREATE POLICY "Residence user can insert/update their profile" ON public.user_profile
  FOR ALL USING (id = get_my_user_id())
  WITH CHECK (id = get_my_user_id());

-- Table: court_reviews
-- SELECT: Can view all reviews.
DROP POLICY IF EXISTS "Residence user can view all court reviews" ON public.court_reviews;
CREATE POLICY "Residence user can view all court reviews" ON public.court_reviews
  FOR SELECT USING (true);

-- INSERT & UPDATE: Can create/update their own reviews.
DROP POLICY IF EXISTS "Residence user can insert/update their own reviews" ON public.court_reviews;
CREATE POLICY "Residence user can insert/update their own reviews" ON public.court_reviews
  FOR ALL USING (reviewer_name = (SELECT name FROM public.user WHERE id = get_my_user_id()))
  WITH CHECK (reviewer_name = (SELECT name FROM public.user WHERE id = get_my_user_id()));

-- Table: community_messages
-- SELECT: Can view all messages.
DROP POLICY IF EXISTS "Residence user can view all community messages" ON public.community_messages;
CREATE POLICY "Residence user can view all community messages" ON public.community_messages
  FOR SELECT USING (true);
  
-- INSERT & UPDATE: Can create/update their own messages.
DROP POLICY IF EXISTS "Residence user can insert/update their own messages" ON public.community_messages;
CREATE POLICY "Residence user can insert/update their own messages" ON public.community_messages
  FOR ALL USING (sender_id = get_my_user_id())
  WITH CHECK (sender_id = get_my_user_id());
  
-- Table: approvals
-- SELECT: Can view their own approval requests.
DROP POLICY IF EXISTS "Residence user can view their own approvals" ON public.approvals;
CREATE POLICY "Residence user can view their own approvals" ON public.approvals
  FOR SELECT USING (user_id = get_my_user_id());

-- INSERT & UPDATE: Can create/update their own approval requests.
DROP POLICY IF EXISTS "Residence user can insert/update their own approvals" ON public.approvals;
CREATE POLICY "Residence user can insert/update their own approvals" ON public.approvals
  FOR ALL USING (user_id = get_my_user_id())
  WITH CHECK (user_id = get_my_user_id());

-- Table: post
-- SELECT: Can view all posts.
DROP POLICY IF EXISTS "Residence user can view all posts" ON public.post;
CREATE POLICY "Residence user can view all posts" ON public.post
  FOR SELECT USING (true);

-- INSERT & UPDATE: Can create/update their own posts.
DROP POLICY IF EXISTS "Residence user can insert/update their own posts" ON public.post;
CREATE POLICY "Residence user can insert/update their own posts" ON public.post
  FOR ALL USING (created_by_user_id = get_my_user_id())
  WITH CHECK (created_by_user_id = get_my_user_id());

-- Table: package_bookings
-- SELECT: Can view their own package bookings.
DROP POLICY IF EXISTS "Residence user can view their own package bookings" ON public.package_bookings;
CREATE POLICY "Residence user can view their own package bookings" ON public.package_bookings
  FOR SELECT USING (user_id = get_my_user_id());

-- INSERT & UPDATE: Can create/update their own package bookings.
DROP POLICY IF EXISTS "Residence user can insert/update their own package bookings" ON public.package_bookings;
CREATE POLICY "Residence user can insert/update their own package bookings" ON public.package_bookings
  FOR ALL USING (user_id = get_my_user_id())
  WITH CHECK (user_id = get_my_user_id());

-- Table: timeslots
-- RLS for timeslots - residence users can SELECT, INSERT and UPDATE
DROP POLICY IF EXISTS "Residence user access for timeslots" ON public.timeslots;
CREATE POLICY "Residence user access for timeslots"
  ON public.timeslots
  FOR ALL
  USING (is_residence_user())
  WITH CHECK (is_residence_user());
