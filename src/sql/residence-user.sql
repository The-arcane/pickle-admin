-- Helper function to get the integer user ID of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS int AS $$
DECLARE
    my_user_id int;
BEGIN
    SELECT id INTO my_user_id
    FROM "user"
    WHERE user_uuid = auth.uid();
    RETURN my_user_id;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_bookings ENABLE ROW LEVEL SECURITY;


-- Create policies for residence users (user_type = 1)
-- Bookings
DROP POLICY IF EXISTS "Allow residence user full access on bookings" ON bookings;
CREATE POLICY "Allow residence user full access on bookings" ON bookings
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = get_my_user_id())
WITH CHECK (get_my_user_type() = 1 AND user_id = get_my_user_id());

-- Event Bookings
DROP POLICY IF EXISTS "Allow residence user full access on event_bookings" ON event_bookings;
CREATE POLICY "Allow residence user full access on event_bookings" ON event_bookings
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = get_my_user_id())
WITH CHECK (get_my_user_type() = 1 AND user_id = get_my_user_id());

-- Shifts (Assuming this relates to user shifts, adjust if logic is different)
DROP POLICY IF EXISTS "Allow residence user full access on shifts" ON shifts;
CREATE POLICY "Allow residence user full access on shifts" ON shifts
FOR ALL
TO authenticated
USING (get_my_user_type() = 1)
WITH CHECK (get_my_user_type() = 1);

-- Transactions
DROP POLICY IF EXISTS "Allow residence user full access on transactions" ON transactions;
CREATE POLICY "Allow residence user full access on transactions" ON transactions
FOR ALL
TO authenticated
USING (
    get_my_user_type() = 1 AND
    EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.id = transactions.reference_id AND b.user_id = get_my_user_id()
    )
)
WITH CHECK (get_my_user_type() = 1);

-- User Profile
DROP POLICY IF EXISTS "Allow residence user full access on user_profile" ON user_profile;
CREATE POLICY "Allow residence user full access on user_profile" ON user_profile
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND id = get_my_user_id())
WITH CHECK (get_my_user_type() = 1 AND id = get_my_user_id());

-- Court Reviews
DROP POLICY IF EXISTS "Allow residence user full access on court_reviews" ON court_reviews;
CREATE POLICY "Allow residence user full access on court_reviews" ON court_reviews
FOR ALL
TO authenticated
USING (get_my_user_type() = 1) -- Users can see all reviews, but only manage their own
WITH CHECK (get_my_user_type() = 1); -- This needs to be more specific if users can add reviews. Assuming no direct user_id link here.

-- Community Messages
DROP POLICY IF EXISTS "Allow residence user access on community_messages" ON community_messages;
CREATE POLICY "Allow residence user access on community_messages" ON community_messages
FOR ALL
TO authenticated
USING (get_my_user_type() = 1)
WITH CHECK (get_my_user_type() = 1 AND sender_id = get_my_user_id());

-- Approvals
DROP POLICY IF EXISTS "Allow residence user full access on approvals" ON approvals;
CREATE POLICY "Allow residence user full access on approvals" ON approvals
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = get_my_user_id())
WITH CHECK (get_my_user_type() = 1 AND user_id = get_my_user_id());

-- Posts
DROP POLICY IF EXISTS "Allow residence user full access on post" ON post;
CREATE POLICY "Allow residence user full access on post" ON post
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND created_by_user_id = get_my_user_id())
WITH CHECK (get_my_user_type() = 1 AND created_by_user_id = get_my_user_id());

-- Package Bookings
DROP POLICY IF EXISTS "Allow residence user full access on package_bookings" ON package_bookings;
CREATE POLICY "Allow residence user full access on package_bookings" ON package_bookings
FOR ALL
TO authenticated
USING (get_my_user_type() = 1 AND user_id = get_my_user_id())
WITH CHECK (get_my_user_type() = 1 AND user_id = get_my_user_id());
