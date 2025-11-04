
'use client';

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, PlusCircle, FileUp, MoreHorizontal, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useOrganization } from "@/hooks/use-organization";
import { StatusBadge } from "@/components/status-badge";

const mockMobileAds = [
    {
        id: 'M-AD-001',
        name: 'Summer Splash Banner',
        placement: 'Home Screen Banner',
        status: 'Active',
        impressions: 15200,
        clicks: 340,
        ctr: '2.24%',
        image: 'https://placehold.co/800x200/E2E8F0/4A5568.png?text=Summer+Sale'
    },
    {
        id: 'M-AD-002',
        name: 'New Court Pop-up',
        placement: 'Booking Confirmation Pop-up',
        status: 'Active',
        impressions: 8900,
        clicks: 512,
        ctr: '5.75%',
        image: 'https://placehold.co/400x400/E2E8F0/4A5568.png?text=New+Court+Open!'
    },
    {
        id: 'M-AD-003',
        name: 'Profile Footer Ad',
        placement: 'Profile Page Footer',
        status: 'Offline',
        impressions: 22500,
        clicks: 150,
        ctr: '0.67%',
        image: 'https://placehold.co/800x100/E2E8F0/4A5568.png?text=Get+Premium'
    }
];

export default function MobileAdsPage() {
  const { selectedOrgId } = useOrganization();

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <PageHeader
                title="Mobile App Advertisements"
                description="Manage ads displayed within the mobile app."
            />
            <Dialog>
                <DialogTrigger asChild>
                    <Button disabled={!selectedOrgId}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Mobile Ad
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Mobile Ad</DialogTitle>
                        <DialogDescription>
                            Follow the steps to define your new advertisement.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="placement" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="placement">Placement</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="audience">Audience</TabsTrigger>
                        </TabsList>
                        <TabsContent value="placement" className="py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ad-name">Ad Name</Label>
                                    <Input id="ad-name" placeholder="e.g., Summer Sale Banner" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="placement">Placement</Label>
                                    <Select>
                                        <SelectTrigger id="placement">
                                            <SelectValue placeholder="Select a screen location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="home_banner">Home Screen Banner</SelectItem>
                                            <SelectItem value="booking_interstitial">Booking Confirmation Pop-up</SelectItem>
                                            <SelectItem value="profile_footer">Profile Page Footer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="content" className="py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ad-image">Ad Creative (Image)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="ad-image" type="file" className="flex-1" />
                                        <Button variant="outline" size="icon"><FileUp className="h-4 w-4" /></Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Recommended size: 800x200px for banners.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link-url">Link URL</Label>
                                    <Input id="link-url" placeholder="https://example.com/special-offer" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="audience" className="py-4">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="target-users">Target Users</Label>
                                    <Select>
                                        <SelectTrigger id="target-users">
                                            <SelectValue placeholder="Select user segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="new">New Users (Last 30 days)</SelectItem>
                                            <SelectItem value="active">Active Bookers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Ad</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Active Mobile Ads</CardTitle>
                <CardDescription>A list of all current advertisements running on the mobile app for the selected Living Space.</CardDescription>
            </CardHeader>
            <CardContent>
                 {!selectedOrgId ? (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Please select a Living Space to view its ads.</p>
                    </div>
                 ) : mockMobileAds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {mockMobileAds.map(ad => (
                            <Card key={ad.id} className="flex flex-col md:flex-row gap-4 p-4">
                                <Image src={ad.image} alt={ad.name} width={200} height={100} className="rounded-md object-cover md:w-48" data-ai-hint="advertisement banner" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{ad.name}</CardTitle>
                                        <StatusBadge status={ad.status} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">{ad.placement}</p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2">
                                        <span><strong>Impressions:</strong> {ad.impressions.toLocaleString()}</span>
                                        <span><strong>Clicks:</strong> {ad.clicks.toLocaleString()}</span>
                                        <span><strong>CTR:</strong> {ad.ctr}</span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Edit Ad</DropdownMenuItem>
                                            <DropdownMenuItem>
                                                {ad.status === 'Active' ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                                Set {ad.status === 'Active' ? 'Offline' : 'Online'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete Ad</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </Card>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No mobile advertisements have been created for this Living Space yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
