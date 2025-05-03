'use client';

import React from 'react';

type Props = {
  values: number[];
};

export default function HeatmapMatrix({ values }: Props) {
  if (!values || values.length === 0) {
    return <div>No entropy data available</div>;
  }

  return (
    <div className="overflow-auto bg-white rounded-md p-4">
      <div className="flex flex-wrap">
        {values.map((value, index) => {
          // Create color gradient from green (low) to red (high)
          const red = Math.floor(255 * value);
          const green = Math.floor(255 * (1 - value));
          const background = `rgb(${red}, ${green}, 100)`;
          
          return (
            <div
              key={index}
              className="flex-shrink-0 m-0.5 w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-800"
              style={{ 
                background,
                border: '1px solid white',
              }}
              title={`Residue ${index + 1}: ${value.toFixed(3)}`}
            >
              {(index + 1) % 10 === 0 ? (index + 1) : ''}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4">
        <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded"></div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}