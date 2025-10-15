-- Add new columns for advanced booking rules to the courts table.
-- These rules provide more granular control over booking availability.

ALTER TABLE public.courts
ADD COLUMN IF NOT EXISTS booking_window INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS one_booking_per_user_per_day BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_booking_rolling BOOLEAN NOT NULL DEFAULT false;

-- booking_window: How many days in advance a user can book (e.g., 1 for today only, 2 for today and tomorrow).
-- one_booking_per_user_per_day: If true, a user can only have one booking per day on this court.
-- is_booking_rolling: If true, a slot can only be booked within the 24 hours before it starts.
