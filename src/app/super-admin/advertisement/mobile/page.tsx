
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, PlusCircle } from "lucide-react";

export default function MobileAdsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-cyan-500" />
                <div>
                    <h1 className="text-3xl font-bold">Mobile App Advertisements</h1>
                    <p className="text-muted-foreground">Manage and create ads for the mobile application.</p>
                </div>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Mobile Ad
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Active Mobile Ads</CardTitle>
                <CardDescription>A list of all current advertisements running on the mobile app.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-10">
                    <p>No mobile advertisements have been created yet.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
