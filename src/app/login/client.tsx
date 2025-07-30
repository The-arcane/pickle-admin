
'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Shield, UserSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login } from './actions';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

function SubmitButton({ userType }: { userType: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} suppressHydrationWarning>
      {pending ? 'Signing In...' : `Sign In as ${userType}`}
    </Button>
  );
}

function LoginFormFields({ userType }: { userType: string }) {
    const [showPassword, setShowPassword] = useState(false);
    const emailId = `${userType}-email`;
    const passwordId = `${userType}-password`;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={emailId}>Email</Label>
                <Input id={emailId} name="email" type="email" placeholder={`${userType}@example.com`} required suppressHydrationWarning />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={passwordId}>Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                        Forgot Password?
                    </a>
                </div>
                <div className="relative">
                    <Input
                        id={passwordId}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        suppressHydrationWarning
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        suppressHydrationWarning
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const typeParam = searchParams.get('type');
  
  // Determine the active tab. Default to 'employee'.
  // Ensure 'super-admin' is only accessible via its specific URL query.
  const activeTab = typeParam === 'super-admin' ? 'super-admin' : (typeParam === 'admin' ? 'admin' : 'employee');

  const handleTabChange = (value: string) => {
    // Only allow changing tabs between admin and employee.
    // Super-admin login should be accessed by its specific URL.
    if (value === 'super-admin') return;
    router.push(`/login?type=${value}`);
  };

  const isSuperAdminPath = typeParam === 'super-admin';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-sm">
        <TabsList className={cn("grid w-full", isSuperAdminPath ? "grid-cols-1" : "grid-cols-2")}>
          {isSuperAdminPath ? (
            <TabsTrigger value="super-admin">Super Admin</TabsTrigger>
          ) : (
            <>
              <TabsTrigger value="employee">Employee</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="employee">
             <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <UserSquare className="h-6 w-6" />
                        Employee Login
                    </CardTitle>
                    <CardDescription>Scan QR codes and manage today's bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                     {error && activeTab === 'employee' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
                        </Alert>
                    )}
                    <form action={login} className="space-y-6" suppressHydrationWarning>
                        <input type="hidden" name="userType" value="employee" />
                        <LoginFormFields userType="employee" />
                        <SubmitButton userType="Employee" />
                    </form>
                    <p className="mt-4 text-center text-xs text-muted-foreground">Version 9.0.0(R)</p>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="admin">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Shield className="h-6 w-6"/>
                        Admin Login
                    </CardTitle>
                    <CardDescription>Enter your admin credentials to access the main dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && activeTab === 'admin' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
                        </Alert>
                    )}
                    <form action={login} className="space-y-6" suppressHydrationWarning>
                        <input type="hidden" name="userType" value="admin" />
                        <LoginFormFields userType="admin" />
                        <SubmitButton userType="Admin" />
                    </form>
                    <p className="mt-4 text-center text-xs text-muted-foreground">Version 9.0.0(R)</p>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="super-admin">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Shield className="h-6 w-6"/>
                        Super Admin Login
                    </CardTitle>
                    <CardDescription>Enter your credentials for elevated access.</CardDescription>
                </CardHeader>
                <CardContent>
                     {error && activeTab === 'super-admin' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
                        </Alert>
                    )}
                    <form action={login} className="space-y-6" suppressHydrationWarning>
                        <input type="hidden" name="userType" value="super-admin" />
                        <LoginFormFields userType="super-admin" />
                        <SubmitButton userType="Super Admin" />
                    </form>
                    <p className="mt-4 text-center text-xs text-muted-foreground">Version 9.0.0(R)</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
