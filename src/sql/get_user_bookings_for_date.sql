
-- This function retrieves all non-cancelled bookings for a given user on a specific date.
-- It joins bookings with timeslots to filter by date.
--
-- Parameters:
--   p_user_uuid: The UUID of the user to check for bookings.
--   p_date: The specific date to check, in 'YYYY-MM-DD' format.
--
-- Returns:
--   A table with the booking ID, timeslot ID, and court ID for each booking found.

CREATE OR REPLACE FUNCTION get_user_bookings_for_date(p_user_uuid UUID, p_date TEXT)
RETURNS TABLE(booking_id INT, timeslot_id INT, court_id INT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id AS booking_id,
        b.timeslot_id,
        b.court_id
    FROM
        public.bookings b
    JOIN
        public.timeslots t ON b.timeslot_id = t.id
    JOIN
        public.user u ON b.user_id = u.id
    WHERE
        u.user_uuid = p_user_uuid
        AND t.date = p_date::date
        AND b.booking_status != 0; -- Exclude cancelled bookings (assuming 0 is 'Cancelled')
END;
$$ LANGUAGE plpgsql;
