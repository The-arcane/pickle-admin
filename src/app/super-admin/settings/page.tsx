import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ThemeSelect } from '@/components/ui/theme-select';
import { LogoutButton } from '@/components/ui/logout-button';

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>

      <Separator />

      <div className="space-y-8 max-w-2xl">
        <div className="space-y-2">
            <Label className="text-base font-medium">Theme</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred color scheme for the dashboard.
            </p>
            <ThemeSelect />
        </div>
      </div>

      <Separator />

      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="text-muted-foreground text-sm">Manage your account session.</p>
        </div>
        
        <div className="space-y-2">
            <Label className="text-base font-medium">Log Out</Label>
            <p className="text-sm text-muted-foreground">
              Sign out from your current session.
            </p>
            <LogoutButton />
        </div>
      </div>
    </div>
  );
}
