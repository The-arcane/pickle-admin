
'use client';

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, PlusCircle, FileUp, MoreHorizontal, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useOrganization } from "@/hooks/use-organization";
import { StatusBadge } from "@/components/status-badge";

const mockWebAds = [
    {
        id: 'W-AD-001',
        name: 'Sidebar Promo Q3',
        placement: 'Dashboard Sidebar',
        status: 'Active',
        impressions: 45100,
        clicks: 890,
        ctr: '1.97%',
        image: 'https://placehold.co/300x250/E2E8F0/4A5568.png?text=Book+a+Demo'
    },
    {
        id: 'W-AD-002',
        name: 'Login Banner - New Features',
        placement: 'Login Page Banner',
        status: 'Active',
        impressions: 120500,
        clicks: 2500,
        ctr: '2.07%',
        image: 'https://placehold.co/800x100/E2E8F0/4A5568.png?text=What\'s+New?'
    }
];


export default function WebAdsPage() {
  const { selectedOrgId } = useOrganization();

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <PageHeader
                title="Web App Advertisements"
                description="Manage ads displayed within the web application."
            />
            <Dialog>
                <DialogTrigger asChild>
                    <Button disabled={!selectedOrgId}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Web Ad
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Web Ad</DialogTitle>
                        <DialogDescription>
                            Follow the steps to define your new advertisement for the web dashboard.
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
                                    <Input id="ad-name" placeholder="e.g., Sidebar Promo Q3" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="placement">Placement</Label>
                                    <Select>
                                        <SelectTrigger id="placement">
                                            <SelectValue placeholder="Select a page location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dashboard_sidebar">Dashboard Sidebar</SelectItem>
                                            <SelectItem value="login_banner">Login Page Banner</SelectItem>
                                            <SelectItem value="footer_global">Global Footer</SelectItem>
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
                                    <p className="text-xs text-muted-foreground">Recommended size: 300x250px for sidebar.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link-url">Link URL</Label>
                                    <Input id="link-url" placeholder="https://example.com/learn-more" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="audience" className="py-4">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="target-role">Target User Role</Label>
                                    <Select>
                                        <SelectTrigger id="target-role">
                                            <SelectValue placeholder="Select user role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="admin">Living Space Admins</SelectItem>
                                            <SelectItem value="user">End Users</SelectItem>
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
                <CardTitle>Active Web Ads</CardTitle>
                <CardDescription>A list of all current advertisements running on the web app for the selected Living Space.</CardDescription>
            </CardHeader>
            <CardContent>
                {!selectedOrgId ? (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Please select a Living Space to view its ads.</p>
                    </div>
                ) : mockWebAds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {mockWebAds.map(ad => (
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
                        <p>No web advertisements have been created for this Living Space yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
