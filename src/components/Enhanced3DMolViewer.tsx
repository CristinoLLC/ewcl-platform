"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Enhanced3DMolViewerProps {
  pdbData: string;
  entropyMap: number[];
  width?: string;
  height?: string;
  title?: string;
  showLegend?: boolean;
}

export default function Enhanced3DMolViewer({ 
  pdbData, 
  entropyMap,
  width = "100%", 
  height = "500px",
  title = "3D Structure Visualization",
  showLegend = true
}: Enhanced3DMolViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to convert entropy value to color
  const entropyToColor = (entropy: number): string => {
    const r = Math.round(255 * entropy);
    const g = Math.round(255 * (1 - entropy));
    const b = Math.round(100 + (1 - entropy) * 155); // More blue variation
    return `rgb(${r},${g},${b})`;
  };

  useEffect(() => {
    if (!scriptsLoaded || !viewerRef.current || !pdbData || entropyMap.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Access 3DMol.js via window global
      const $3Dmol = (window as any).$3Dmol;
      
      if (!$3Dmol) {
        throw new Error("3DMol.js not loaded properly");
      }

      // Clear any previous viewer
      if (viewerRef.current) {
        while (viewerRef.current.firstChild) {
          viewerRef.current.removeChild(viewerRef.current.firstChild);
        }
      }

      // Create new viewer
      const viewer = $3Dmol.createViewer($(viewerRef.current), {
        backgroundColor: "white",
        antialias: true
      });

      // Add model to viewer
      viewer.addModel(pdbData, "pdb");
      
      // Set base style (light gray)
      viewer.setStyle({}, { cartoon: { color: "#f0f0f0" } });

      // Apply entropy-based coloring
      entropyMap.forEach((entropy, idx) => {
        const color = entropyToColor(entropy);
        viewer.setStyle({ resi: idx + 1 }, { 
          cartoon: { color },
          // Add sticks for high-entropy residues
          stick: { 
            radius: 0.15, 
            color, 
            visible: entropy > 0.7 
          }
        });
      });

      // Finalize the view
      viewer.zoomTo();
      viewer.render();
      setIsLoading(false);
      
      // Clean up function
      return () => {
        try {
          if (viewerRef.current) {
            $(viewerRef.current).empty();
          }
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      };
    } catch (e) {
      console.error("Error initializing 3D viewer:", e);
      setError(`Failed to initialize 3D viewer: ${e instanceof Error ? e.message : String(e)}`);
      setIsLoading(false);
    }
  }, [pdbData, entropyMap, scriptsLoaded]);

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Load required scripts */}
      <Script 
        src="https://code.jquery.com/jquery-3.6.4.min.js"
        strategy="beforeInteractive"
      />
      <Script 
        src="https://3Dmol.org/build/3Dmol-min.js" 
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded(true)}
      />
      
      {/* Header */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500">
          Entropy coloring: blue (stable) → red (collapse-prone)
        </p>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">Loading visualization...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded m-4">
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-1">
            Try refreshing the page or check browser console for details.
          </p>
        </div>
      )}
      
      {/* Viewer container */}
      <div ref={viewerRef} style={{ width, height }}></div>
      
      {/* Legend */}
      {showLegend && (
        <div className="p-3 border-t border-gray-100 flex flex-col space-y-1">
          <div className="text-xs text-gray-500 font-medium">Entropy Scale:</div>
          <div className="h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low (Stable)</span>
            <span>High (Collapse-prone)</span>
          </div>
        </div>
      )}
    </div>
  );
}