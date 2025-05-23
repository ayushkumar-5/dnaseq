
export interface NucleotideCounts {
  A: number;
  T: number;
  C: number;
  G: number;
  Other: number; // To count any characters not A, T, C, or G
}

// Function to parse FASTA format and extract the first sequence
export function parseFasta(input: string): string {
  const lines = input.split(/\r\n|\r|\n/);
  let sequence = '';
  let inFirstSequenceBlock = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '' || trimmedLine.startsWith(';')) continue; 

    if (trimmedLine.startsWith('>')) {
      if (inFirstSequenceBlock) {
        break; 
      } else {
        inFirstSequenceBlock = true;
      }
    } else { 
      if (inFirstSequenceBlock) {
        sequence += trimmedLine;
      }
    }
  }
  return sequence.toUpperCase();
}

// Function to count nucleotides
export function countNucleotides(sequence: string): NucleotideCounts {
  const counts: NucleotideCounts = { A: 0, T: 0, C: 0, G: 0, Other: 0 };
  const validNucleotides = new Set(['A', 'T', 'C', 'G']);

  for (const char of sequence) {
    if (validNucleotides.has(char)) {
      counts[char as 'A' | 'T' | 'C' | 'G']++;
    } else {
      counts.Other++;
    }
  }
  return counts;
}

export interface DnaDerivedProperties {
  length: number;
  gcContent: number; // Percentage
  estimatedTm: number; // Celsius
  reverseComplement: string;
}

// Function to calculate derived DNA properties
export function calculateDerivedDnaProperties(sequence: string, counts: NucleotideCounts): DnaDerivedProperties {
  const length = sequence.length; // Total length including 'Other' characters

  const gcBases = (counts.G || 0) + (counts.C || 0);
  const atBases = (counts.A || 0) + (counts.T || 0);
  const totalStandardBases = gcBases + atBases;

  const gcContent = totalStandardBases > 0 ? (gcBases / totalStandardBases) * 100 : 0;

  // Basic Tm estimation: 2°C for A/T, 4°C for G/C.
  // Valid for short oligos (e.g., 14-20bp), no salt correction.
  // For general DNA, this is a very rough estimate.
  const estimatedTm = (atBases * 2) + (gcBases * 4);

  const complementMap: { [key: string]: string } = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };
  let rcSequence = "";
  for (let i = sequence.length - 1; i >= 0; i--) {
    const base = sequence[i]; // sequence is already uppercase from parseFasta
    rcSequence += complementMap[base] || base; // If not a standard base, keep original (e.g., N, X)
  }

  return {
    length: length,
    gcContent: parseFloat(gcContent.toFixed(2)), // Keep two decimal places for percentage
    estimatedTm: estimatedTm,
    reverseComplement: rcSequence,
  };
}
