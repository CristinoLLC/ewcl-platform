/**
 * Extract amino acid sequence from a PDB file
 */
export function extractSequenceFromPDB(pdbText: string): string {
  const lines = pdbText.split('\n');
  let sequence = '';
  const seenResidues = new Set();
  
  // Map of 3-letter amino acid codes to 1-letter codes
  const aaMap: Record<string, string> = {
    'ALA': 'A', 'ARG': 'R', 'ASN': 'N', 'ASP': 'D', 'CYS': 'C',
    'GLN': 'Q', 'GLU': 'E', 'GLY': 'G', 'HIS': 'H', 'ILE': 'I',
    'LEU': 'L', 'LYS': 'K', 'MET': 'M', 'PHE': 'F', 'PRO': 'P',
    'SER': 'S', 'THR': 'T', 'TRP': 'W', 'TYR': 'Y', 'VAL': 'V'
  };
  
  // Extract sequence from ATOM records
  for (const line of lines) {
    if (line.startsWith('ATOM') && line.includes(' CA ')) {
      const resName = line.substring(17, 20).trim();
      const resNum = parseInt(line.substring(22, 26).trim());
      const chainID = line.substring(21, 22).trim();
      
      // Use chainID+resNum as a unique identifier to avoid duplicates
      const resKey = `${chainID}:${resNum}`;
      
      if (!seenResidues.has(resKey) && aaMap[resName]) {
        seenResidues.add(resKey);
        sequence += aaMap[resName];
      }
    }
  }
  
  return sequence;
}

/**
 * Round all values in the entropy map to a specific precision
 */
export function roundEntropyMap(entropyMap: number[], precision = 4): number[] {
  return entropyMap.map(value => parseFloat(value.toFixed(precision)));
}