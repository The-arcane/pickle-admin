import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HospitalityDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=hospitality');
  }

  const { data: userProfile } = await supabase.from('user').select('name').eq('user_uuid', user.id).single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to the Hospitality Dashboard, {userProfile?.name ?? 'Admin'}!</h1>
        <p className="text-muted-foreground">This is your main control panel.</p>
      </div>
    </div>
  );
}
