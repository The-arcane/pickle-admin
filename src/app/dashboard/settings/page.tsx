import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Edit } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Control how and where you receive updates and recommendations.
        </p>
      </div>

      <Separator />

      <div className="space-y-8 max-w-2xl">
        <div className="space-y-2">
            <Label className="text-base font-medium">Theme</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred color scheme for the dashboard.
            </p>
            <Select defaultValue="system">
                <SelectTrigger id="theme-select" className="w-[240px]">
                <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System theme</SelectItem>
                </SelectContent>
            </Select>
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

        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label className="text-base font-medium">
                Receive New Recommendations
                </Label>
                <p className="text-sm text-muted-foreground">
                Discover tailored company suggestions just for you.
                </p>
            </div>
            <Switch id="recommendations-switch" />
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
