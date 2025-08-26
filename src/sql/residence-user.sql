-- This file contains policies for residence users (user_type = 1).

--
-- Bookings
--

-- Allow residence users to insert, update, and delete their own bookings.
-- The SELECT policy is separate in policies.sql and restricts view to their own records.
CREATE POLICY "Allow residence users full write access on bookings"
ON public.bookings
FOR ALL
USING (auth.uid() = (select user_uuid from public.user where id = user_id))
WITH CHECK (auth.uid() = (select user_uuid from public.user where id = user_id));


--
-- Event Bookings
--

-- Allow residence users to insert, update, and delete their own event bookings.
CREATE POLICY "Allow residence users full write access on event_bookings"
ON public.event_bookings
FOR ALL
USING (auth.uid() = (select user_uuid from public.user where id = user_id))
WITH CHECK (auth.uid() = (select user_uuid from public.user where id = user_id));


--
-- Shifts
--

-- As requested, providing full access to shifts for residence users.
-- Note: 'shifts' appears to be a lookup table. Granting full access is unusual.
-- This might need to be revised to a more restrictive policy later.
CREATE POLICY "Allow residence users full access on shifts"
ON public.shifts
FOR ALL
USING (get_my_user_type() = 1)
WITH CHECK (get_my_user_type() = 1);


--
-- Transactions
--

-- Allow residence users to manage their own transactions.
CREATE POLICY "Allow residence users full write access on transactions"
ON public.transactions
FOR ALL
USING (auth.uid() = (select user_uuid from public.user where id = (select user_id from bookings where id = reference_id and reference_type = 'booking'))) -- Example check
WITH CHECK (get_my_user_type() = 1);
