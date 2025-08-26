-- First, ensure the helper function to get the user's integer ID exists and is correct.
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS INT AS $$
DECLARE
    user_id INT;
BEGIN
    SELECT id INTO user_id
    FROM public."user"
    WHERE user_uuid = auth.uid()
    LIMIT 1;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies for a clean slate, just in case.
-- Note: This is commented out to prevent errors on first run, but can be useful for debugging.
/*
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename) || ';';
    END LOOP;
END $$;
*/

-- =================================================================
-- Table: bookings
-- =================================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_bookings_select" ON public.bookings;
CREATE POLICY "residence_user_bookings_select" ON public.bookings
    FOR SELECT
    TO authenticated
    USING (get_my_user_id() = user_id);

DROP POLICY IF EXISTS "residence_user_bookings_insert" ON public.bookings;
CREATE POLICY "residence_user_bookings_insert" ON public.bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "residence_user_bookings_update" ON public.bookings;
CREATE POLICY "residence_user_bookings_update" ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (get_my_user_id() = user_id)
    WITH CHECK (true);

DROP POLICY IF EXISTS "residence_user_bookings_delete" ON public.bookings;
CREATE POLICY "residence_user_bookings_delete" ON public.bookings
    FOR DELETE
    TO authenticated
    USING (get_my_user_id() = user_id);

-- =================================================================
-- Table: event_bookings
-- =================================================================
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_event_bookings_select" ON public.event_bookings;
CREATE POLICY "residence_user_event_bookings_select" ON public.event_bookings
    FOR SELECT
    TO authenticated
    USING (get_my_user_id() = user_id);

DROP POLICY IF EXISTS "residence_user_event_bookings_insert" ON public.event_bookings;
CREATE POLICY "residence_user_event_bookings_insert" ON public.event_bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
DROP POLICY IF EXISTS "residence_user_event_bookings_update" ON public.event_bookings;
CREATE POLICY "residence_user_event_bookings_update" ON public.event_bookings
    FOR UPDATE
    TO authenticated
    USING (get_my_user_id() = user_id)
    WITH CHECK (true);

DROP POLICY IF EXISTS "residence_user_event_bookings_delete" ON public.event_bookings;
CREATE POLICY "residence_user_event_bookings_delete" ON public.event_bookings
    FOR DELETE
    TO authenticated
    USING (get_my_user_id() = user_id);
    
-- =================================================================
-- Table: shifts
-- =================================================================
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_shifts_select" ON public.shifts;
CREATE POLICY "residence_user_shifts_select" ON public.shifts
    FOR SELECT
    TO authenticated
    USING (true); -- Shifts are likely generic, so all can view

DROP POLICY IF EXISTS "residence_user_shifts_write" ON public.shifts;
CREATE POLICY "residence_user_shifts_write" ON public.shifts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =================================================================
-- Table: transactions
-- =================================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- For transactions, we might need a more complex join to find the user.
-- Assuming a transaction is linked via a booking, this is a placeholder.
-- A direct user_id on transactions table would be better.
-- For now, allowing insert/update.
DROP POLICY IF EXISTS "residence_user_transactions_select" ON public.transactions;
CREATE POLICY "residence_user_transactions_select" ON public.transactions
    FOR SELECT
    TO authenticated
    USING (true); -- This might need to be locked down further depending on schema.

DROP POLICY IF EXISTS "residence_user_transactions_insert" ON public.transactions;
CREATE POLICY "residence_user_transactions_insert" ON public.transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
DROP POLICY IF EXISTS "residence_user_transactions_update" ON public.transactions;
CREATE POLICY "residence_user_transactions_update" ON public.transactions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "residence_user_transactions_delete" ON public.transactions;
CREATE POLICY "residence_user_transactions_delete" ON public.transactions
    FOR DELETE
    TO authenticated
    USING (true);

-- =================================================================
-- Table: user_profile
-- =================================================================
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_profile_select" ON public.user_profile;
CREATE POLICY "residence_user_profile_select" ON public.user_profile
    FOR SELECT
    TO authenticated
    USING (get_my_user_id() = id);

DROP POLICY IF EXISTS "residence_user_profile_insert" ON public.user_profile;
CREATE POLICY "residence_user_profile_insert" ON public.user_profile
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
DROP POLICY IF EXISTS "residence_user_profile_update" ON public.user_profile;
CREATE POLICY "residence_user_profile_update" ON public.user_profile
    FOR UPDATE
    TO authenticated
    USING (get_my_user_id() = id)
    WITH CHECK (true);

