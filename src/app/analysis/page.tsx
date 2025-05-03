'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';
import '../globals.css'; 
import '../fallback.css';
import ValidationResults from '@/components/ValidationResults';
import { extractSequenceFromPDB, roundEntropyMap } from '@/utils/pdb-utils';
import { isPdbInRegistry, getValidationInfo } from '@/utils/validation-registry';

// Use dynamic imports for components that use browser APIs
const ThreeDmolViewer = dynamic(
  () => import('@/components/ThreeDmolViewer'),
  { ssr: false }
);

const EwclHeatmap = dynamic(
  () => import('@/components/EwclHeatmap'),
  { ssr: false }
);

export default function AnalysisPage() {
  const [pdbData, setPdbData] = useState<string>('');
  const [entropyMap, setEntropyMap] = useState<number[]>([]);
  const [predictionReady, setPredictionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Helper function to generate random entropy map for demo purposes
  const generateRandomEntropyMap = (length = 100) => {
    const seed = 42;
    let value = seed;
    
    return Array(length).fill(0).map((_, i) => {
      value = (value * 9301 + 49297) % 233280;
      const random = value / 233280;
      
      // Add some structure to the randomness (based on position)
      const positionFactor = Math.sin(i / 10) * 0.2 + 0.5;
      return (random * 0.6 + positionFactor * 0.4);
    });
  };

  const uploadHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setEntropyMap([]);
    setPredictionReady(false);
    setUploadProgress(0);

    const reader = new FileReader();
    
    reader.onload = (ev) => {
      const pdbContent = ev.target?.result as string;
      setPdbData(pdbContent);
      
      // Extract sequence for consistent API calls
      const sequence = extractSequenceFromPDB(pdbContent);
      console.log(`Extracted sequence: ${sequence.substring(0, 20)}... (${sequence.length} residues)`);
      
      // Simulate API call for entropy prediction with just the sequence
      setTimeout(() => {
        // In a real implementation, you'd call your API with the sequence
        // const response = await fetch('/api/runaiinference', { 
        //   method: 'POST', 
        //   body: JSON.stringify({ sequence }) 
        // });
        // const data = await response.json();
        // const entropyData = data.ai_map;
        
        // For now, generate random data with fixed seed for stability
        const entropyData = generateRandomEntropyMap(sequence.length);
        // Round values for consistency
        const roundedData = roundEntropyMap(entropyData, 4);
        
        setEntropyMap(roundedData);
        setPredictionReady(true);
        setLoading(false);
      }, 1500);
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentLoaded = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentLoaded);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      setError("Failed to read file. Please try again.");
    };

    reader.readAsText(file);
  };

  const downloadJson = () => {
    // Try to extract PDB ID from the file content
    const pdbIdMatch = pdbData.match(/HEADER.*?(?:ID|CODE)\s+(\w+)/i);
    const pdbId = pdbIdMatch ? pdbIdMatch[1].trim() : 'unknown';
    
    const payload = {
      pdb_id: pdbId,
      timestamp: new Date().toISOString(),
      residue_entropy: entropyMap.map((e, i) => ({ residue: i + 1, entropy: e })),
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    
    saveAs(blob, `ewcl_${pdbId}_${Date.now()}.json`);
  };

  return (
    <main>
      {/* Header */}
      <nav>
        <div>
          <Link href="/" style={{textDecoration: "none"}}>
            <span style={{fontSize: "1.5rem", fontWeight: "bold", color: "#1d4ed8"}}>
              🧬 EWCL Platform
            </span>
          </Link>
          <Link href="/validation" className="ml-6 text-blue-600 hover:text-blue-800">
            🔬 Validation
          </Link>
          <span className="status-indicator ml-auto">
            <span className="status-dot"></span>
            API Online
          </span>
        </div>
      </nav>

      <div className="content">
        <h1>Protein Structure Analysis</h1>
        
        {/* Upload Section */}
        <div className="analysis-card">
          <h2>Upload Your Protein</h2>
          <p className="card-description">Select a PDB file to analyze the collapse risk:</p>
          
          <div className="upload-container">
            <input 
              type="file" 
              accept=".pdb"
              onChange={uploadHandler}
              style={{display: 'none'}}
              ref={fileInputRef}
            />
            
            <motion.button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="upload-icon">📂</span>
              Select PDB File
            </motion.button>
            
            {uploadProgress > 0 && (
              <div className="progress-container">
                <motion.div 
                  className="progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
          </div>
          
          {pdbData && !loading && (
            <div className="success-message">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                ✅ PDB file uploaded successfully! ({(pdbData.length / 1024).toFixed(1)} KB)
              </motion.div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        {/* 3D Visualization */}
        {pdbData && !loading && (
          <div className="analysis-card">
            <h2>2. Protein Structure</h2>
            <div className="viewer-container enhanced">
              {/* Real 3D viewer instead of placeholder */}
              <ThreeDmolViewer pdbData={pdbData} entropyMap={entropyMap} />
            </div>
              <div className="mt-4 flex space-x-2 justify-end">
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(pdbData)}`}
                download="structure.pdb"
                className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
              >
                📥 Download PDB
              </a>
              <button
                onClick={downloadJson}
                className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
              >
                📥 Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {predictionReady && (
          <div className="analysis-card">
            <h2>3. Collapse Risk Heatmap</h2>
            <EwclHeatmap entropyMap={entropyMap} />
            
            <div className="prediction-summary">
              <h3>AI Prediction Results</h3>
              <div className="prediction-stats">
                <div className="stat-item">
                  <span className="stat-label">High Risk Residues:</span>
                  <span className="stat-value">{entropyMap.filter(v => v > 0.66).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Medium Risk Residues:</span>
                  <span className="stat-value">{entropyMap.filter(v => v >= 0.33 && v <= 0.66).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Low Risk Residues:</span>
                  <span className="stat-value">{entropyMap.filter(v => v < 0.33).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Overall Stability Score:</span>
                  <span className="stat-value">{(100 - (entropyMap.reduce((sum, val) => sum + val, 0) / entropyMap.length) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-right">
              <button
                onClick={downloadJson}
                className="text-sm text-blue-600 hover:underline"
              >
                📄 Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {predictionReady && isPdbFromKnownSet(pdbData) && (
          <div className="analysis-card">
            <h2>4. Validation Against Experimental Data</h2>
            <div className="validation-info">
              {(() => {
                const pdbId = extractPdbId(pdbData);
                const info = getValidationInfo(pdbId);
                return info ? (
                  <p>
                    Comparing EWCL predictions with experimental data from{' '}
                    <strong>{info.publication}</strong> for{' '}
                    <strong>{info.protein}</strong> using {info.metric}.
                    {info.referenceUrl && (
                      <a 
                        href={info.referenceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        View publication
                      </a>
                    )}
                  </p>
                ) : null;
              })()}
            </div>
            <ValidationResults 
              pdbId={extractPdbId(pdbData)} 
              ewclMap={entropyMap.reduce((acc, val, idx) => {
                acc[(idx + 1).toString()] = val;
                return acc;
              }, {} as Record<string, number>)} 
            />
          </div>
        )}
      </div>
      
      <footer>
        <p>© {new Date().getFullYear()} EWCL Platform — Developed by CristinoLLC</p>
      </footer>
    </main>
  );
}

// Add these helper functions
function extractPdbId(pdbData: string): string {
  // Extract PDB ID from header or filename
  const headerMatch = pdbData.match(/HEADER.*?(?:ID|CODE)\s+(\w+)/i);
  return headerMatch?.[1] || 'unknown';
}

function isPdbFromKnownSet(pdbData: string): boolean {
  const id = extractPdbId(pdbData);
  return isPdbInRegistry(id);
}