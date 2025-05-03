'use client';

import React, { useEffect, useRef } from 'react';
import { load3Dmol } from '@/utils/load3dmol';

interface Props { 
  pdbData: string;
  entropyMap: number[];
}

export default function ThreeDmolViewer({ pdbData, entropyMap = [] }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current || !pdbData) return;
    
    // Cleanup any previous viewers
    while (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }
    
    let viewer: any = null;
    
    const initViewer = async () => {
      try {
        const $3Dmol = await load3Dmol();
        
        viewer = $3Dmol.createViewer(container.current!, {
          backgroundColor: 'white',
        });
        
        viewer.addModel(pdbData, 'pdb');
        
        // Add color legend
        const legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.bottom = '10px';
        legend.style.left = '10px';
        legend.style.display = 'flex';
        legend.style.alignItems = 'center';
        legend.style.fontSize = '12px';
        legend.style.backgroundColor = 'rgba(255,255,255,0.7)';
        legend.style.padding = '4px';
        legend.style.borderRadius = '4px';
        legend.innerHTML = `
          <div style="display:flex;align-items:center;margin-right:10px">
            <div style="width:12px;height:12px;background:#2c7bb6;margin-right:4px;border-radius:2px"></div>
            <span>Low Risk</span>
          </div>
          <div style="display:flex;align-items:center;margin-right:10px">
            <div style="width:12px;height:12px;background:#fdae61;margin-right:4px;border-radius:2px"></div>
            <span>Medium Risk</span>
          </div>
          <div style="display:flex;align-items:center;">
            <div style="width:12px;height:12px;background:#d7191c;margin-right:4px;border-radius:2px"></div>
            <span>High Risk</span>
          </div>
        `;
        container.current.appendChild(legend);
        
        // Create a tooltip div
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.display = 'none';
        tooltip.style.zIndex = '100';
        tooltip.style.maxWidth = '200px';
        tooltip.style.textAlign = 'center';
        tooltip.style.whiteSpace = 'nowrap';
        container.current.appendChild(tooltip);
        tooltipRef.current = tooltip;
        
        // Style the protein
        viewer.setStyle({}, { cartoon: { 
          colorfunc: (atom: any) => {
            // residue numbers in PDB start at 1, array index at 0
            const idx = atom.resi - 1;
            
            if (idx >= 0 && idx < entropyMap.length) {
              const score = entropyMap[idx];
              
              // FIXED: Use correct color creation syntax
              if (score <= 0.33) {
                return $3Dmol.Color.fromHex('#2c7bb6'); // Low risk - blue
              } else if (score <= 0.66) {
                return $3Dmol.Color.fromHex('#fdae61'); // Medium risk - yellow/orange
              } else {
                return $3Dmol.Color.fromHex('#d7191c'); // High risk - red
              }
            }
            
            // Default
            return new $3Dmol.Color(0.5, 0.5, 0.5);
          }
        }});
        
        // Make atoms clickable with tooltip
        viewer.setClickable({}, true, function(atom: any) {
          if (atom) {
            const idx = atom.resi - 1;
            
            if (idx >= 0 && idx < entropyMap.length) {
              const entropyValue = entropyMap[idx];
              const riskLevel = entropyValue <= 0.33 ? 'Low' : 
                              entropyValue <= 0.66 ? 'Medium' : 'High';
              
              tooltip.innerHTML = `
                <div>
                  <strong>Residue ${atom.resi}</strong> (${atom.resn})
                  <br />
                  Score: ${entropyValue.toFixed(4)}
                  <br />
                  Risk: <span style="color: ${
                    entropyValue <= 0.33 ? '#2c7bb6' : 
                    entropyValue <= 0.66 ? '#fdae61' : '#d7191c'
                  }">${riskLevel}</span>
                </div>
              `;
              
              // Position tooltip near the atom's screen position
              const pos = viewer.modelToScreen(atom.x, atom.y, atom.z);
              tooltip.style.left = `${pos.x - tooltip.offsetWidth/2}px`;
              tooltip.style.top = `${pos.y - tooltip.offsetHeight - 10}px`;
              tooltip.style.display = 'block';
            }
          }
        });
        
        // Hide tooltip when clicking on empty space
        container.current.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).tagName === 'CANVAS') {
            tooltip.style.display = 'none';
          }
        });
        
        viewer.zoomTo();
        viewer.render();
        
        // Slow spin to showcase the molecule when first loaded
        viewer.spin('y', 1);
        setTimeout(() => {
          if (viewer) viewer.spin(false);
        }, 2000);
        
      } catch (error) {
        console.error("Error initializing 3DMol viewer:", error);
      }
    };
    
    initViewer();
    
    // Clean up
    return () => {
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
      }
      if (viewer) {
        try {
          viewer.spin(false);
        } catch (e) {
          console.error("Error cleaning up viewer:", e);
        }
      }
    };
  }, [pdbData, entropyMap]);

  return <div ref={container} style={{ width: '100%', height: '100%', position: 'relative' }} />;
}