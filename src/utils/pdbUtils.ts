/**
 * Extract protein sequence from PDB data
 */
export function extractSequenceFromPDB(pdbText: string): string {
  // SEQRES records contain the sequence information
  const seqresLines = pdbText.split('\n').filter(line => line.startsWith('SEQRES'));
  
  if (seqresLines.length === 0) {
    // Fallback to ATOM records if no SEQRES
    return extractSequenceFromAtomRecords(pdbText);
  }
  
  // The amino acid codes are in positions 20-22, 24-26, etc.
  const aminoAcids = seqresLines.flatMap(line => {
    const entries = [];
    // Start at position 19 (20th character, 0-indexed)
    for (let i = 19; i < line.length; i += 4) {
      if (i + 3 <= line.length) {
        const aa = line.substring(i, i + 3).trim();
        if (aa) entries.push(aa);
      }
    }
    return entries;
  });

  // Convert 3-letter amino acid codes to 1-letter codes
  return aminoAcids.map(aa => threeToOne[aa.toUpperCase()] || 'X').join('');
}

/**
 * Extract sequence from ATOM records as fallback
 */
function extractSequenceFromAtomRecords(pdbText: string): string {
  const lines = pdbText.split('\n').filter(line => line.startsWith('ATOM'));
  
  // Group atoms by residue number to avoid duplicates
  const residues = new Map();
  
  lines.forEach(line => {
    // Only consider CA atoms (alpha carbon) for simplicity
    if (line.substring(12, 16).trim() === 'CA') {
      const resNum = parseInt(line.substring(22, 26).trim());
      const resName = line.substring(17, 20).trim();
      residues.set(resNum, resName);
    }
  });
  
  // Sort by residue number and convert to one-letter codes
  return Array.from(residues.entries())
    .sort((a, b) => a[0] - b[0])
    .map(entry => threeToOne[entry[1].toUpperCase()] || 'X')
    .join('');
}

// Mapping of 3-letter amino acid codes to 1-letter codes
const threeToOne: Record<string, string> = {
  'ALA': 'A', 'ARG': 'R', 'ASN': 'N', 'ASP': 'D', 'CYS': 'C',
  'GLN': 'Q', 'GLU': 'E', 'GLY': 'G', 'HIS': 'H', 'ILE': 'I',
  'LEU': 'L', 'LYS': 'K', 'MET': 'M', 'PHE': 'F', 'PRO': 'P',
  'SER': 'S', 'THR': 'T', 'TRP': 'W', 'TYR': 'Y', 'VAL': 'V'
};