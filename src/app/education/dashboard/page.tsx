
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EducationDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Education Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Education Management Panel.</p>
      </div>
    </div>
  );
}
