'use server';
import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveAttendance(formData: FormData) {
    // const supabase = await createServer();
    // const sessionId = formData.get('session_id') as string;
    // const records = JSON.parse(formData.get('records') as string);

    // if (!sessionId || !records || records.length === 0) {
    //     return { error: 'Missing session ID or attendance data.' };
    // }

    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //     return { error: 'You must be logged in to save attendance.' };
    // }

    // const { data: facultyProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    // if (!facultyProfile) {
    //     return { error: 'Could not find your faculty profile.' };
    // }

    // const upsertData = records.map((record: { student_id: number; status_id: number; notes: string }) => ({
    //     session_id: Number(sessionId),
    //     student_id: record.student_id,
    //     status_id: record.status_id,
    //     marked_by_user_id: facultyProfile.id,
    //     notes: record.notes,
    //     marked_at: new Date().toISOString(),
    // }));

    // const { error } = await supabase.from('attendance_records').upsert(upsertData, {
    //     onConflict: 'session_id, student_id', // This ensures that we update existing records for a student in a session
    // });

    // if (error) {
    //     console.error('Error saving attendance:', error);
    //     return { error: `Failed to save attendance: ${error.message}` };
    // }
    
    // revalidatePath(`/education/attendance/${sessionId}`);

    // Return a mock success message
    return { success: true, message: 'Attendance saved successfully.' };
}
