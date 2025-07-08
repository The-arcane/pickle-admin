'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useOrganization } from '@/hooks/use-organization';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrganizationsPage() {
  const { organizations, refreshOrganizations } = useOrganization();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const openAddDialog = () => {
    setEditingOrg(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Organizations"
          description="View and manage all organizations in the system."
        />
        <Button size="sm" className="gap-1" onClick={openAddDialog}>
          <PlusCircle className="h-4 w-4" />
          Add Organization
        </Button>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className={org.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/20'}>
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => openEditDialog(org)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <OrganizationDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen}
        org={editingOrg}
        onFinished={refreshOrganizations}
      />
    </>
  );
}


function OrganizationDialog({ isOpen, setIsOpen, org, onFinished }: { isOpen: boolean, setIsOpen: (open: boolean) => void, org: Organization | null, onFinished: () => void }) {
  const supabase = createClient();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setStatus(org.status);
    } else {
      setName('');
      setStatus('active');
    }
  }, [org]);

  const handleSubmit = async () => {
    setLoading(true);
    let error;

    if (org) {
      // Update
      const { error: updateError } = await supabase
        .from('organisations')
        .update({ name, status })
        .eq('id', org.id);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase
        .from('organisations')
        .insert([{ name, status }]);
      error = insertError;
    }
    
    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: `Organization ${org ? 'updated' : 'created'} successfully.` });
      onFinished();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{org ? 'Edit Organization' : 'Add New Organization'}</DialogTitle>
          <DialogDescription>
            {org ? 'Update the details for this organization.' : 'Fill in the details for the new organization.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Organization'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
