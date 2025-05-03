'use client';

import React from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';

interface ResultCardProps {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  label, 
  value, 
  color = "blue" 
}) => {
  const colorClasses = {
    blue: "border-blue-400 bg-blue-50 text-blue-800",
    green: "border-green-400 bg-green-50 text-green-800",
    yellow: "border-amber-400 bg-amber-50 text-amber-800",
    red: "border-red-400 bg-red-50 text-red-800",
  };
  
  return (
    <div className={`border-l-4 p-4 rounded-md shadow-sm ${colorClasses[color]}`}>
      <p className="text-xs uppercase tracking-wider font-medium">{label}</p>
      <p className="text-lg font-mono font-semibold mt-1">{value}</p>
    </div>
  );
};

interface ScientificOutputProps {
  data: any;
  title?: string;
}

export const ScientificOutput: React.FC<ScientificOutputProps> = ({ 
  data, 
  title 
}) => (
  <div className="mt-6">
    {title && <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>}
    <div className="bg-gray-900 text-slate-100 font-mono p-4 rounded-lg shadow-md border-l-4 border-cyan-500 overflow-auto max-h-64">
      <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  </div>
);

interface HeatmapLegendProps {
  min: number;
  max: number;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ min, max }) => {
  const steps = 10;
  const colorScale = scaleSequential(interpolateRdYlGn).domain([1, 0]);
  
  return (
    <div className="mt-4">
      <div className="flex items-center">
        <div className="h-2 flex-grow bg-gradient-to-r from-red-500 via-yellow-300 to-green-500 rounded"></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600 px-1 mt-1">
        <span>High Risk ({max.toFixed(2)})</span>
        <span>Low Risk ({min.toFixed(2)})</span>
      </div>
    </div>
  );
};

interface EntropyTooltipProps {
  residue: number;
  score: number;
  aiScore?: number;
}

export const EntropyTooltip: React.FC<EntropyTooltipProps> = ({ 
  residue, 
  score, 
  aiScore 
}) => (
  <div className="absolute bg-white shadow-lg rounded-md p-3 z-50 border border-gray-200 w-48 text-sm">
    <p className="font-semibold border-b border-gray-200 pb-1 mb-2">Residue #{residue}</p>
    <p className="flex justify-between">
      <span className="text-gray-600">EWCL Score:</span>
      <span className="font-medium">{score.toFixed(3)}</span>
    </p>
    {aiScore !== undefined && (
      <p className="flex justify-between mt-1">
        <span className="text-gray-600">AI Score:</span>
        <span className="font-medium">{aiScore.toFixed(3)}</span>
      </p>
    )}
  </div>
);

interface AnalysisResultProps {
  entropyValues: number[];
  aiPrediction: number | null;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
  entropyValues, 
  aiPrediction 
}) => {
  if (!entropyValues.length) return null;
  
  const avgEntropy = entropyValues.reduce((a, b) => a + b, 0) / entropyValues.length;
  const maxEntropy = Math.max(...entropyValues);
  const minEntropy = Math.min(...entropyValues);
  
  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h3>
      
      {aiPrediction !== null && (
        <ResultCard 
          label="Collapse Risk Score" 
          value={aiPrediction.toFixed(3)}
          color={aiPrediction > 0.7 ? "red" : aiPrediction > 0.4 ? "yellow" : "green"} 
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <ResultCard label="Residues" value={entropyValues.length} color="blue" />
        <ResultCard 
          label="Avg. Entropy" 
          value={avgEntropy.toFixed(3)}
          color="blue" 
        />
        <ResultCard 
          label="Max Entropy" 
          value={maxEntropy.toFixed(3)}
          color="blue" 
        />
      </div>
      
      <HeatmapLegend min={minEntropy} max={maxEntropy} />
      
      <ScientificOutput 
        data={{
          collapse_risk: aiPrediction,
          entropy_count: entropyValues.length,
          avg_entropy: avgEntropy,
          max_entropy: maxEntropy,
          min_entropy: minEntropy
        }} 
        title="Technical Details" 
      />
      
      <div className="flex justify-end gap-3 mt-6">
        <button 
          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50"
          onClick={() => {
            const csv = `Residue,Entropy\n${entropyValues.map((val, i) => `${i+1},${val}`).join('\n')}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', 'entropy_analysis.csv');
            a.click();
          }}
        >
          Export CSV
        </button>
        <button 
          className="bg-cyan-600 text-white px-4 py-2 rounded shadow-sm hover:bg-cyan-700"
          onClick={() => {
            // PDF export logic would go here
            alert('PDF export functionality to be implemented');
          }}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
};