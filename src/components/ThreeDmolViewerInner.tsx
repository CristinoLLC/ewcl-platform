'use client';

import { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

type ThreeDmolViewerProps = {
  pdbData: string;
};

export default function ThreeDmolViewerInner({ pdbData }: ThreeDmolViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current || !pdbData) return;
    
    // Small delay to ensure container is ready
    setTimeout(() => {
      const element = viewerRef.current;
      if (!element) return;
      
      element.innerHTML = ''; // Clear old viewer
      
      try {
        const config = { backgroundColor: 'white' };
        const viewer = $3Dmol.createViewer(element, config);
        
        viewer.addModel(pdbData, 'pdb'); // load PDB data
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.zoomTo();
        viewer.render();
        
        window.addEventListener('resize', () => {
          viewer.resize();
          viewer.render();
        });
      } catch (error) {
        console.error("Error initializing 3DMol viewer:", error);
      }
    }, 100);
  }, [pdbData]);

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }} className="mx-auto">
      <div
        ref={viewerRef}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100%',
          background: 'white'
        }}
        className="rounded-lg border border-gray-300 overflow-hidden"
      />
    </div>
  );
}