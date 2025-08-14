
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { MarkAttendanceClientPage } from './client';

export default async function MarkAttendancePage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  // MOCK DATA for the page
  const session = { id: parseInt(params.id), name: 'Morning Pickleball Drills' };
  
  const students = [
      { id: 101, name: 'Alice Johnson', profile_image_url: null },
      { id: 102, name: 'Bob Williams', profile_image_url: null },
      { id: 103, name: 'Charlie Brown', profile_image_url: null },
      { id: 104, name: 'Diana Prince', profile_image_url: 'https://placehold.co/40x40.png' },
      { id: 105, name: 'Ethan Hunt', profile_image_url: null },
  ];

  const statuses = [
      { id: 1, name: 'Present' },
      { id: 2, name: 'Absent' },
      { id: 3, name: 'Late' },
      { id: 4, name: 'Excused' },
  ];
  
  // No initial records for a fresh attendance sheet
  const records: any[] = [];

  return (
    <MarkAttendanceClientPage 
        session={session}
        students={students}
        statuses={statuses}
        initialRecords={records}
    />
  );
}
