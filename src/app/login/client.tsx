
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, employeeLogin } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [error, setError] = useState(searchParams.get('error'));
  const [isClient, setIsClient] = useState(false);

  const defaultTab = searchParams.get('type') === 'employee' ? 'employee' : 'admin';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  useEffect(() => {
    setIsClient(true);
    // Clear error when tab changes
    setError(null);
  }, [activeTab]);

  const handleFormAction = async (formData: FormData) => {
      const action = activeTab === 'admin' ? login : employeeLogin;
      const result = await action(formData);

      if (result?.success) {
          const destination = activeTab === 'admin' ? '/dashboard' : '/employee/dashboard';
          router.push(destination);
      } else {
          setError(result.error || 'An unknown error occurred.');
      }
  };

  if (!isClient) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs defaultValue={defaultTab} onValueChange={setActiveTab} className="w-full max-w-sm">
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
                    {error && activeTab === 'admin' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form action={handleFormAction} ref={formRef}>
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
                     {error && activeTab === 'employee' && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form action={handleFormAction} ref={formRef}>
                        <LoginFormFields isEmployee={true}/>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
