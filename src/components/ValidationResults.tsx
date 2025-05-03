'use client';

import React, { useEffect, useState } from 'react';
import { loadReferenceData, calculatePearsonCorrelation, calculateRMSE } from '@/utils/validation';

interface Props {
  pdbId: string;
  ewclMap: Record<string, number>;
}

export default function ValidationResults({ pdbId, ewclMap }: Props) {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateResults() {
      try {
        // Load reference data
        const referenceData = await loadReferenceData(pdbId);
        
        if (!referenceData.length) {
          throw new Error(`No reference data available for ${pdbId}`);
        }
        
        // Convert EWCL map to array in proper order
        const ewclData = referenceData.map((_, i) => {
          const residueIndex = (i + 1).toString();
          return ewclMap[residueIndex] ?? 0;
        });
        
        // Calculate metrics
        const pearson = calculatePearsonCorrelation(referenceData, ewclData);
        const rmse = calculateRMSE(referenceData, ewclData);
        
        setResults({
          pearson,
          rmse,
          isValid: pearson > 0.8 && rmse < 0.1,
          referenceData,
          ewclData
        });
        
      } catch (err) {
        console.error("Validation error:", err);
        setError(`${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    validateResults();
  }, [pdbId, ewclMap]);

  if (isLoading) {
    return (
      <div className="validation-loading">
        <span className="loading-spinner"></span>
        Validating EWCL results against experimental data...
      </div>
    );
  }

  if (error) {
    return <div className="validation-error">{error}</div>;
  }

  if (!results) {
    return <div className="validation-na">No validation data available for {pdbId}</div>;
  }

  return (
    <div className="validation-results">
      <h3>Validation Against Experimental Data</h3>
      <div className="validation-metrics">
        <div className={`metric ${results.pearson > 0.8 ? 'valid' : 'invalid'}`}>
          <span className="metric-label">Pearson Correlation:</span>
          <span className="metric-value">{results.pearson.toFixed(3)}</span>
          <span className="metric-status">
            {results.pearson > 0.8 ? '✓' : '✗'}
          </span>
        </div>
        <div className={`metric ${results.rmse < 0.1 ? 'valid' : 'invalid'}`}>
          <span className="metric-label">RMSE:</span>
          <span className="metric-value">{results.rmse.toFixed(3)}</span>
          <span className="metric-status">
            {results.rmse < 0.1 ? '✓' : '✗'}
          </span>
        </div>
        <div className="overall-status">
          <strong>Overall:</strong> 
          {results.isValid 
            ? <span className="valid">Prediction matches experimental data ✓</span>
            : <span className="invalid">Prediction deviates from experimental data ✗</span>
          }
        </div>
      </div>
    </div>
  );
}