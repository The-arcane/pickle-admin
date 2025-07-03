import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>
      <Tabs defaultValue="system">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Manage general system settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="Lumen" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gmt-5">Eastern Time (ET)</SelectItem>
                        <SelectItem value="gmt-6">Central Time (CT)</SelectItem>
                        <SelectItem value="gmt-7">Mountain Time (MT)</SelectItem>
                        <SelectItem value="gmt-8">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="email-bookings" defaultChecked />
                    <Label htmlFor="email-bookings">Email notifications for new bookings</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="email-users" />
                    <Label htmlFor="email-users">Email notifications for new user sign-ups</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="email-updates" defaultChecked />
                    <Label htmlFor="email-updates">Receive product updates and newsletters</Label>
                </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">The theme is managed by your system preferences.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Custom Logo</Label>
                <Input id="logo" type="file" />
                 <p className="text-sm text-muted-foreground">Upload a custom logo to be displayed in the header.</p>
              </div>
            </CardContent>
             <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
