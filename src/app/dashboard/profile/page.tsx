import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Manage your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
              <AvatarImage src="https://randomuser.me/api/portraits/men/10.jpg" alt="User" />
              <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xl font-bold">Amit Kumar</div>
            <div className="text-muted-foreground">amit.kumar@email.com</div>
            <div className="text-sm text-muted-foreground">Member since Jan 2024</div>
          </div>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" defaultValue="Amit Kumar" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="amit.kumar@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" defaultValue="+91 9876543210" />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Activity Summary</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Bookings made: <span className="font-medium text-foreground">24</span></li>
            <li>Events attended: <span className="font-medium text-foreground">5</span></li>
            <li>Feedback given: <span className="font-medium text-foreground">3</span></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
