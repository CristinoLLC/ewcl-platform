'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';

// Use dynamic import for Plotly
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Benchmark {
  pdb_id: string;
  name: string;
  disprot: string;
}

interface ValidationResult {
  pdb_id: string;
  disprot_id: string;
  name: string;
  r: number;
  rmse: number;
  our: number[];
  ref: number[];
}

export default function ValidationPage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch benchmarks on mount
  useEffect(() => {
    axios.get("/api/benchmarks")
      .then(response => {
        setBenchmarks(response.data);
        if (response.data.length) setSelected(response.data[0].pdb_id);
      })
      .catch(err => {
        console.error("Error loading benchmarks:", err);
        setError("Failed to load benchmark proteins. Please try again later.");
      });
  }, []);

  const runValidation = async () => {
    if (!selected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/validate/${selected}`);
      
      if (response.data.error) {
        setError(response.data.error);
        setResult(null);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      console.error("Validation error:", err);
      setError("An error occurred during validation. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getBenchmarkDetails = (pdbId: string) => {
    return benchmarks.find(b => b.pdb_id === pdbId) || null;
  };

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6">
      <nav className="flex items-center justify-between mb-6">
        <Link href="/" className="text-blue-600 hover:underline">← Back to Analysis</Link>
      </nav>

      <h1 className="text-3xl font-bold">🧪 EWCL Validation</h1>
      <p className="text-gray-700">
        Compare EWCL predictions against experimentally determined disorder data 
        from MobiDB/DisProt for well-characterized proteins.
      </p>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-grow max-w-md">
          <label htmlFor="protein-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Reference Protein
          </label>
          <select
            id="protein-select"
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {benchmarks.map(b => (
              <option key={b.pdb_id} value={b.pdb_id}>
                {b.name} ({b.pdb_id})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={runValidation}
          disabled={loading || !selected}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mt-6"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block mr-2">⟳</span>
              Validating...
            </>
          ) : (
            "Run Validation"
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 mt-8 border rounded-lg p-6 bg-gray-50">
          <div className="flex flex-wrap gap-4 justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">
                Results for {result.name} ({result.pdb_id})
              </h2>
              <p className="text-gray-600 text-sm">
                DisProt ID: {result.disprot_id} | Comparison length: {result.our.length} residues
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className={`p-4 rounded-md ${result.r >= 0.7 ? 'bg-green-100' : result.r >= 0.5 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <div className="text-sm text-gray-500">Pearson Correlation</div>
                <div className="text-2xl font-bold">
                  {result.r.toFixed(3)}
                </div>
              </div>

              <div className={`p-4 rounded-md ${result.rmse <= 0.1 ? 'bg-green-100' : result.rmse <= 0.2 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <div className="text-sm text-gray-500">RMSE</div>
                <div className="text-2xl font-bold">
                  {result.rmse.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Line Plot Comparison</h3>
            <Plot
              data={[
                {
                  x: [...Array(result.our.length).keys()].map(i => i+1),
                  y: result.our,
                  mode: "lines",
                  name: "EWCL Prediction",
                  line: { color: '#1d4ed8', width: 2 }
                },
                {
                  x: [...Array(result.ref.length).keys()].map(i => i+1),
                  y: result.ref,
                  mode: "lines",
                  name: "DisProt Reference",
                  line: { color: '#dc2626', width: 2, dash: 'dot' }
                }
              ]}
              layout={{
                title: `Correlation: ${result.r.toFixed(3)}, RMSE: ${result.rmse.toFixed(3)}`,
                height: 400,
                xaxis: { title: "Residue" },
                yaxis: { 
                  title: "Disorder / Collapse Risk",
                  range: [0, 1]
                },
                legend: {
                  x: 0.02,
                  y: 0.98,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  bordercolor: '#ddd',
                  borderwidth: 1
                },
                margin: { l: 50, r: 20, t: 50, b: 50 }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Heatmap Comparison</h3>
            <Plot
              data={[
                {
                  z: [result.our],
                  y: ['EWCL'],
                  type: 'heatmap',
                  colorscale: [
                    ['0.0', '#2c7bb6'],   // blue
                    ['0.33', '#2c7bb6'],
                    ['0.33', '#fdae61'],  // yellow
                    ['0.66', '#fdae61'],
                    ['0.66', '#d7191c'],  // red
                    ['1.0', '#d7191c']
                  ],
                  showscale: false
                },
                {
                  z: [result.ref],
                  y: ['DisProt'],
                  type: 'heatmap',
                  colorscale: 'Reds',
                  showscale: true,
                  colorbar: { title: 'Disorder' }
                }
              ]}
              layout={{
                height: 200,
                xaxis: { title: "Residue" },
                margin: { t: 10, b: 40, l: 80, r: 30 }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </main>
  );
}