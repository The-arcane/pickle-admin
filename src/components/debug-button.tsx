'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function DebugButton({ data, error }: { data: any; error: any }) {
  const handleDebug = () => {
    console.clear();
    console.log('--- SUPABASE FETCH DEBUG ---');
    if (error) {
      console.error('Error object:', error);
      alert(
        `Supabase Error: ${error.message}\n\nCode: ${error.code}\nDetails: ${error.details}\n\nCheck the browser developer console for the full error object.`
      );
    } else {
      console.log('Data object:', data);
      alert(
        'No Supabase error detected. The query was successful. Check the browser developer console for the returned data structure.'
      );
    }
  };

  return (
    <Button variant="destructive" onClick={handleDebug}>
      <AlertTriangle className="mr-2 h-4 w-4" />
      Check Fetch Status
    </Button>
  );
}
