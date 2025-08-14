
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { MarkAttendanceClientPage } from './client';

export default async function MarkAttendancePage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id: sessionId } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  const [sessionRes, studentsRes, statusesRes, recordsRes] = await Promise.all([
    supabase
        .from('attendance_sessions')
        .select('id, name')
        .eq('id', sessionId)
        .single(),
    supabase
        .from('student_enrollments')
        .select('student:student_id(id, name, profile_image_url)')
        .eq('session_id', sessionId),
    supabase
        .from('attendance_status')
        .select('id, name'),
    supabase
        .from('attendance_records')
        .select('student_id, status_id, notes')
        .eq('session_id', sessionId),
  ]);
  
  if (sessionRes.error || !sessionRes.data) {
    console.error('Error fetching session:', sessionRes.error);
    notFound();
  }
  if (studentsRes.error) console.error('Error fetching students:', studentsRes.error);
  if (statusesRes.error) console.error('Error fetching statuses:', statusesRes.error);
  if (recordsRes.error) console.error('Error fetching records:', recordsRes.error);
  
  const students = studentsRes.data?.map(e => e.student).filter(Boolean) || [];
  const statuses = statusesRes.data || [];
  const records = recordsRes.data || [];

  return (
    <MarkAttendanceClientPage 
        session={sessionRes.data}
        students={students}
        statuses={statuses}
        initialRecords={records}
    />
  );
}
