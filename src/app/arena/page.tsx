
import { redirect } from 'next/navigation';

// Arena root should redirect to the dashboard
export default function ArenaRootPage() {
    redirect('/arena/dashboard');
}
