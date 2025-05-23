// src/components/DnaInputForm.tsx
"use client";

import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  dnaSequence: z.string().min(1, "DNA sequence cannot be empty."),
});
type DnaFormValues = z.infer<typeof formSchema>;

interface DnaInputFormProps {
  form: UseFormReturn<DnaFormValues>;
  onSubmit: (values: DnaFormValues) => void;
  isLoading: boolean;
}

export default function DnaInputForm({ form, onSubmit, isLoading }: DnaInputFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="dnaSequence"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">DNA Sequence</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter DNA sequence here... e.g., >Seq1\nAGTCGTACGATCG"
                  className="min-h-[200px] font-mono text-sm rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  {...field}
                  aria-label="DNA Sequence Input"
                />
              </FormControl>
              <FormDescription>
                FASTA format is accepted. Lines starting with {'>'} will be ignored.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full md:w-auto rounded-md shadow-md bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-ring focus:ring-offset-2"
          aria-label="Analyze DNA Sequence"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Sequence"
          )}
        </Button>
      </form>
    </Form>
  );
}
