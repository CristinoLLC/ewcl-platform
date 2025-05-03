// In your AnalysisPage.tsx file:
import { ResultCard, ScientificOutput, AnalysisResult } from '@/components/ScientificUI';

// Then in your JSX:
{entropyValues.length > 0 && aiPrediction !== null && (
  <AnalysisResult 
    entropyValues={entropyValues}
    aiPrediction={aiPrediction}
  />
)}