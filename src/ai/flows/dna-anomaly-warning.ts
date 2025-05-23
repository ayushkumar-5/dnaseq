'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating warnings about potential anomalies or errors in DNA sequences.
 *
 * - `generateDnaAnomalyWarning`:  A function that takes a DNA sequence as input and returns a warning message if anomalies are detected.
 * - `DnaAnomalyWarningInput`: The input type for the `generateDnaAnomalyWarning` function.
 * - `DnaAnomalyWarningOutput`: The output type for the `generateDnaAnomalyWarning` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DnaAnomalyWarningInputSchema = z.object({
  dnaSequence: z
    .string()
    .describe('The DNA sequence to analyze for anomalies.'),
});
export type DnaAnomalyWarningInput = z.infer<typeof DnaAnomalyWarningInputSchema>;

const DnaAnomalyWarningOutputSchema = z.object({
  warningMessage: z
    .string()
    .describe(
      'A warning message indicating any anomalies or errors found in the DNA sequence, or null if no issues were detected.'
    ),
  shouldDisplayWarning: z
    .boolean()
    .describe(
      'A boolean value indicating whether the warning message should be displayed to the user.'
    ),
});
export type DnaAnomalyWarningOutput = z.infer<typeof DnaAnomalyWarningOutputSchema>;

export async function generateDnaAnomalyWarning(
  input: DnaAnomalyWarningInput
): Promise<DnaAnomalyWarningOutput> {
  return dnaAnomalyWarningFlow(input);
}

const dnaAnomalyWarningPrompt = ai.definePrompt({
  name: 'dnaAnomalyWarningPrompt',
  input: {schema: DnaAnomalyWarningInputSchema},
  output: {schema: DnaAnomalyWarningOutputSchema},
  prompt: `You are a DNA sequence analysis tool. Examine the given DNA sequence for potential anomalies or errors, such as the presence of non-DNA characters (anything other than A, T, C, or G). If anomalies are found, generate a concise and informative warning message. Also, determine if the warning needs to be displayed to the user.

DNA Sequence: {{{dnaSequence}}}

If the DNA sequence contains only A, T, C, and G characters, return a warningMessage of null and shouldDisplayWarning of false.
`,
});

const dnaAnomalyWarningFlow = ai.defineFlow(
  {
    name: 'dnaAnomalyWarningFlow',
    inputSchema: DnaAnomalyWarningInputSchema,
    outputSchema: DnaAnomalyWarningOutputSchema,
  },
  async input => {
    const {output} = await dnaAnomalyWarningPrompt(input);
    return output!;
  }
);
