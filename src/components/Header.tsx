import { TestTube2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border/30 shadow-sm sticky top-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <TestTube2 className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            DNA<span className="text-foreground">SEQ</span>
          </h1>
        </div>
        <span className="text-sm text-muted-foreground hidden md:block">Nucleotide Frequency Analyzer</span>
      </div>
    </header>
  );
}
