'use client'

import React, { useEffect, useRef, useState } from 'react';
// Use dynamic import to avoid direct dependency conflicts
import dynamic from 'next/dynamic';

// Configure the import to be client-side only
const Molstar = dynamic(
  () => import('molstar').then(mod => ({ 
    default: mod.Viewer 
  })),
  { ssr: false }
);

interface MolStarViewerProps {
  pdbUrl: string;
  entropyMap?: Record<string, number>;
}

export default function MolStarViewer({ pdbUrl, entropyMap }: MolStarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Don't try to initialize on the server
    if (typeof window === 'undefined') return;
    
    let viewer: any = null;
    
    const initViewer = async () => {
      if (!containerRef.current || !Molstar) return;
      
      try {
        setIsLoading(true);
        
        // Initialize viewer
        // This is a simplified approach that will need to be adapted
        // to the actual Mol* API once imported
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize MolStar viewer:', error);
      }
    };
    
    initViewer();
    
    return () => {
      // Cleanup
      if (viewer) {
        // Add cleanup code here
      }
    };
  }, [pdbUrl, entropyMap]);

  return (
    <div className="relative w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">3D Structure Visualization</h3>
        <p className="text-sm text-gray-500">Colored by entropy: blue (low) to red (high)</p>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-600">Loading structure...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-[600px]"
      ></div>
    </div>
  );
}