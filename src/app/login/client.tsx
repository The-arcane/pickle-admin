
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, employeeLogin } from './actions';

function SubmitButton({ isEmployee = false }: { isEmployee?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : (isEmployee ? 'Sign In as Employee' : 'Sign In as Admin')}
    </Button>
  );
}

function LoginFormFields({ isEmployee = false }: { isEmployee?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={isEmployee ? "employee-email" : "admin-email"}>Email</Label>
                <Input id={isEmployee ? "employee-email" : "admin-email"} name="email" type="email" placeholder={isEmployee ? "employee@example.com" : "admin@example.com"} required />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={isEmployee ? "employee-password" : "admin-password"}>Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                        Forgot Password?
                    </a>
                </div>
                <div className="relative">
                    <Input
                        id={isEmployee ? "employee-password" : "admin-password"}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <SubmitButton isEmployee={isEmployee} />
        </div>
    );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const defaultTab = searchParams.get('type') === 'employee' ? 'employee' : 'admin';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs defaultValue={defaultTab} className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="employee">Employee</TabsTrigger>
        </TabsList>
        <TabsContent value="admin">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>Enter your admin credentials to access the main dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && defaultTab === 'admin' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form action={login}>
                        <LoginFormFields />
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="employee">
             <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Employee Login</CardTitle>
                    <CardDescription>Scan QR codes and manage today's bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                     {error && defaultTab === 'employee' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form action={employeeLogin}>
                        <LoginFormFields isEmployee={true}/>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
