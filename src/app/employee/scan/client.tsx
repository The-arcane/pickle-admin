
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import QrScanner from 'qr-scanner';
import { verifyBookingByQrText } from './actions';
import { CheckCircle, XCircle, ScanLine } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ScanResultData = {
    type: string;
    user: string;
    item: string;
    date: string;
    time: string;
}

export function QrScannerClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; data?: ScanResultData; message: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (scanResult) { // Set timer for any result
      redirectTimerRef.current = setTimeout(() => {
        resetScanner(); // Reset scanner instead of redirecting
      }, 5000); 
    }
    // Cleanup the timer if the component unmounts
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [scanResult]);

  const handleDecode = useCallback(async (result: QrScanner.ScanResult) => {
    if (isProcessing) return;

    setIsProcessing(true);
    scannerRef.current?.stop();

    try {
        const serverResult = await verifyBookingByQrText(result.data);
        if (serverResult.error) {
            setScanResult({ success: false, message: serverResult.error });
            toast({ variant: "destructive", title: "Verification Failed", description: serverResult.error });
        } else if (serverResult.success && serverResult.data) {
            setScanResult({ success: true, data: serverResult.data as ScanResultData, message: serverResult.message || "Action Successful!" });
            toast({ title: "Success!", description: serverResult.message });
        }
    } catch (e) {
        const errorMessage = "An unexpected error occurred during verification.";
        setScanResult({ success: false, message: errorMessage });
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }

  }, [isProcessing, toast]);

    const resetScanner = useCallback(() => {
        if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
        }
        setScanResult(null);
        setIsProcessing(false);
        if (hasCameraPermission) {
           scannerRef.current?.start();
        }
    }, [hasCameraPermission]);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
        videoRef.current,
        handleDecode,
        {
            highlightScanRegion: true,
            highlightCodeOutline: true,
        }
    );
    scannerRef.current = qrScanner;

    const startScanner = async () => {
        try {
            await qrScanner.start();
            setHasCameraPermission(true);
        } catch (error) {
            console.error('Error starting camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this app.',
            });
        }
    };
    
    startScanner();

    return () => {
        qrScanner.destroy();
    };
  }, [handleDecode, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QR Code Scanner</h1>
        <p className="text-muted-foreground">Point the camera at a booking QR code. It will scan automatically.</p>
      </div>
      
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {!scanResult && hasCameraPermission && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-4 border-primary/50 rounded-lg" />
                    </div>
                )}
                {hasCameraPermission === null && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
                        <p>Requesting camera permission...</p>
                    </div>
                )}
            </div>
             {isProcessing && !scanResult && (
                <div className="text-center text-muted-foreground">Processing...</div>
            )}
        </CardContent>
      </Card>
    
      {scanResult && (
          <Card className="max-w-xl mx-auto">
              <CardHeader className="text-center">
                  <CardTitle className={`flex items-center justify-center gap-2 ${scanResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {scanResult.success ? <CheckCircle /> : <XCircle />}
                      {scanResult.success ? "Success" : "Verification Failed"}
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                  {scanResult.success && scanResult.data ? (
                    <div className="text-left space-y-2">
                        <p className="font-semibold text-center pb-2">{scanResult.message}</p>
                        <p><strong>Type:</strong> {scanResult.data.type}</p>
                        <p><strong>User:</strong> {scanResult.data.user}</p>
                        <p><strong>Item:</strong> {scanResult.data.item}</p>
                        <p><strong>Details:</strong> {scanResult.data.date}</p>
                        <p><strong>More Details:</strong> {scanResult.data.time}</p>
                        <p className="pt-2 text-center text-xs text-muted-foreground">This message will disappear and scanner will reset shortly.</p>
                        <Button onClick={resetScanner} className="w-full mt-4" variant="outline">
                           <ScanLine className="mr-2 h-4 w-4" />
                           Scan Another QR Code Now
                        </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-center">{scanResult.message}</p>
                       <Button onClick={resetScanner} className="w-full mt-4" variant="outline">
                        <ScanLine className="mr-2 h-4 w-4" />
                        Try Scanning Again
                      </Button>
                    </>
                  )}
              </CardContent>
          </Card>
      )}

      {hasCameraPermission === false && (
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            This feature needs camera permissions to function. Please enable camera access for this site in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
