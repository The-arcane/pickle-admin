
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, Trash2, School, FileUp, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { removeSchool, importSchoolsFromCSV } from './actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OrganizationFormDialog } from '@/app/super-admin/organisations/client';
import { StatusBadge } from '@/components/status-badge';
import type { User } from '@/types';

type School = {
    id: number;
    name: string | null;
    address: string | null;
    logo: string | null;
    is_active: boolean;
    user: {
        name: string | null;
        email: string | null;
    } | null;
};

function CsvSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Importing...' : 'Import CSV'}
        </Button>
    )
}

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


export function SchoolsClientPage({ schools, users }: { schools: School[], users: User[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();
    const csvFormRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const onActionFinish = () => {
        router.refresh();
        setIsAddDialogOpen(false);
    };

    const openDeleteDialog = (school: School) => {
        setDeletingSchool(school);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingSchool) return;

        const formData = new FormData();
        formData.append('org_id', deletingSchool.id.toString());
        
        const result = await removeSchool(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
        }
        setIsDeleteDialogOpen(false);
        router.refresh();
    }
    
    const handleCsvImportAction = async (formData: FormData) => {
        const result = await importSchoolsFromCSV(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsImportDialogOpen(false);
            csvFormRef.current?.reset();
            setSelectedFile(null);
            router.refresh();
        }
    }

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," + "name,address\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "schools_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <School className="h-8 w-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Schools</h1>
                        <p className="text-muted-foreground">Manage school-type organizations.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="h-8 text-xs">
                        <FileUp className="mr-2 h-4 w-4" /> Import via CSV
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="h-8 text-xs">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add School
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>School</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schools.length > 0 ? (
                                schools.map((school) => (
                                    <TableRow key={school.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={school.logo ?? undefined} alt={school.name ?? ''} />
                                                    <AvatarFallback>{getInitials(school.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{school.name}</p>
                                                    <p className="text-sm text-muted-foreground">{school.address}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{school.user?.name ?? 'Unassigned'}</p>
                                                <p className="text-sm text-muted-foreground">{school.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={school.is_active ? 'Active' : 'Inactive'} /></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(school)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No schools found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <OrganizationFormDialog 
                isOpen={isAddDialogOpen} 
                setIsOpen={setIsAddDialogOpen}
                org={null}
                users={users}
                onFinished={onActionFinish}
                orgType={2} // Education org type
                dialogTitle="Add New School"
                dialogDescription="Create a new school organization and assign an owner."
            />
            
             <Dialog open={isImportDialogOpen} onOpenChange={(isOpen) => {
                setIsImportDialogOpen(isOpen);
                if (!isOpen) {
                    setSelectedFile(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Schools via CSV</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file with 'name' and 'address' columns to bulk create schools. All will be assigned to a default admin.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={csvFormRef} action={handleCsvImportAction} className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="csv_file" className="sr-only">CSV File</Label>
                             <Input
                                id="csv_file"
                                name="csv_file"
                                type="file"
                                accept=".csv"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                required
                                className="hidden"
                            />
                            <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('csv_file')?.click()}>
                                <FileUp className="mr-2 h-4 w-4" />
                                {selectedFile ? selectedFile.name : "Select a CSV file"}
                            </Button>
                             <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 justify-start"
                                onClick={handleDownloadTemplate}
                            >
                                <Download className="mr-2 h-3 w-3" />
                                Download CSV Template
                            </Button>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <CsvSubmitButton />
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the school organization. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
