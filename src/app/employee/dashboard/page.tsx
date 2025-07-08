
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Calendar, PartyPopper } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboardPage() {
  const features = [
    {
      title: 'Scan QR Code',
      description: 'Quickly scan a customer\'s QR code to verify and check in their booking.',
      icon: QrCode,
      href: '/employee/scan',
      cta: 'Start Scanning',
    },
    {
      title: 'View Bookings',
      description: 'See a list of all court and event bookings for today and the future.',
      icon: Calendar,
      href: '/employee/bookings',
      cta: 'View Bookings',
    },
    {
      title: 'View Events',
      description: 'Get details about all upcoming and past events scheduled at the facility.',
      icon: PartyPopper,
      href: '/employee/events',
      cta: 'View Events',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="text-muted-foreground">Welcome! Access your tools and view bookings here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <CardDescription className="flex-grow">{feature.description}</CardDescription>
              <Button asChild className="mt-4">
                <Link href={feature.href}>{feature.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
