import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account and theme settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Theme</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">Theme</Label>
            <Select defaultValue="system">
              <SelectTrigger id="theme-select" className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Customize UI</Label>
            <Button variant="outline">Edit</Button>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="recommendations-switch">Receive New Recommendations</Label>
            <Switch id="recommendations-switch" />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account</h3>
          <div className="flex items-center justify-between">
            <Label>Update Password</Label>
            <Button variant="outline">Update</Button>
          </div>
          <div className="flex items-center justify-between">
            <Label>Sign in with Google</Label>
            <Button variant="outline">Unlink Account</Button>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-destructive">Delete Account</Label>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
