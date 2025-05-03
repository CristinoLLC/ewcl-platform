import fs from 'fs';
import path from 'path';

/**
 * Load reference data for validation
 */
export async function loadReferenceData(pdbId: string): Promise<number[]> {
  try {
    const response = await fetch(`/data/validation/${pdbId.toLowerCase()}_disorder.csv`);
    
    if (!response.ok) {
      throw new Error(`Failed to load reference data for ${pdbId}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header
    const dataLines = lines.slice(1);
    
    // Parse S² values and convert to disorder (1-S²)
    return dataLines.map(line => {
      const [, s2] = line.split(',');
      return 1 - parseFloat(s2);
    });
  } catch (error) {
    console.error(`Error loading validation data for ${pdbId}:`, error);
    return [];
  }
}

/**
 * Calculate Pearson correlation coefficient
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate covariance and variances
  let sumCovariance = 0;
  let sumXVariance = 0;
  let sumYVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    
    sumCovariance += xDiff * yDiff;
    sumXVariance += xDiff * xDiff;
    sumYVariance += yDiff * yDiff;
  }
  
  // Calculate correlation
  return sumCovariance / Math.sqrt(sumXVariance * sumYVariance);
}

/**
 * Calculate Root Mean Squared Error
 */
export function calculateRMSE(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) {
    return Infinity;
  }
  
  const n = actual.length;
  const sumSquaredError = actual.reduce((sum, val, i) => {
    const error = val - predicted[i];
    return sum + (error * error);
  }, 0);
  
  return Math.sqrt(sumSquaredError / n);
}

/**
 * Validate EWCL predictions against reference data
 */
export function validateEwclResults(
  pdbId: string, 
  ewclMap: Record<string, number>, 
  referenceData?: number[]
): {
  pearson: number;
  rmse: number;
  isValid: boolean;
  referenceData: number[];
  ewclData: number[];
} {
  // Load reference data if not provided
  const refData = referenceData || [];
  
  // Convert EWCL map to array in proper order
  const ewclData = refData.map((_, i) => {
    const residueIndex = (i + 1).toString();
    return ewclMap[residueIndex] ?? 0;
  });
  
  // Calculate metrics
  const pearson = calculatePearsonCorrelation(refData, ewclData);
  const rmse = calculateRMSE(refData, ewclData);
  
  return {
    pearson,
    rmse,
    isValid: pearson > 0.8 && rmse < 0.1,
    referenceData: refData,
    ewclData
  };
}