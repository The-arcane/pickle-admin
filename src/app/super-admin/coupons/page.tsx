
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Percent, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { saveCoupon, deleteCoupon } from './actions';
import { useFormStatus } from 'react-dom';
import { StatusBadge } from '@/components/status-badge';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Coupon')}
        </Button>
    );
}

export default function CouponsPage() {
    const supabase = createClient();
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching coupons:", error);
        else setCoupons(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [supabase]);
    
    const onActionFinish = () => {
        fetchData();
        setIsFormOpen(false);
        setIsDeleteOpen(false);
        setSelectedCoupon(null);
    }

    const openFormDialog = (coupon: any | null) => {
        setSelectedCoupon(coupon);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (coupon: any) => {
        setSelectedCoupon(coupon);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCoupon) return;
        const formData = new FormData();
        formData.append('id', selectedCoupon.id);
        const result = await deleteCoupon(formData);
        if (result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
        else toast({ title: 'Success', description: result.message });
        onActionFinish();
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Percent className="h-8 w-8 text-yellow-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Coupons</h1>
                        <p className="text-muted-foreground">Create and manage discount coupons.</p>
                    </div>
                </div>
                <Button onClick={() => openFormDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Expires On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-mono">{c.code}</TableCell>
                                    <TableCell>{c.description}</TableCell>
                                    <TableCell>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</TableCell>
                                    <TableCell><StatusBadge status={c.is_active ? 'Active' : 'Inactive'} /></TableCell>
                                    <TableCell>{c.valid_until ? format(new Date(c.valid_until), 'PPP') : 'Never'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openFormDialog(c)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {coupons.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24">No coupons created yet.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CouponFormDialog isOpen={isFormOpen} setIsOpen={setIsFormOpen} coupon={selectedCoupon} onFinished={onActionFinish} />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the coupon "{selectedCoupon?.code}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function CouponFormDialog({ isOpen, setIsOpen, coupon, onFinished }: { isOpen: boolean, setIsOpen: (open: boolean) => void, coupon: any | null, onFinished: () => void }) {
    const { toast } = useToast();
    const isEditing = !!coupon;

    async function formAction(formData: FormData) {
        const result = await saveCoupon(formData);
        if (result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
        else {
            toast({ title: 'Success', description: result.message });
            onFinished();
        }
    }
    
    // States for controlled components
    const [discountType, setDiscountType] = useState(coupon?.discount_type || 'percentage');
    const [validFrom, setValidFrom] = useState<Date | undefined>(coupon?.valid_from ? new Date(coupon.valid_from) : new Date());
    const [validUntil, setValidUntil] = useState<Date | undefined>(coupon?.valid_until ? new Date(coupon.valid_until) : undefined);

    useEffect(() => {
        if(coupon) {
            setDiscountType(coupon.discount_type);
            setValidFrom(coupon.valid_from ? new Date(coupon.valid_from) : undefined);
            setValidUntil(coupon.valid_until ? new Date(coupon.valid_until) : undefined);
        } else {
            setDiscountType('percentage');
            setValidFrom(new Date());
            setValidUntil(undefined);
        }
    }, [coupon, isOpen]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                </DialogHeader>
                <form action={formAction}>
                    {isEditing && <input type="hidden" name="id" value={coupon.id} />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <Card className="md:col-span-1">
                            <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Coupon Code</Label>
                                    <Input id="code" name="code" defaultValue={coupon?.code} placeholder="e.g., SUMMER25" className="uppercase" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" defaultValue={coupon?.description} placeholder="e.g., 25% off all summer bookings" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="is_active" name="is_active" defaultChecked={coupon?.is_active ?? true} />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-1">
                            <CardHeader><CardTitle>Discount Logic</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discount_type">Type</Label>
                                        <Select name="discount_type" value={discountType} onValueChange={setDiscountType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discount_value">Value</Label>
                                        <Input id="discount_value" name="discount_value" type="number" step="0.01" defaultValue={coupon?.discount_value} required />
                                    </div>
                                </div>
                                {discountType === 'percentage' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="max_discount_amount">Max Discount (₹)</Label>
                                        <Input id="max_discount_amount" name="max_discount_amount" type="number" step="0.01" defaultValue={coupon?.max_discount_amount} placeholder="Optional limit for % discount" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardHeader><CardTitle>Conditions & Limits</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min_booking_value">Min Booking Value (₹)</Label>
                                    <Input id="min_booking_value" name="min_booking_value" type="number" step="0.01" defaultValue={coupon?.min_booking_value} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min_slots">Min Slots Booked</Label>
                                    <Input id="min_slots" name="min_slots" type="number" defaultValue={coupon?.min_slots} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_usage_count">Max Total Uses</Label>
                                    <Input id="max_usage_count" name="max_usage_count" type="number" defaultValue={coupon?.max_usage_count} />
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="md:col-span-2">
                            <CardHeader><CardTitle>Validity Period</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Valid From</Label>
                                    <Popover><PopoverTrigger asChild><Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !validFrom && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{validFrom ? format(validFrom, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={validFrom} onSelect={setValidFrom} /></PopoverContent></Popover>
                                    <input type="hidden" name="valid_from" value={validFrom ? validFrom.toISOString() : ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valid Until (Optional)</Label>
                                    <Popover><PopoverTrigger asChild><Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !validUntil && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{validUntil ? format(validUntil, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={validUntil} onSelect={setValidUntil} /></PopoverContent></Popover>
                                    <input type="hidden" name="valid_until" value={validUntil ? validUntil.toISOString() : ''} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <SubmitButton isEditing={isEditing} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
