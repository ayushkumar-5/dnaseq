
// src/components/ResultsDisplay.tsx
import type { NucleotideCounts, DnaDerivedProperties } from '@/lib/dnaUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SequenceDisplay from '@/components/SequenceDisplay'; // Re-using for reverse complement
import Image from 'next/image';
import { Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";

interface ResultsDisplayProps {
  counts: NucleotideCounts;
  properties: DnaDerivedProperties;
  conceptualImageUrl: string | null;
  isGeneratingImage: boolean;
}

const chartConfig = {
  A: { label: "Adenine (A)", color: "hsl(var(--chart-1))" },
  T: { label: "Thymine (T)", color: "hsl(var(--chart-2))" },
  C: { label: "Cytosine (C)", color: "hsl(var(--chart-3))" },
  G: { label: "Guanine (G)", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export default function ResultsDisplay({ counts, properties, conceptualImageUrl, isGeneratingImage }: ResultsDisplayProps) {
  const standardNucleotides = ['A', 'T', 'C', 'G'];
  const standardCounts = standardNucleotides.reduce((acc, nuc) => acc + (counts[nuc as keyof NucleotideCounts] as number || 0), 0);
  const totalNucleotides = standardCounts + (counts.Other || 0);

  const chartData = [
    {
      nucleotide: "Counts", 
      A: counts.A || 0,
      T: counts.T || 0,
      C: counts.C || 0,
      G: counts.G || 0,
      Other: counts.Other || 0,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {standardNucleotides.map((nucleotide) => (
          <Card key={nucleotide} className="text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-border">
            <CardHeader className="p-3">
              <CardTitle className="text-lg font-semibold text-muted-foreground">{nucleotide}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-3xl font-bold text-primary">{counts[nucleotide as keyof NucleotideCounts] || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalNucleotides > 0 ? (((counts[nucleotide as keyof NucleotideCounts] || 0) / totalNucleotides) * 100).toFixed(1) : '0.0'}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-border">
        <CardHeader>
            <CardTitle className="text-lg">Sequence Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Sequence Length:</h4>
            <p className="text-md font-semibold">{properties.length} bases</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">GC Content:</h4>
            <p className="text-md font-semibold">{properties.gcContent.toFixed(2)} %</p>
          </div>
          <div>
            <div className="flex items-center">
              <h4 className="font-medium text-sm text-muted-foreground mr-1">Estimated Melting Temperature (Tm):</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Basic formula: 2°C * (A+T) + 4°C * (G+C). This is a simplified estimation, primarily for short DNA sequences and does not account for salt concentration or other factors.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-md font-semibold">{properties.estimatedTm} °C</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Reverse Complement:</h4>
            <SequenceDisplay sequence={properties.reverseComplement} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-border">
        <CardHeader>
            <CardTitle className="text-lg">Full Nucleotide Counts</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
              <TableCaption>Frequency of each nucleotide category in the analyzed sequence.</TableCaption>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[150px]">Base / Category</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {Object.entries(counts).map(([nucleotide, count]) => (
                    <TableRow key={nucleotide}>
                    <TableCell className="font-medium">{nucleotide}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell className="text-right">
                        {totalNucleotides > 0 ? ((count / totalNucleotides) * 100).toFixed(2) : '0.00'}%
                    </TableCell>
                    </TableRow>
                ))}
                <TableRow className="font-bold border-t-2 border-border bg-muted/50">
                    <TableCell>Total Analyzed Bases</TableCell>
                    <TableCell>{totalNucleotides}</TableCell>
                    <TableCell className="text-right">{totalNucleotides > 0 ? '100.00%' : '0.00%'}</TableCell>
                </TableRow>
                </TableBody>
            </Table>
        </CardContent>
       </Card>

      <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Nucleotide Distribution Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="nucleotide" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="A" fill="var(--color-A)" radius={4} />
              <Bar dataKey="T" fill="var(--color-T)" radius={4} />
              <Bar dataKey="C" fill="var(--color-C)" radius={4} />
              <Bar dataKey="G" fill="var(--color-G)" radius={4} />
              <Bar dataKey="Other" fill="var(--color-Other)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Additional Visualizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-md font-semibold mb-2 text-foreground/80">Conceptual Image</h3>
            {isGeneratingImage && !conceptualImageUrl && (
              <div className="w-full max-w-[300px] h-[200px] flex flex-col items-center justify-center bg-muted/50 rounded-md shadow border border-border p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Generating image...</p>
              </div>
            )}
            {(!isGeneratingImage || conceptualImageUrl) && (
              <Image
                src={conceptualImageUrl || "https://placehold.co/300x200.png"}
                alt="Conceptual DNA Image"
                width={300}
                height={200}
                className="rounded-md shadow border border-border object-cover"
                data-ai-hint={conceptualImageUrl ? "" : "dna helix"}
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isGeneratingImage && !conceptualImageUrl ? "AI is creating a conceptual image..." : 
               conceptualImageUrl ? "AI-generated conceptual image." : "Placeholder for a relevant image."}
            </p>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2 text-foreground/80">Explanatory Video</h3>
            <iframe
              width="300"
              height="200"
              src="https://www.youtube.com/embed/o_-6JXLYS-k"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-md shadow bg-muted border border-border"
            ></iframe>
            <p className="text-xs text-muted-foreground mt-1">Embedded YouTube video explaining DNA concepts.</p>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2 text-foreground/80">3D DNA Model</h3>
            <div 
              className="w-full max-w-[400px] h-[300px] border border-border rounded-md shadow overflow-hidden bg-muted/50"
              data-ai-hint="dna molecule"
            >
              <iframe
                title="DNA 3D Model"
                width="100%"
                height="100%"
                src="https://sketchfab.com/models/547d42f6c0184232a945051b6952a39e/embed?autostart=0&ui_animations=0&ui_infos=0&ui_inspector=0&ui_related=0&ui_theme=dark&ui_watermark=0"
                allowFullScreen
                allow="autoplay; fullscreen; xr-spatial-tracking"
                className="border-0"
              ></iframe>
            </div>
             <p className="text-xs text-muted-foreground mt-1">Interactive 3D model of DNA. (Model by <a href="https://sketchfab.com/LassiKaukonen" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Lassi Kaukonen</a> on Sketchfab)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