DROP POLICY IF EXISTS "residence_user_profile_delete" ON public.user_profile;
CREATE POLICY "residence_user_profile_delete" ON public.user_profile
    FOR DELETE
    TO authenticated
    USING (get_my_user_id() = id);

-- =================================================================
-- Table: court_reviews
-- =================================================================
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;
-- Assuming reviewer_name can be linked to user, but no direct user_id.
-- This policy is permissive for now. A user_id column would be better.
DROP POLICY IF EXISTS "residence_user_court_reviews_all" ON public.court_reviews;
CREATE POLICY "residence_user_court_reviews_all" ON public.court_reviews
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =================================================================
-- Table: community_messages
-- =================================================================
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_community_messages_select" ON public.community_messages;
CREATE POLICY "residence_user_community_messages_select" ON public.community_messages
    FOR SELECT
    TO authenticated
    USING (true); -- All members of a channel can see messages

DROP POLICY IF EXISTS "residence_user_community_messages_insert" ON public.community_messages;
CREATE POLICY "residence_user_community_messages_insert" ON public.community_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (get_my_user_id() = sender_id);
    
DROP POLICY IF EXISTS "residence_user_community_messages_update" ON public.community_messages;
CREATE POLICY "residence_user_community_messages_update" ON public.community_messages
    FOR UPDATE
    TO authenticated
    USING (get_my_user_id() = sender_id)
    WITH CHECK (get_my_user_id() = sender_id);

DROP POLICY IF EXISTS "residence_user_community_messages_delete" ON public.community_messages;
CREATE POLICY "residence_user_community_messages_delete" ON public.community_messages
    FOR DELETE
    TO authenticated
    USING (get_my_user_id() = sender_id);

-- =================================================================
-- Table: approvals
-- =================================================================
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_approvals_select" ON public.approvals;
CREATE POLICY "residence_user_approvals_select" ON public.approvals
    FOR SELECT
    TO authenticated
    USING (get_my_user_id() = user_id);

DROP POLICY IF EXISTS "residence_user_approvals_insert" ON public.approvals;
CREATE POLICY "residence_user_approvals_insert" ON public.approvals
    FOR INSERT
    TO authenticated
    WITH CHECK (get_my_user_id() = user_id);

-- No update/delete for users on their own approvals.
-- This should be handled by an admin.

-- =================================================================
-- Table: post
-- =================================================================
ALTER TABLE public.post ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_post_select" ON public.post;
CREATE POLICY "residence_user_post_select" ON public.post
    FOR SELECT
    TO authenticated
    USING (true); -- Assuming posts are public within an org

DROP POLICY IF EXISTS "residence_user_post_insert" ON public.post;
CREATE POLICY "residence_user_post_insert" ON public.post
    FOR INSERT
    TO authenticated
    WITH CHECK (get_my_user_id() = created_by_user_id);
    
DROP POLICY IF EXISTS "residence_user_post_update" ON public.post;
CREATE POLICY "residence_user_post_update" ON public.post
    FOR UPDATE
    TO authenticated
    USING (get_my_user_id() = created_by_user_id)
    WITH CHECK (get_my_user_id() = created_by_user_id);

DROP POLICY IF EXISTS "residence_user_post_delete" ON public.post;
CREATE POLICY "residence_user_post_delete" ON public.post
    FOR DELETE
    TO authenticated
    USING (get_my_user_id() = created_by_user_id);

-- =================================================================
-- Table: package_bookings
-- =================================================================
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_package_bookings_select" ON public.package_bookings;
CREATE POLICY "residence_user_package_bookings_select" ON public.package_bookings
    FOR SELECT
    TO authenticated
    USING (get_my_user_id() = user_id);

DROP POLICY IF EXISTS "residence_user_package_bookings_insert" ON public.package_bookings;
CREATE POLICY "residence_user_package_bookings_insert" ON public.package_bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
DROP POLICY IF EXISTS "residence_user_package_bookings_update" ON public.package_bookings;
CREATE POLICY "residence_user_package_bookings_update" ON public.package_bookings
    FOR UPDATE
    TO authenticated
    USING (get_my_user_id() = user_id)
    WITH CHECK (true);

DROP POLICY IF EXISTS "residence_user_package_bookings_delete" ON public.package_bookings;
CREATE POLICY "residence_user_package_bookings_delete" ON public.package_bookings
    FOR DELETE
    TO authenticated
    USING (get_my_user_id() = user_id);
    
-- =================================================================
-- Table: timeslots
-- =================================================================
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "residence_user_timeslots_all" ON public.timeslots;
CREATE POLICY "residence_user_timeslots_all" ON public.timeslots
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);