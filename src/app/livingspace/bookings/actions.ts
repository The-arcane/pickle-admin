

'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseISO, format, differenceInHours } from 'date-fns';
import { randomUUID } from 'crypto';

const statusMapToDb: { [key: string]: number } = {
  'Pending': 1,
  'Confirmed': 2,
  'Cancelled': 3,
  'Completed': 4,
  'No-show': 5,
  'Ongoing': 6
};

const eventStatusMapToDb: { [key: string]: number } = {
  'Pending': 1,
  'Confirmed': 2,
  'Cancelled': 3,
};


export async function addBooking(formData: FormData) {
  const supabase = await createServer();
  const user_id = formData.get('user_id') as string;
  const court_id = formData.get('court_id') as string;
  const timeslot_id = formData.get('timeslot_id') as string; // This will now be the start time e.g., "09:00"
  const status = formData.get('status') as string;
  const date_string = formData.get('date') as string;

  const statusValue = statusMapToDb[status];

  if (!user_id || !court_id || !timeslot_id || statusValue === undefined || !date_string) {
    return { error: 'All fields are required.' };
  }
  
  const [hour, minute] = timeslot_id.split(':').map(Number);
  const startTimeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const endTimeString = `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  const { data, error } = await supabase.rpc('book_court_timeslot', {
    p_court_id: Number(court_id),
    p_user_id: Number(user_id),
    p_date: date_string,
    p_start_time: startTimeString,
    p_end_time: endTimeString,
  });

  if (error) {
    console.error('Error adding booking via RPC:', error);
    if (error.message.includes('already booked')) {
        return { error: 'This timeslot has already been booked. Please select another.' };
    }
    if (error.message.includes('User already has a booking')) {
        return { error: 'This user already has a booking on this court for today.' };
    }
    return { error: `Failed to add booking: ${error.message}` };
  }

  const bookingData = data;
  const qrContentId = `C${bookingData.id}`;
  await supabase
      .from('bookings')
      .update({ qr_content_id: qrContentId, booking_status: statusValue }) // Also update status here
      .eq('id', bookingData.id);

  revalidatePath('/livingspace/bookings');
  revalidatePath('/livingspace');
  revalidatePath('/arena/bookings');
  return { success: true };
}

export async function updateBooking(formData: FormData) {
  const supabase = await createServer();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const court_id = formData.get('court_id') as string;
  const timeslot_id = formData.get('timeslot_id') as string;

  if (!id) {
    return { error: 'Booking ID is missing.' };
  }
  
  // Find the correct numeric value for the status label
  const statusObject = await supabase.from('booking_status').select('id').eq('label', status).single();
  if (!statusObject.data) {
    return { error: 'Invalid status value.' };
  }
  const statusValue = statusObject.data.id;


  if (!court_id || !timeslot_id) {
    return { error: 'Court and Timeslot are required.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ 
      booking_status: statusValue,
      court_id: Number(court_id),
      timeslot_id: Number(timeslot_id),
     })
    .eq('id', id);

  if (error) {
    console.error('Error updating booking:', error);
    if (error.code === '23505') {
        return { error: 'This timeslot is already booked by someone else.' };
    }
    return { error: 'Failed to update booking.' };
  }

  revalidatePath('/livingspace/bookings');
  revalidatePath('/livingspace');
  revalidatePath('/arena/bookings');
  return { success: true };
}

export async function cancelBooking(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id') as string;

    if (!id) {
        return { error: 'Booking ID is missing.' };
    }

    const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 3 }) // 3 is for Cancelled
        .eq('id', id);
    
    if (error) {
        console.error('Error cancelling booking:', error);
        return { error: `Failed to cancel booking: ${error.message}` };
    }

    revalidatePath('/livingspace/bookings');
    revalidatePath('/arena/bookings');
    revalidatePath('/livingspace');
    return { success: true, message: 'Booking has been cancelled.' };
}

export async function updateEventBookingStatus(formData: FormData) {
  const supabase = await createServer();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;

  if (!id || !status) {
    return { error: 'Booking ID and status are required.' };
  }

  const statusId = eventStatusMapToDb[status];
  if (statusId === undefined) {
    return { error: 'Invalid event booking status provided.' };
  }

  const { error } = await supabase
    .from('event_bookings')
    .update({ status: statusId })
    .eq('id', id);

  if (error) {
    console.error('Error updating event booking status:', error);
    return { error: `Failed to update event booking status: ${error.message}` };
  }

  revalidatePath('/livingspace/bookings');
  revalidatePath('/arena/bookings');
  return { success: true, message: 'Event booking status updated.' };
}

export async function getTimeslots(courtId: number, date: string, targetUserId?: number, bookingIdToExclude?: number) {
    const supabase = await createServer();
    if (!courtId || !date) {
      throw new Error("Court ID and date are required.");
    }
  
    const selectedDateObj = parseISO(date);
    const now = new Date();
  
    const { data: courtRules, error: courtError } = await supabase
      .from("courts")
      .select("is_booking_rolling, booking_window, one_booking_per_user_per_day, c_start_time, c_end_time")
      .eq("id", courtId)
      .single();
  
    if (courtError || !courtRules) {
      console.error("Error fetching court details:", courtError);
      throw new Error("Could not fetch court booking rules.");
    }
   
    let userHasBooking = false;
    let flatHasBooking = false;

    if (targetUserId) {
        // Rule 1: Check if user already booked today
        if (courtRules.one_booking_per_user_per_day) {
            const { data: userBookings, error: userBookingsError } = await supabase.rpc(
                "get_user_bookings_for_date",
                { p_user_id: targetUserId, p_date: date }
            );

            if (userBookingsError) {
                console.error("Error fetching user bookings:", userBookingsError);
            } else if (userBookings && userBookings.length > 0) {
                const isEditingOwnBooking = userBookings.length === 1 && bookingIdToExclude && userBookings[0].id === bookingIdToExclude;
                if (!isEditingOwnBooking) {
                    userHasBooking = true;
                }
            }
        }
        
        // Rule 2: For residential app, check if flat has booked today
        // This is a stand-in for app type detection.
        const isResidentialApp = true; 
        if (isResidentialApp) {
            const { data: hasBooked, error: flatBookingError } = await supabase.rpc(
                'has_flat_booked_for_date',
                { p_user_id: targetUserId, p_booking_date: date }
            );

            if (flatBookingError) {
                console.error('Error checking flat booking status:', flatBookingError);
            } else {
                flatHasBooking = hasBooked;
            }
        }
    }


    const { data: bookingsData, error: bookingsError } = await supabase
      .rpc("get_booked_timeslots_for_court_and_date", {
        p_court_id: courtId,
        p_date: date,
      });
  
    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw new Error("Could not check court availability.");
    }
    
    const bookedSlotsMap = new Map<string, { name: string; phone: string } | null>();
    (bookingsData || []).forEach((b: any) => {
        const startTimeStr = format(parseISO(b.start_time), 'HH:mm');
        bookedSlotsMap.set(startTimeStr, {
            name: b.user_name || "Unknown",
            phone: b.user_phone || "N/A",
        });
    });
  
    const allPossibleSlots: { startTime: string; endTime: string }[] = [];
    const courtStartTime = courtRules.c_start_time ? parseInt(courtRules.c_start_time.split(':')[0], 10) : 6;
    const courtEndTime = courtRules.c_end_time ? parseInt(courtRules.c_end_time.split(':')[0], 10) : 22;

    for (let i = courtStartTime; i < courtEndTime; i++) {
      allPossibleSlots.push({
        startTime: `${i}:00`.padStart(5, "0"),
        endTime: `${i + 1}:00`.padStart(5, "0"),
      });
    }

    return allPossibleSlots.map((slot, index) => {
      const [slotHour, slotMinute] = slot.startTime.split(":").map(Number);
      const slotDateTime = new Date(selectedDateObj);
      slotDateTime.setHours(slotHour, slotMinute, 0, 0);

      const isBooked = bookedSlotsMap.has(slot.startTime);
      const isPastSlot = slotDateTime < now;
      
      let isDisable = isBooked || isPastSlot || userHasBooking || flatHasBooking;
      let reasonDesc = "Available";
      let color = "bg-background";

      if (isBooked) {
        reasonDesc = `Booked by ${bookedSlotsMap.get(slot.startTime)?.name || 'someone'}`;
        color = "bg-red-100";
      } else if (isPastSlot) {
        reasonDesc = "Time has passed";
        color = "bg-muted";
      } else if (userHasBooking) {
        reasonDesc = "Target user already has a booking for this day";
        color = "bg-blue-100";
      } else if (flatHasBooking) {
        reasonDesc = "A booking for today already exists for this user's flat.";
        color = "bg-orange-100";
      } else if (courtRules.is_booking_rolling) {
          const hoursFromNow = differenceInHours(slotDateTime, now);
          if (hoursFromNow > 24) {
              isDisable = true;
              reasonDesc = "Booking opens 24h before";
              color = "bg-yellow-100";
          }
      }
      
      return {
        // Use the start time as a temporary ID for the UI
        id: slot.startTime, 
        startTime: slot.startTime,
        endTime: slot.endTime,
        isDisable: isDisable,
        reasonDesc: reasonDesc,
        color: color,
      };
    });
  }

