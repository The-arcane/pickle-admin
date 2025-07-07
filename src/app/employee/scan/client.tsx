
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { verifyBookingByQr } from './actions';
import QrScanner from 'qr-scanner';

export function QrScannerClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
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
    getCameraPermission();
  }, [toast]);

  useEffect(() => {
    if (hasCameraPermission && videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data) {
            scanner.stop();
            handleScan(result.data);
          }
        },
        { highlightScanRegion: true, highlightCodeOutline: true }
      );
      scanner.start();
      scannerRef.current = scanner;

      return () => {
        scanner.destroy();
      };
    }
  }, [hasCameraPermission]);

  const handleScan = async (data: string) => {
    setIsProcessing(true);
    setScannedData(null);
    try {
        const result = await verifyBookingByQr(data);
        if (result.error) {
            toast({ variant: "destructive", title: "Verification Failed", description: result.error });
        } else {
            toast({ title: "Booking Verified!", description: `Booking for ${result.data?.user} at ${result.data?.court} confirmed.` });
            setScannedData(result.data);
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred during verification." });
    } finally {
        setIsProcessing(false);
        setTimeout(() => {
            setScannedData(null);
            scannerRef.current?.start();
        }, 5000); // Resume scanning after 5 seconds
    }
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">QR Code Scanner</h1>
        <p className="text-muted-foreground">Point the camera at a booking QR code to verify it.</p>
      </div>
      
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-6">
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
                        <p>Camera access is required. Please enable it in your browser settings.</p>
                    </div>
                )}
            </div>
            {isProcessing && <p className="text-center mt-4">Processing...</p>}
        </CardContent>
      </Card>

      {scannedData && (
          <Card className="max-w-xl mx-auto">
              <CardHeader>
                  <CardTitle className="text-green-600">Booking Verified Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                  <p><strong>User:</strong> {scannedData.user}</p>
                  <p><strong>Court:</strong> {scannedData.court}</p>
                  <p><strong>Date:</strong> {scannedData.date}</p>
                  <p><strong>Time:</strong> {scannedData.time}</p>
                  <p><strong>Status:</strong> <span className="font-semibold text-primary">{scannedData.status}</span></p>
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
