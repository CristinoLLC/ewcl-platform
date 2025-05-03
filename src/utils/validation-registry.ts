interface ValidationEntry {
  pdbId: string;
  protein: string;
  publication: string;
  metric: string;
  description: string;
  referenceUrl?: string;
}

export const validationRegistry: ValidationEntry[] = [
  {
    pdbId: '1xq8',
    protein: 'Alpha-Synuclein',
    publication: 'Tang et al. 2003',
    metric: 'S² order parameter',
    description: 'NMR-derived order parameters mapped to disorder (1 - S²)',
    referenceUrl: 'https://doi.org/10.1021/bi0262726'
  },
  {
    pdbId: '2k4x',
    protein: 'p53 tail',
    publication: 'Lowry et al. 2008',
    metric: 'RMSF per-residue',
    description: 'MD-derived flexibility measurements',
    referenceUrl: 'https://doi.org/10.1021/bi702312z'
  },
  {
    pdbId: '5j7y',
    protein: 'Ubiquitin',
    publication: 'Lin et al. 2017',
    metric: 'S² order parameter',
    description: 'NMR relaxation data for human ubiquitin',
    referenceUrl: 'https://doi.org/10.1038/nature17991'
  }
];

export function isPdbInRegistry(pdbId: string): boolean {
  return validationRegistry.some(entry => 
    entry.pdbId.toLowerCase() === pdbId.toLowerCase()
  );
}

export function getValidationInfo(pdbId: string): ValidationEntry | undefined {
  return validationRegistry.find(entry => 
    entry.pdbId.toLowerCase() === pdbId.toLowerCase()
  );
}