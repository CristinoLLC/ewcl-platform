import React from "react";ct";
import ResultCard from '@/components/ResultCard';
import ScientificOutput from '@/components/ScientificOutput';

interface ScientificOutputProps {
  data: any;
  title?: string;
}

const ScientificOutput: React.FC<ScientificOutputProps> = ({ data, title }) => (
  <div className="mt-4">
    {title && <h3 className="text-sm font-semibold text-gray-500 mb-1">{title}</h3>}
    <div className="bg-gray-900 text-slate-100 font-mono p-4 rounded-lg shadow-lg border-l-4 border-emerald-400 overflow-auto max-h-64">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  </div>
);

// Example: Showing AI prediction result
{aiPrediction !== null && (
  <div className="space-y-4">
    <ResultCard 
      label="Collapse Risk Score" 
      value={aiPrediction.toFixed(3)}
      color={aiPrediction > 0.7 ? "red" : aiPrediction > 0.4 ? "yellow" : "green"} 
    />
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <ResultCard label="Residues" value={entropyValues.length} color="blue" />
      <ResultCard 
        label="Avg. Entropy" 
        value={entropyValues.length > 0 
          ? (entropyValues.reduce((a, b) => a + b, 0) / entropyValues.length).toFixed(3) 
          : "N/A"
        } 
        color="blue" 
      />
      <ResultCard 
        label="Max Entropy" 
        value={entropyValues.length > 0 
          ? Math.max(...entropyValues).toFixed(3) 
          : "N/A"
        } 
        color="blue" 
      />
    </div>
    
    <ScientificOutput 
      data={{
        collapse_risk: aiPrediction,
        entropy_count: entropyValues.length,
        avg_entropy: entropyValues.length > 0 
          ? (entropyValues.reduce((a, b) => a + b, 0) / entropyValues.length) 
          : null,
        max_entropy: entropyValues.length > 0 ? Math.max(...entropyValues) : null,
      }} 
      title="Analysis Details" 
    />
  </div>
)}

export default ScientificOutput;