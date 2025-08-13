
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, Edit, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addOrganization, updateOrganization } from './actions';
import type { Organization, User } from '@/types';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/status-badge';


export function SalesOrganisationsClientPage({ initialOrganizations, users }: { initialOrganizations: Organization[], users: User[] }) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const router = useRouter();

  useEffect(() => {
    setOrganizations(initialOrganizations);
  }, [initialOrganizations]);

  const onActionFinish = () => {
    router.refresh();
    setIsFormDialogOpen(false);
  };
  
  const openAddDialog = () => {
    setEditingOrg(null);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    setIsFormDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">Manage inactive organizations. Active organizations are hidden.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={openAddDialog}><PlusCircle className="h-4 w-4" /> Add Organization</Button>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={org.logo || undefined} alt={org.name} data-ai-hint="logo" />
                    <AvatarFallback>{org.name?.charAt(0)?.toUpperCase() ?? 'O'}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>{org.address}</TableCell>
                 <TableCell>
                    <StatusBadge status={org.is_active ? 'Active' : 'Inactive'} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => openEditDialog(org)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/sales/organisations/${org.id}/website`}>
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Edit Public Page</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {organizations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No inactive organizations found.</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </Card>
      <OrganizationFormDialog 
        isOpen={isFormDialogOpen} 
        setIsOpen={setIsFormDialogOpen}
        org={editingOrg}
        users={users}
        onFinished={onActionFinish}
      />
    </>
  );
}


function OrganizationFormDialog({ isOpen, setIsOpen, org, users, onFinished }: { isOpen: boolean, setIsOpen: (open: boolean) => void, org: Organization | null, users: User[], onFinished: () => void }) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(org?.logo || null);

    useEffect(() => {
        if (isOpen) {
            setLogoPreview(org?.logo || null);
        }
    }, [isOpen, org]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'The logo image cannot exceed 2MB.',
                });
                e.target.value = ''; // Reset the input
                return;
            }
            setLogoPreview(URL.createObjectURL(file));
        }
    };
    
    async function handleFormAction(formData: FormData) {
        const action = org ? updateOrganization : addOrganization;
        const result = await action(formData);

        if (result?.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: `Organization ${org ? 'updated' : 'created'} successfully.` });
            onFinished();
        }
    }
  
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{org ? 'Edit Organization' : 'Add New Organization'}</DialogTitle>
                    <DialogDescription>{org ? 'Update details for this organization.' : 'Fill in the details for the new organization.'}</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={handleFormAction} className="grid gap-4 py-4">
                    {org && <input type="hidden" name="id" value={org.id} />}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={org?.name || ''} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" defaultValue={org?.address || ''} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user_id">Owner</Label>
                        <Select name="user_id" defaultValue={org?.user_id?.toString()} required>
                          <SelectTrigger id="user_id"><SelectValue placeholder="Select an owner" /></SelectTrigger>
                          <SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo (Max 2MB)</Label>
                        <Input id="logo" name="logo" type="file" accept="image/*" onChange={handleFileChange} />
                        {logoPreview && <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="mt-2 rounded-md object-cover" data-ai-hint="logo" />}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Organization</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
