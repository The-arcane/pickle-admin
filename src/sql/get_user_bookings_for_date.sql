
-- This function retrieves all active bookings for a specific user on a given date.
-- It joins bookings with timeslots to filter by date and returns booking details.

create or replace function get_user_bookings_for_date(p_user_id integer, p_date date)
returns table (
    id integer,
    booking_status integer
)
language plpgsql
as $$
begin
    return query
    select
        b.id,
        b.booking_status
    from
        public.bookings b
    join
        public.timeslots t on b.timeslot_id = t.id
    where
        b.user_id = p_user_id
        and t.date = p_date
        and b.booking_status in (1, 2); -- 1: Confirmed, 2: Pending
end;$$;

