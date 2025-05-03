'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface EwclHeatmapProps {
  entropyMap: number[];
  title?: string;
}

const thresholds = [0.33, 0.66]; // define your cutpoints

function classify(val: number) {
  if (val <= thresholds[0]) return 'Low';
  if (val <= thresholds[1]) return 'Medium';
  return 'High';
}

export default function EwclHeatmap({ entropyMap, title = 'Collapse Risk Heatmap' }: EwclHeatmapProps) {
  if (!entropyMap?.length) return null;

  // Build a 2D array of categories so Plotly can color discretely
  const z = [entropyMap.map(classify)];
  // Map categories to numeric levels 0/1/2
  const numericZ = [entropyMap.map(v => classify(v) === 'Low' ? 0 : classify(v) === 'Medium' ? 1 : 2)];

  return (
    <div className="w-full">
      <Plot
        data={[{
          z: numericZ,
          x: entropyMap.map((_, i) => i + 1),
          type: 'heatmap',
          colorscale: [
            ['0.0', '#2c7bb6'],   // blue
            ['0.33', '#2c7bb6'],
            ['0.33', '#fdae61'],  // yellow
            ['0.66', '#fdae61'],
            ['0.66', '#d7191c'],  // red
            ['1.0', '#d7191c']
          ],
          showscale: false,
          hovertemplate:
            'Residue %{x}<br>' +
            'Score %{customdata:.4f}<br>' +
            'Risk: %{text}<extra></extra>',
          text: [z[0]],
          customdata: [entropyMap],
        }]}
        layout={{
          title,
          xaxis: { title: 'Residue' },
          yaxis: { visible: false },
          margin: { t: 40, b: 40 }
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: 300 }}
      />

      {/* Manual Legend */}
      <div className="flex justify-center items-center mt-2 space-x-4 text-sm">
        {['Low', 'Medium', 'High'].map((label) => {
          const color = { Low: '#2c7bb6', Medium: '#fdae61', High: '#d7191c' }[label];
          return (
            <div key={label} className="flex items-center">
              <span 
                className="w-4 h-4 inline-block mr-1 rounded-sm" 
                style={{ backgroundColor: color }} 
              />
              {label} Risk
            </div>
          );
        })}
      </div>
    </div>
  );
}