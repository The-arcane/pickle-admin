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

      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Theme Setting
        </h2>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Stay informed on changes and updates for your saved companies.
            </p>
          </div>
          <Select defaultValue="system">
            <SelectTrigger id="theme-select" className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System theme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium">Customize UI</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Personalize the look and feel of your chatbot interface—update
              logo, brand colors, button styles, and font to match your
              business identity.
            </p>
          </div>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium">
              Receive New Recommendations
            </h3>
            <p className="text-sm text-muted-foreground">
              Discover tailored company suggestions just for you.
            </p>
          </div>
          <Switch id="recommendations-switch" />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Account Settings
        </h2>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium">Update Password</h3>
            <p className="text-sm text-muted-foreground">
              Secure your account by updating your password.
            </p>
          </div>
          <Button variant="outline">Update</Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium">Sign in with Google</h3>
            <p className="text-sm text-muted-foreground">
              Use esther@gmail.com Google&apos;s credentials to login in Enosis
            </p>
          </div>
          <Button variant="outline">Unlink Account</Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium text-destructive">
              Delete Account
            </h3>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all data. This action cannot
              be undone.
            </p>
          </div>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}