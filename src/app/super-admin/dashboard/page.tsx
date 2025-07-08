import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome! You have the highest level of administrative access.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>High-level statistics and system health at a glance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-12 text-center bg-muted rounded-lg">
            <div className="space-y-2">
              <Shield className="h-12 w-12 mx-auto text-primary" />
              <p className="text-muted-foreground">System is operating normally.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
