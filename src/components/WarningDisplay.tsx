// src/components/WarningDisplay.tsx
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WarningDisplayProps {
  warningMessage: string | null;
}

export default function WarningDisplay({ warningMessage }: WarningDisplayProps) {
  if (!warningMessage) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 shadow-md rounded-lg">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-semibold">Analysis Warning!</AlertTitle>
      <AlertDescription>{warningMessage}</AlertDescription>
    </Alert>
  );
}
