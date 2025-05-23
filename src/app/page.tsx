
// src/app/page.tsx
"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react'; 

// AI Flows
import { generateDnaAnomalyWarning, type DnaAnomalyWarningOutput } from '@/ai/flows/dna-anomaly-warning';
import { generateImage } from '@/ai/flows/generate-image-flow';

// Utils
import { parseFasta, countNucleotides, type NucleotideCounts, calculateDerivedDnaProperties, type DnaDerivedProperties } from '@/lib/dnaUtils';

// Components
import Header from '@/components/Header';
import DnaInputForm from '@/components/DnaInputForm';
import SequenceDisplay from '@/components/SequenceDisplay';
import ResultsDisplay from '@/components/ResultsDisplay';
import WarningDisplay from '@/components/WarningDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define form schema
const formSchema = z.object({
  dnaSequence: z.string().min(1, "DNA sequence cannot be empty."),
});
type DnaFormValues = z.infer<typeof formSchema>;

const exampleSequences = [
  ">Example_Sequence_1|Simple\nAGCTAGCTAGCTAGCTGATTACA",
  ">Example_Sequence_2|Mixed_Case_and_Spaces\nAGCTAGCTAGCTAGCTGATTACAGATTACA",
  ">Example_Sequence_3|Potentially_Invalid_Chars\nAGCTAGCTCGTACGTACGTACGAT",
  ">Example_Sequence_4|Short_Sequence\nATGC",
  ">Example_Sequence_5|Only_Invalid_Chars\n"
];

export default function HomePage() {
  const [processedSequence, setProcessedSequence] = useState<string | null>(null);
  const [nucleotideCounts, setNucleotideCounts] = useState<NucleotideCounts | null>(null);
  const [dnaProperties, setDnaProperties] = useState<DnaDerivedProperties | null>(null);
  const [aiWarning, setAiWarning] = useState<DnaAnomalyWarningOutput | null>(null);
  const [conceptualImageUrl, setConceptualImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAnalyzing, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const form = useForm<DnaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dnaSequence: exampleSequences[0],
    },
  });

  useEffect(() => {
    form.setValue("dnaSequence", exampleSequences[currentExampleIndex]);
  }, [currentExampleIndex, form]);

  const handleAnalysis = async (values: DnaFormValues) => {
    startTransition(async () => {
      setProcessedSequence(null);
      setNucleotideCounts(null);
      setDnaProperties(null);
      setAiWarning(null);
      setConceptualImageUrl(null);
      setIsGeneratingImage(false);

      try {
        const rawSequence = values.dnaSequence;
        const parsedSeq = parseFasta(rawSequence);
        
        const warningResult = await generateDnaAnomalyWarning({ dnaSequence: parsedSeq });
        setAiWarning(warningResult);
        
        const counts = countNucleotides(parsedSeq);
        const properties = calculateDerivedDnaProperties(parsedSeq, counts);
        
        setProcessedSequence(parsedSeq);
        setNucleotideCounts(counts);
        setDnaProperties(properties);

        if (counts && (counts.A > 0 || counts.T > 0 || counts.C > 0 || counts.G > 0)) { 
          setIsGeneratingImage(true);
          try {
            const imageResult = await generateImage({ prompt: "Abstract artistic representation of a DNA helix structure, vibrant colors" });
            setConceptualImageUrl(imageResult.imageDataUri);
          } catch (imgError) {
            console.error("Conceptual image generation error:", imgError);
            toast({
              variant: "default",
              title: "Image Note",
              description: "Could not generate the conceptual image. Displaying placeholder.",
            });
          } finally {
            setIsGeneratingImage(false);
          }
        }

        if (!warningResult.shouldDisplayWarning || !warningResult.warningMessage) {
          toast({
            title: "Analysis Complete",
            description: "Nucleotide frequencies and properties have been calculated.",
          });
        } else {
           toast({
            variant: "default",
            title: "Analysis Complete",
            description: "Review warnings, nucleotide frequencies, and properties.",
          });
        }

      } catch (error) {
        console.error("Analysis error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred during analysis.",
        });
        setAiWarning({ warningMessage: "An unexpected server error occurred. Please try again.", shouldDisplayWarning: true });
      }
    });
  };

  const loadNextExample = () => {
    setCurrentExampleIndex((prevIndex) => (prevIndex + 1) % exampleSequences.length);
  };

  return (
  <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        <Card className="shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-[1.01] rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">DNA Sequence Analyzer</CardTitle>
            <CardDescription className="text-base">
              Input your DNA sequence to analyze nucleotide frequencies, properties, and identify potential anomalies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DnaInputForm form={form} onSubmit={handleAnalysis} isLoading={isAnalyzing} />
             <button 
                onClick={loadNextExample} 
                className="text-sm text-primary hover:underline"
                disabled={isAnalyzing}
              >
                Load Next Example Sequence
              </button>
          </CardContent>
        </Card>
        
        <div className={`transition-opacity duration-700 ease-in-out ${isAnalyzing && !nucleotideCounts ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {aiWarning?.shouldDisplayWarning && aiWarning.warningMessage && (
            <WarningDisplay warningMessage={aiWarning.warningMessage} />
          )}

          {(processedSequence || nucleotideCounts || dnaProperties) && <Separator className="my-6 md:my-8" />}

          {processedSequence && (
            <Card className="shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-[1.01] rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Processed Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <SequenceDisplay sequence={processedSequence} />
              </CardContent>
            </Card>
          )}

          {(nucleotideCounts && dnaProperties) && (
            <Card className="mt-6 shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-[1.01] rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Sequence Analysis & Visualizations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsDisplay 
                  counts={nucleotideCounts} 
                  properties={dnaProperties}
                  conceptualImageUrl={conceptualImageUrl}
                  isGeneratingImage={isGeneratingImage}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {isAnalyzing && !conceptualImageUrl && !nucleotideCounts && ( 
          <div className="fixed inset-0 bg-background/80 flex flex-col justify-center items-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            <p className="mt-6 text-xl text-primary font-semibold">Analyzing sequence...</p>
          </div>
        )}
        
        {!isAnalyzing && !processedSequence && !aiWarning && (
            <Card className="mt-6 shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-[1.01] rounded-xl border-dashed border-border">
                <CardContent className="p-6 py-12 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-4 h-16 w-16 text-primary/80" strokeWidth="1.5" />
                    <p className="text-lg font-medium">Ready for Analysis</p>
                    <p className="mt-1 text-sm">Enter a DNA sequence above and click "Analyze Sequence" to view results.</p>
                    <p className="mt-1 text-xs">Use the "Load Next Example" button to try predefined sequences.</p>
                </CardContent>
            </Card>
        )}

      </main>
      <footer className="text-center p-4 mt-auto text-sm text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} DNASEQ - Nucleotide Frequency Analysis. All rights reserved.
      </footer>
    </div>
  );
}
