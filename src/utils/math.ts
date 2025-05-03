import { pearsonR, rmse } from '@/utils/math';

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
export function pearsonR(x: number[], y: number[]): number {
  if (!x?.length || !y?.length || x.length !== y.length) return 0;
  
  const n = x.length;
  const meanA = x.reduce((s,v) => s + v, 0)/n;
  const meanB = y.reduce((s,v) => s + v, 0)/n;
  
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = x[i] - meanA, db = y[i] - meanB;
    num  += da * db;
    denA += da * da;
    denB += db * db;
  }
  
  if (denA === 0 || denB === 0) return 0;
  return num / Math.sqrt(denA * denB);
}

/**
 * Calculate Root Mean Square Error between two arrays
 */
export function rmse(x: number[], y: number[]): number {
    
  if (!x?.length || !y?.length || x.length !== y.length) return 0;
  
  const n = x.length;
  const sumSquaredError = x.reduce((sum, val, i) => {
    const error = val - y[i];
    return sum + (error * error);
  }, 0);
  
  return Math.sqrt(sumSquaredError / n);
}