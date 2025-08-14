
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Box, AlertTriangle, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Data
const mockInventory = [
    { id: 'item_001', item: 'Size 5 Pickleball Paddle', quantity: 20, condition: 'Good', assignedTo: 'Team A' },
    { id: 'item_002', item: 'Outdoor Pickleballs (12-pack)', quantity: 4, condition: 'Good', assignedTo: null },
    { id: 'item_003', item: 'Portable Pickleball Net', quantity: 5, condition: 'Fair', assignedTo: 'Event Bin' },
    { id: 'item_004', item: 'First-Aid Kit', quantity: 2, condition: 'New', assignedTo: 'Coaches Office' },
];

const mockConditions = ['Good', 'Fair', 'Damaged', 'New', 'Needs Repair'];

export default function InventoryPage() {
    const [inventory, setInventory] = useState(mockInventory);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const { toast } = useToast();

    const lowStockItems = inventory.filter(item => item.quantity < 5);

    const handleMarkAs = (itemId: string, newCondition: 'Damaged' | 'Good') => {
        setInventory(prev => prev.map(item => item.id === itemId ? { ...item, condition: newCondition } : item));
        toast({ title: 'Inventory Updated', description: `Item marked as ${newCondition}.` });
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newItem = {
            id: editingItem ? editingItem.id : `item_${Date.now()}`,
            item: formData.get('item') as string,
            quantity: parseInt(formData.get('quantity') as string, 10),
            condition: formData.get('condition') as string,
            assignedTo: null,
        };

        if (editingItem) {
            setInventory(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
            toast({ title: 'Item Updated', description: `${newItem.item} has been updated.` });
        } else {
            setInventory(prev => [...prev, newItem]);
            toast({ title: 'Item Added', description: `${newItem.item} has been added to inventory.` });
        }
        
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const openEditForm = (item: any) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }
    
    const openAddForm = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    }

    const handleDelete = (itemId: string) => {
        setInventory(prev => prev.filter(item => item.id !== itemId));
        toast({ title: 'Item Removed', description: 'The item has been removed from inventory.', variant: 'destructive'});
    }
    
    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'Good':
            case 'New':
                return 'bg-green-500/20 text-green-700 border-green-500/20';
            case 'Fair':
                return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
            case 'Damaged':
            case 'Needs Repair':
                 return 'bg-red-500/20 text-red-700 border-red-500/20';
            default: return 'secondary';
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Box className="h-8 w-8 text-indigo-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Equipment & Inventory</h1>
                        <p className="text-muted-foreground">Track and manage all school equipment.</p>
                    </div>
                </div>
                <Button onClick={openAddForm}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Equipment
                </Button>
            </div>

            {lowStockItems.length > 0 && (
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <div>
                            <CardTitle>Low Stock Alert</CardTitle>
                            <CardDescription className="text-yellow-700/80">The following items are running low and may need to be restocked soon.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 text-sm font-medium">
                            {lowStockItems.map(item => <li key={item.id}>{item.item} (Quantity: {item.quantity})</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Inventory List</CardTitle>
                    <CardDescription>All available equipment and their current status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.item}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell><Badge variant="outline" className={getConditionColor(item.condition)}>{item.condition}</Badge></TableCell>
                                    <TableCell>{item.assignedTo || 'Unassigned'}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditForm(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="item">Item Name</Label>
                                <Input id="item" name="item" defaultValue={editingItem?.item || ''} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input id="quantity" name="quantity" type="number" defaultValue={editingItem?.quantity || '1'} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select name="condition" defaultValue={editingItem?.condition || 'Good'}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {mockConditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
