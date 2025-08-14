
'use server';
import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveSession(formData: FormData) {
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in.' };
    }

    const { data: userProfile } = await supabase.from('user').select('id, user_organisations(organisation_id)').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return { error: 'Could not find your user profile.' };
    }
    const organisationId = userProfile.user_organisations[0]?.organisation_id;
    if (!organisationId) {
        return { error: 'You are not associated with any organization.' };
    }

    const id = formData.get('id') as string | null;
    
    // Combine date and time into a full ISO string
    const date = formData.get('date') as string;
    const startTime = formData.get('start_time') as string;
    const endTime = formData.get('end_time') as string;

    if (!date || !startTime || !endTime) {
        return { error: 'Date, start time, and end time are required.' };
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const sessionData = {
        name: formData.get('name') as string,
        date: date,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: formData.get('location') as string,
        coach_id: Number(formData.get('coach_id')) || null,
        organisation_id: organisationId,
    };
    
    if (id && id !== 'add') {
        const { error } = await supabase.from('attendance_sessions').update(sessionData).eq('id', id);
        if (error) {
            console.error('Error updating session:', error);
            return { error: `Failed to update session: ${error.message}` };
        }
    } else {
        const { error } = await supabase.from('attendance_sessions').insert(sessionData);
        if (error) {
            console.error('Error creating session:', error);
            return { error: `Failed to create session: ${error.message}` };
        }
    }

    revalidatePath('/education/attendance/sessions');
    redirect('/education/attendance/sessions');
}
