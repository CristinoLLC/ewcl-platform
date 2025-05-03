'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { pearsonR, rmse } from '@/utils/math';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Protein reference data
const REFERENCE_PROTEINS = [
  {
    id: '1XQ8',
    name: 'Alpha-Synuclein',
    description: 'NMR order parameters (S²), Tang et al. 2003',
    sequence: 'MDVFMKGLSKAKEGVVAAAEKTKQGVAEAAGKTKEGVLYVGSKTKEGVVHGVATVAEKTKEQVTNVGGAVVTGVTAVAQKTVEGAGSIAAATGFVKKDQLGKNEEGAPQEGILEDMPVDPDNEAYEMPSEEGYQDYEPEA'
  }
];

export default function ValidationPage() {
  const [rValue, setRValue] = useState<number | null>(null);
  const [rmseValue, setRmseValue] = useState<number | null>(null);
  const [ewclData, setEwclData] = useState<number[]>([]);
  const [litData, setLitData] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProtein, setSelectedProtein] = useState('1XQ8');

  const runValidation = async () => {
    setLoading(true);
    
    try {
      // Get the selected protein data
      const protein = REFERENCE_PROTEINS.find(p => p.id === selectedProtein);
      if (!protein) {
        throw new Error(`Protein data for ${selectedProtein} not found`);
      }

      // 1) Get your EWCL map
      // For now, we'll fetch from the API endpoint
      const { data: apiResult } = await axios.post('/api/runaiinference', {
        sequence: protein.sequence
      });
      
      // Convert the API result (object) to an array
      const ewclArray = Object.keys(apiResult.ai_map)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(key => apiResult.ai_map[key]);

      // 2) Fetch published disorder JSON
      const { data: literatureData } = await axios.get(`/validation/${selectedProtein}_disorder.json`);

      // Ensure same length for comparison
      const minLength = Math.min(ewclArray.length, literatureData.length);
      const normalizedEwcl = ewclArray.slice(0, minLength);
      const normalizedLit = literatureData.slice(0, minLength);

      // 3) Compute metrics
      const r = pearsonR(normalizedEwcl, normalizedLit);
      const rmsError = rmse(normalizedEwcl, normalizedLit);

      setEwclData(normalizedEwcl);
      setLitData(normalizedLit);
      setRValue(r);
      setRmseValue(rmsError);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Error running validation. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <nav className="flex items-center justify-between mb-6">
        <Link href="/" className="text-blue-600 hover:underline">← Back to Analysis</Link>
      </nav>
      
      <h1 className="text-3xl font-bold">🧪 EWCL Validation</h1>
      <p className="text-gray-700">
        Compare your per-residue EWCL predictions against published NMR disorder data
        for well-characterized proteins. One click, instant correlation & overlay plot.
      </p>

      <div className="flex items-center space-x-4">
        <select
          value={selectedProtein}
          onChange={(e) => setSelectedProtein(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {REFERENCE_PROTEINS.map(protein => (
            <option key={protein.id} value={protein.id}>
              {protein.name} ({protein.id})
            </option>
          ))}
        </select>

        <button
          onClick={runValidation}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running…' : `Run ${selectedProtein} Validation`}
        </button>
      </div>

      {rValue !== null && (
        <div className="space-y-4 mt-8 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-md ${rValue > 0.7 ? 'bg-green-100' : rValue > 0.5 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <div className="text-sm text-gray-500">Pearson Correlation</div>
              <div className="text-2xl font-bold">
                {rValue.toFixed(3)}
              </div>
              <div className="text-sm mt-1">
                {rValue > 0.7 ? 'Strong correlation' : 
                 rValue > 0.5 ? 'Moderate correlation' : 'Weak correlation'}
              </div>
            </div>

            <div className={`p-4 rounded-md ${rmseValue && rmseValue < 0.1 ? 'bg-green-100' : 
                                             rmseValue && rmseValue < 0.2 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <div className="text-sm text-gray-500">Root Mean Square Error</div>
              <div className="text-2xl font-bold">
                {rmseValue?.toFixed(3)}
              </div>
              <div className="text-sm mt-1">
                {rmseValue && rmseValue < 0.1 ? 'Low error' : 
                 rmseValue && rmseValue < 0.2 ? 'Moderate error' : 'High error'}
              </div>
            </div>
          </div>

          <Plot
            data={[
              {
                y: ewclData,
                x: ewclData.map((_, i) => i+1),
                type: 'scatter',
                mode: 'lines',
                name: 'EWCL Score',
                line: { color: 'rgba(31, 119, 180, 0.8)', width: 2 }
              },
              {
                y: litData,
                x: litData.map((_, i) => i+1),
                type: 'scatter',
                mode: 'lines',
                name: 'NMR Disorder',
                line: { color: 'rgba(255, 127, 14, 0.8)', width: 2 }
              }
            ]}
            layout={{
              title: `${selectedProtein}: EWCL vs NMR (r=${rValue.toFixed(3)})`,
              height: 400,
              xaxis: { title: 'Residue' },
              yaxis: { title: 'Disorder Score', range: [0, 1] },
              legend: { x: 0, y: 1.1, orientation: 'h' }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Heatmap Comparison</h2>
            <Plot
              data={[
                {
                  z: [ewclData],
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
                  z: [litData],
                  y: ['NMR'],
                  type: 'heatmap',
                  colorscale: 'Reds',
                  showscale: true,
                  colorbar: { title: 'Disorder' }
                }
              ]}
              layout={{
                height: 300,
                xaxis: { title: 'Residue' },
                margin: { t: 30, b: 50, l: 50, r: 50 }
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