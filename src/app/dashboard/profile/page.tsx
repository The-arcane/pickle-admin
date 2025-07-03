import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and activity.</p>
      </div>
      <Separator />

      <div className="flex items-center gap-6">
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
      
      <form className="space-y-4 max-w-lg">
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
      
      <Separator />
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
        <ul className="text-sm text-muted-foreground space-y-2 max-w-lg">
          <li className="flex justify-between">
            <span>Bookings made:</span>
            <span className="font-medium text-foreground">24</span>
          </li>
          <li className="flex justify-between">
            <span>Events attended:</span>
            <span className="font-medium text-foreground">5</span>
          </li>
          <li className="flex justify-between">
            <span>Feedback given:</span>
            <span className="font-medium text-foreground">3</span>
          </li>
        </ul>
      </div>
    </div>
  );
}