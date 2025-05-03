/**
 * Process entropy values into the format needed for charts
 */
export const processDataForChart = (entropyValues: number[], aiPrediction?: number | null) => {
  return entropyValues.map((value, index) => ({
    residue: index + 1,
    ewcl: value,
    ai: aiPrediction !== undefined && aiPrediction !== null ? aiPrediction : undefined
  }));
};