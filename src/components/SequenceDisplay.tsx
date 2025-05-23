// src/components/SequenceDisplay.tsx
interface SequenceDisplayProps {
  sequence: string;
}

export default function SequenceDisplay({ sequence }: SequenceDisplayProps) {
  return (
    <div className="bg-muted/30 p-4 rounded-md shadow-inner max-h-96 overflow-y-auto border border-border">
      <pre className="whitespace-pre-wrap break-all">
        <code className="font-mono text-sm text-foreground/90">
          {sequence}
        </code>
      </pre>
    </div>
  );
}
