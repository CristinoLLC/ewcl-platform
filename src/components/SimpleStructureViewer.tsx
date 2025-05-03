'use client'

import React, { useEffect, useRef, useState } from 'react';

interface SimpleStructureViewerProps {
  pdbUrl: string;
  width?: string;
  height?: string;
}

export default function SimpleStructureViewer({
  pdbUrl,
  width = '100%',
  height = '500px'
}: SimpleStructureViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use effect to initialize viewer only on client-side
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Add 3Dmol.js script to the page
    const script = document.createElement('script');
    script.src = 'https://3dmol.org/build/3Dmol-min.js';
    script.async = true;
    
    // Initialize viewer once script is loaded
    script.onload = async () => {
      try {
        setIsLoading(true);
        
        // Make sure jQuery is also loaded
        if (typeof window.jQuery === 'undefined') {
          const jqueryScript = document.createElement('script');
          jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
          jqueryScript.async = true;
          document.body.appendChild(jqueryScript);
          
          // Wait for jQuery to load
          await new Promise(resolve => {
            jqueryScript.onload = resolve;
          });
        }
        
        // Initialize viewer with delay to ensure libraries are ready
        setTimeout(() => {
          if (!containerRef.current || !window.$3Dmol) return;
          
          // Create viewer
          const viewer = window.$3Dmol.createViewer(window.jQuery(containerRef.current), {
            backgroundColor: 'white',
            antialias: true,
          });
          
          // Load PDB from URL
          window.jQuery.get(pdbUrl, (data) => {
            viewer.addModel(data, 'pdb');
            viewer.setStyle({}, { cartoon: { color: 'spectrum' }});
            viewer.zoomTo();
            viewer.render();
            setIsLoading(false);
          });
        }, 500);
        
      } catch (error) {
        console.error("Error initializing 3D viewer:", error);
        setIsLoading(false);
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Clean up
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [pdbUrl]);
  
  return (
    <div className="relative w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">3D Structure Visualization</h3>
        <p className="text-sm text-gray-500">PDB Structure</p>
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
        className="w-full" 
        style={{ height, width }}
      ></div>
    </div>
  );
}