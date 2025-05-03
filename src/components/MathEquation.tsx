'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathEquationProps {
  equation: string;
  className?: string;
  block?: boolean;
}

export const MathEquation: React.FC<MathEquationProps> = ({ 
  equation, 
  className = '',
  block = false 
}) => {
  try {
    return block ? (
      <div className={className}>
        <BlockMath math={equation} />
      </div>
    ) : (
      <div className={className}>
        <InlineMath math={equation} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering math equation:', error);
    return <div className="text-red-500">Error rendering equation</div>;
  }
};