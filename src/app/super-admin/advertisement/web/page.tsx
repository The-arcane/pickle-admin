
'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe, PlusCircle, MoreHorizontal, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useOrganization } from "@/hooks/use-organization";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AdFormDialog } from "../form";
import { deleteAdvertisement, toggleAdStatus } from "../actions";

export default function WebAdsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const { toast } = useToast();

  const [ads, setAds] = useState<any[]>([]);
  const [adTypes, setAdTypes] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  const webAdType = adTypes.find(t => t.type_name === 'web');
  const webPlacements = placements.filter(p => p.type_id === webAdType?.id);

  const fetchData = useCallback(async () => {
    if (!selectedOrgId || !webAdType) {
        setAds([]);
        setLoading(false);
        return;
    }

    const { data, error } = await supabase
        .from('advertisements')
        .select('*, placement:advertisement_placements(name), status:advertisement_status(status_name)')
        .eq('type_id', webAdType.id)
        .or(`organisation_id.eq.${selectedOrgId},is_global.eq.true`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching web ads:", error);
    } else {
        setAds(data || []);
    }
    setLoading(false);
  }, [selectedOrgId, supabase, webAdType]);

  useEffect(() => {
    async function fetchMetadata() {
        const [typesRes, statusRes, placementRes, audienceRes] = await Promise.all([
            supabase.from('advertisement_types').select('*'),
            supabase.from('advertisement_status').select('*'),
            supabase.from('advertisement_placements').select('*'),
            supabase.from('advertisement_audiences').select('*'),
        ]);
        if (typesRes.error) console.error(typesRes.error.message);
        else setAdTypes(typesRes.data);
        
        if (statusRes.error) console.error(statusRes.error.message);
        else setStatuses(statusRes.data);

        if (placementRes.error) console.error(placementRes.error.message);
        else setPlacements(placementRes.data);

        if (audienceRes.error) console.error(audienceRes.error.message);
        else setAudiences(audienceRes.data);
    }
    fetchMetadata();
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onActionFinish = () => {
    fetchData();
    setIsFormOpen(false);
    setIsDeleteOpen(false);
    setSelectedAd(null);
  }

  const openFormDialog = (ad: any | null) => {
    setSelectedAd(ad);
    setIsFormOpen(true);
  }

  const openDeleteDialog = (ad: any) => {
    setSelectedAd(ad);
    setIsDeleteOpen(true);
  }

  const handleDelete = async () => {
    if (!selectedAd) return;
    const formData = new FormData();
    formData.append('id', selectedAd.id);
    const result = await deleteAdvertisement(formData);
    if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
    else toast({ title: 'Success', description: result.message });
    onActionFinish();
  }
  
  const handleToggleStatus = async (ad: any) => {
    const result = await toggleAdStatus(ad.id, ad.status_id);
    if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
    else toast({ title: 'Success', description: result.message });
    onActionFinish();
  }


  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <PageHeader
                title="Web App Advertisements"
                description="Manage ads displayed within the web application."
            />
            <Button disabled={!selectedOrgId || loading} onClick={() => openFormDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Web Ad
            </Button>
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
                ) : loading ? (
                     <div className="grid grid-cols-1 gap-6">
                       <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                ) : ads.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {ads.map(ad => (
                            <Card key={ad.id} className="flex flex-col md:flex-row gap-4 p-4">
                                <Image src={ad.image_url} alt={ad.name} width={200} height={100} className="rounded-md object-cover md:w-48" data-ai-hint="advertisement banner" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{ad.name}</CardTitle>
                                        <StatusBadge status={ad.status.status_name} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">{ad.placement.name}</p>
                                    {ad.is_global && (
                                        <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                                            <Globe className="h-3 w-3" />
                                            <span>Global Ad (Added by Super-admin)</span>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2">
                                        <span><strong>Impressions:</strong> {ad.impressions.toLocaleString()}</span>
                                        <span><strong>Clicks:</strong> {ad.clicks.toLocaleString()}</span>
                                        <span><strong>CTR:</strong> {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'}%</span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openFormDialog(ad)}><Edit className="mr-2 h-4 w-4"/>Edit Ad</DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => handleToggleStatus(ad)}>
                                                {ad.status_id === 1 ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                                Set {ad.status_id === 1 ? 'Offline' : 'Online'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(ad)}><Trash2 className="mr-2 h-4 w-4"/>Delete Ad</DropdownMenuItem>
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
        
        {isFormOpen && webAdType && (
             <AdFormDialog
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                ad={selectedAd}
                adTypeId={webAdType.id}
                orgId={selectedOrgId}
                placements={webPlacements}
                statuses={statuses}
                audiences={audiences}
                onFinished={onActionFinish}
             />
        )}
       
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete the ad "{selectedAd?.name}". This action cannot be undone.</AlertDialogDescription>
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
