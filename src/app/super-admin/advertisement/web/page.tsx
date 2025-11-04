
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, PlusCircle, FileUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useOrganization } from "@/hooks/use-organization";

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
                 <div className="text-center text-muted-foreground py-10">
                    <p>{selectedOrgId ? 'No web advertisements have been created for this Living Space yet.' : 'Please select a Living Space to view its ads.'}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
