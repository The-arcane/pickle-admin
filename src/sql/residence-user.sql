-- Enable RLS for all specified tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;


-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "residence_user_access_bookings" ON public.bookings;
DROP POLICY IF EXISTS "residence_user_access_event_bookings" ON public.event_bookings;
DROP POLICY IF EXISTS "residence_user_access_shifts" ON public.shifts;
DROP POLICY IF EXISTS "residence_user_access_transactions" ON public.transactions;
DROP POLICY IF EXISTS "residence_user_access_user_profile" ON public.user_profile;
DROP POLICY IF EXISTS "residence_user_access_court_reviews" ON public.court_reviews;
DROP POLICY IF EXISTS "residence_user_access_community_messages" ON public.community_messages;
DROP POLICY IF EXISTS "residence_user_access_approvals" ON public.approvals;
DROP POLICY IF EXISTS "residence_user_access_post" ON public.post;
DROP POLICY IF EXISTS "residence_user_access_package_bookings" ON public.package_bookings;


-- Create policies for residence users (user_type = 1)

-- Bookings Table
CREATE POLICY "residence_user_access_bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND user_id = auth.uid());

-- Event Bookings Table
CREATE POLICY "residence_user_access_event_bookings"
ON public.event_bookings
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND user_id = auth.uid());

-- Shifts Table (Assuming it's user-specific, might need adjustment based on logic)
CREATE POLICY "residence_user_access_shifts"
ON public.shifts
FOR ALL
TO authenticated
USING (get_my_user_type() = 1)
WITH CHECK (get_my_user_type() = 1);

-- Transactions Table
CREATE POLICY "residence_user_access_transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (get_my_user_type() = 1) -- Simplified, might need user_id check depending on schema
WITH CHECK (get_my_user_type() = 1);

-- User Profile Table
CREATE POLICY "residence_user_access_user_profile"
ON public.user_profile
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND id = auth.uid());

-- Court Reviews Table
CREATE POLICY "residence_user_access_court_reviews"
ON public.court_reviews
FOR ALL
TO authenticated
USING (get_my_user_type() = 1) -- Simplified, assuming reviewer name/id is checked elsewhere
WITH CHECK (get_my_user_type() = 1);

-- Community Messages Table
CREATE POLICY "residence_user_access_community_messages"
ON public.community_messages
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND sender_id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND sender_id = auth.uid());

-- Approvals Table
CREATE POLICY "residence_user_access_approvals"
ON public.approvals
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND user_id = auth.uid());

-- Post Table
CREATE POLICY "residence_user_access_post"
ON public.post
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND created_by_user_id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND created_by_user_id = auth.uid());

-- Package Bookings Table
CREATE POLICY "residence_user_access_package_bookings"
ON public.package_bookings
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = auth.uid())
WITH CHECK (get_my_user_type() = 1 AND user_id = auth.uid());
