import fetch from 'node-fetch';
import { loadReferenceData, calculatePearsonCorrelation, calculateRMSE } from '../src/utils/validation';

// Import your EWCL API function or mock it for testing
async function runEwclPrediction(pdbText: string): Promise<Record<string, number>> {
  // Replace with actual API call to your backend
  // This is a mock implementation for testing
  return new Promise((resolve) => {
    // Simulate API response with mock data
    const mockEntropy = Array(140).fill(0).map((_, i) => {
      // Generate synthetic data that would roughly correlate with reference
      return Math.random() * 0.5 + (i < 30 || i > 100 ? 0.1 : 0.4);
    });
    
    // Format as residue: value mapping
    const result: Record<string, number> = {};
    mockEntropy.forEach((val, i) => {
      result[(i + 1).toString()] = val;
    });
    
    resolve(result);
  });
}

describe('EWCL Validation Tests', () => {
  const PDB_ID = '1XQ8'; // Alpha-synuclein

  it('reference data should be loaded correctly', () => {
    const refData = loadReferenceData(PDB_ID);
    expect(refData.length).toBeGreaterThan(0);
    expect(typeof refData[0]).toBe('number');
  });

  it('should have pearson correlation > 0.8 with reference', async () => {
    // Fetch PDB data
    const pdbText = await fetch(`https://files.rcsb.org/download/${PDB_ID}.pdb`)
      .then(res => res.text());
    
    // Run EWCL prediction
    const ewclMap = await runEwclPrediction(pdbText);
    
    // Get reference data
    const refData = loadReferenceData(PDB_ID);
    
    // Format EWCL results
    const ewclData = refData.map((_, i) => {
      const residueId = (i + 1).toString();
      return ewclMap[residueId] || 0;
    });
    
    // Calculate correlation
    const pearson = calculatePearsonCorrelation(refData, ewclData);
    console.log(`Pearson correlation: ${pearson}`);
    
    expect(pearson).toBeGreaterThan(0.8);
  });

  it('should have RMSE < 0.1 with reference', async () => {
    // Similar setup as above
    const pdbText = await fetch(`https://files.rcsb.org/download/${PDB_ID}.pdb`)
      .then(res => res.text());
      
    const ewclMap = await runEwclPrediction(pdbText);
    const refData = loadReferenceData(PDB_ID);
    
    const ewclData = refData.map((_, i) => {
      const residueId = (i + 1).toString();
      return ewclMap[residueId] || 0;
    });
    
    const rmse = calculateRMSE(refData, ewclData);
    console.log(`RMSE: ${rmse}`);
    
    expect(rmse).toBeLessThan(0.1);
  });
});