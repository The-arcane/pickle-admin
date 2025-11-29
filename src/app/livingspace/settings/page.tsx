

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit, Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ThemeSelect } from '@/components/theme-select';
import { LogoutButton } from '@/components/logout-button';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-gray-500" />
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                    Control how and where you receive updates and recommendations.
                    </p>
                </div>
            </div>
             <Button variant="ghost" asChild>
                <Link href="/livingspace">← Go Back</Link>
            </Button>
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

        <div className="space-y-2">
            <Label className="text-base font-medium">Customize UI</Label>
            <p className="text-sm text-muted-foreground">
              Personalize the look and feel of your chatbot interface—update
              logo, brand colors, button styles, and font.
            </p>
            <Button variant="outline" className="w-fit">
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <p className="text-muted-foreground text-sm">Manage your account and security settings.</p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-base font-medium">Update Password</Label>
          <p className="text-sm text-muted-foreground">
            Secure your account by updating your password.
          </p>
          <Button variant="outline" className="w-fit">Update</Button>
        </div>

        <div className="space-y-2">
            <Label className="text-base font-medium">Sign in with Google</Label>
            <p className="text-sm text-muted-foreground">
              Use esther@gmail.com Google&apos;s credentials to login in Enosis
            </p>
            <Button variant="outline" className="w-fit">Unlink Account</Button>
        </div>

        <div className="space-y-2">
            <Label className="text-base font-medium">Log Out</Label>
            <p className="text-sm text-muted-foreground">
              Sign out from your current session.
            </p>
            <LogoutButton />
        </div>
        
        <div className="space-y-2">
            <Label className="text-base font-medium text-destructive">
              Delete Account
            </Label>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all data. This action cannot
              be undone.
            </p>
            <Button variant="destructive" className="w-fit">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}
