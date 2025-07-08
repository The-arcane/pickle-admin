
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { verifyBookingByQr } from './actions';
import QrScanner from 'qr-scanner';
import { CheckCircle, XCircle } from 'lucide-react';

type ScanResultData = {
    user: string;
    court: string;
    date: string;
    time: string;
    status: string;
}

export function QrScannerClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; data?: ScanResultData; message: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleScan = useCallback(async (data: string) => {
    if (isProcessing) return; // Prevent multiple submissions
    
    setIsProcessing(true);
    scannerRef.current?.stop();

    try {
        const result = await verifyBookingByQr(data);
        if (result.error) {
            setScanResult({ success: false, message: result.error });
            toast({ variant: "destructive", title: "Verification Failed", description: result.error });
        } else if(result.success && result.data) {
            setScanResult({ success: true, data: result.data as ScanResultData, message: "Booking Verified!" });
            toast({ title: "Booking Verified!", description: `Booking for ${result.data.user} confirmed.` });
        }
    } catch (e) {
        const errorMessage = "An unexpected error occurred during verification.";
        setScanResult({ success: false, message: errorMessage });
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }, [isProcessing, toast]);


  useEffect(() => {
    const videoElem = videoRef.current;
    if (!videoElem) return;

    // This effect ensures the scanner is set up once and cleaned up properly.
    const qrScanner = new QrScanner(
      videoElem,
      (result) => {
        if (result.data) {
           handleScan(result.data);
        }
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );
    scannerRef.current = qrScanner;

    const startCamera = async () => {
        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            
            // Assign the stream to the video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important: Start the scanner only after the stream is attached.
                qrScanner.start();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings.',
            });
        }
    };
    
    startCamera();

    return () => {
        // Cleanup function to destroy the scanner instance
        qrScanner.destroy();
    };
  }, [handleScan, toast]);

  const resetScanner = () => {
    setScanResult(null);
    setIsProcessing(false);
    // Restart the scanner to look for a new QR code
    scannerRef.current?.start();
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR Code Scanner</h1>
        <p className="text-muted-foreground">Point the camera at a booking QR code to verify it.</p>
      </div>
      
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-4 sm:p-6">
            <div className="aspect-square sm:aspect-video bg-muted rounded-md overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline />
                {hasCameraPermission === null && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
                        <p>Requesting camera permission...</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    
      {scanResult && (
          <Card className="max-w-xl mx-auto">
              <CardHeader className="text-center">
                  <CardTitle className={`flex items-center justify-center gap-2 ${scanResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {scanResult.success ? <CheckCircle /> : <XCircle />}
                      {scanResult.success ? "Verified" : "Verification Failed"}
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                  {scanResult.success && scanResult.data ? (
                    <>
                        <p><strong>User:</strong> {scanResult.data.user}</p>
                        <p><strong>Court:</strong> {scanResult.data.court}</p>
                        <p><strong>Date:</strong> {scanResult.data.date}</p>
                        <p><strong>Time:</strong> {scanResult.data.time}</p>
                        <p><strong>Status:</strong> <span className="font-semibold text-primary">{scanResult.data.status}</span></p>
                    </>
                  ) : (
                    <p className="text-center">{scanResult.message}</p>
                  )}
                  <Button onClick={resetScanner} className="w-full mt-4">Scan Another QR Code</Button>
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
