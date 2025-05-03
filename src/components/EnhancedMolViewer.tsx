'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Component implementation without exports
const MolViewerComponent = ({ pdbData, entropyMap = {} }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined' || !viewerRef.current || !pdbData) return;
    
    // Safely import 3dmol only on client side
    const $3Dmol = require('3dmol');
    
    // Initialize viewer
    const viewer = $3Dmol.createViewer($(viewerRef.current), {
      backgroundColor: 'white',
      antialias: true,
    });
    
    // Add model to viewer
    viewer.addModel(pdbData, "pdb");
    
    // Apply coloring based on entropy if available
    if (entropyMap && Object.keys(entropyMap).length > 0) {
      // Base style
      viewer.setStyle({}, { cartoon: { color: 'lightgray' } });
      
      // Apply entropy coloring
      Object.entries(entropyMap).forEach(([residueId, value]) => {
        if (value !== undefined) {
          // Color gradient: blue (low) to red (high)
          const r = Math.floor(value * 255);
          const b = Math.floor((1 - value) * 255);
          const color = `rgb(${r},0,${b})`;
          
          viewer.setStyle({ resi: residueId }, { 
            cartoon: { color: color },
            stick: { 
              radius: 0.2, 
              color: color, 
              visible: value > 0.7 // Only show sticks for high entropy residues
            }
          });
        }
      });
    } else {
      // Default style
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    }
    
    // Zoom and render
    viewer.zoomTo();
    viewer.render();
    
    // Cleanup on unmount
    return () => {
      try {
        $(viewerRef.current).empty();
      } catch (e) {
        console.error("Viewer cleanup error:", e);
      }
    };
  }, [pdbData, entropyMap]);
  
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
      <div className="p-3 bg-gray-50 border-b">
        <h3 className="text-lg font-medium">3D Structure Visualization</h3>
        {Object.keys(entropyMap).length > 0 && (
          <p className="text-sm text-gray-500">Colored by entropy: blue (low) to red (high)</p>
        )}
      </div>
      <div ref={viewerRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(
  () => Promise.resolve(MolViewerComponent),
  { ssr: false }
);