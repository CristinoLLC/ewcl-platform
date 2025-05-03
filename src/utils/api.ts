import axios from 'axios';

// Make this a configuration variable so it's easy to change
export const API_BASE_URL = 'https://ewcl-platform.onrender.com';

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout - server can be slow to start
});

/**
 * Run AI inference with enhanced error handling
 */
export async function runAIInference(features: {
  score: number;
  avgEntropy: number;
  minEntropy: number;
  maxEntropy: number;
}) {
  console.log("Running AI inference with features:", features);
  
  try {
    const response = await apiClient.post('/runaiinference', features);
    console.log("AI API response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("❌ AI Inference API Error:", error);
    
    if (error.response) {
      console.error("API error status:", error.response.status);
      console.error("API error data:", error.response.data);
      throw new Error(`API error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error("No response received from API");
      throw new Error("No response received from API. The server might be down.");
    } else {
      console.error("Request setup error:", error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Upload a PDB or JSON file for analysis
 */
export async function uploadFileForAnalysis(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await apiClient.post('/runaiinference', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("File Upload API Error:", error);
    throw error;
  }
}

/**
 * Run EWCL calculation on a protein sequence
 */
export async function runEWCL(sequence: string) {
  try {
    const response = await apiClient.post('/runeucl', { sequence });
    return response.data;
  } catch (error) {
    console.error("EWCL API Error:", error);
    throw error;
  }
}

/**
 * Run EWCL calculation on a protein sequence with improved error handling
 */
export async function runRealEWCL(sequence: string) {
  console.log(`Calling EWCL API with ${sequence.length} residue sequence`);
  
  try {
    const response = await apiClient.post('/runeucl', { 
      sequence 
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("EWCL API response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("❌ EWCL API error:", error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API error status:", error.response.status);
      console.error("API error data:", error.response.data);
      throw new Error(`API error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from API");
      throw new Error("No response received from API. The server might be down.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

/**
 * Check API health status
 */
export async function checkApiHealth() {
  try {
    // Try a simple endpoint call
    const response = await axios.get(`${API_BASE_URL}`, { 
      timeout: 5000 // Short timeout for health check
    });
    
    return {
      status: 'online',
      message: response.data
    };
  } catch (error) {
    console.log("API health check failed:", error);
    return {
      status: 'offline',
      error: error
    };
  }
}

// Example usage (non-JSX code is fine)
export async function analyzeProteinSequence(sequence: string) {
  try {
    const result = await runEWCL(sequence);
    
    // Convert to array if needed
    const entropyArray = Object.values(result);
    
    // Calculate average entropy
    const avgEntropy = entropyArray.reduce((sum, val) => sum + val, 0) / entropyArray.length;
    
    return {
      result,
      entropyArray,
      avgEntropy
    };
  } catch (error) {
    console.error("EWCL analysis failed:", error);
    throw error;
  }
}