
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { verifyBookingByImageDataUri } from './actions';
import { CheckCircle, XCircle, Camera } from 'lucide-react';

type ScanResultData = {
    type: string;
    user: string;
    item: string;
    date: string;
    time: string;
}

export function QrScannerClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; data?: ScanResultData; message: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only run on client
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup
    return () => {
        if(videoRef.current && videoRef.current.srcObject){
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleScan = async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setScanResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if(context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/jpeg');

        try {
            const result = await verifyBookingByImageDataUri(imageDataUri);
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
        } finally {
            setIsProcessing(false);
        }
    } else {
        setIsProcessing(false);
    }
  };
  
  const resetScanner = () => {
    setScanResult(null);
    setIsProcessing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR Code Scanner</h1>
        <p className="text-muted-foreground">Point the camera at a booking QR code and press Scan.</p>
      </div>
      
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === null && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
                        <p>Requesting camera permission...</p>
                    </div>
                )}
            </div>
            <Button onClick={handleScan} disabled={isProcessing || hasCameraPermission !== true} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : "Scan QR Code"}
            </Button>
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
                    <div className="text-left space-y-2">
                        <p><strong>Type:</strong> {scanResult.data.type}</p>
                        <p><strong>User:</strong> {scanResult.data.user}</p>
                        <p><strong>Item:</strong> {scanResult.data.item}</p>
                        <p><strong>Details:</strong> {scanResult.data.date}</p>
                        <p><strong>More Details:</strong> {scanResult.data.time}</p>
                    </div>
                  ) : (
                    <p className="text-center">{scanResult.message}</p>
                  )}
                  <Button onClick={resetScanner} className="w-full mt-4" variant="outline">Scan Another QR Code</Button>
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
