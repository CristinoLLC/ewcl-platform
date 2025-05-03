import json
import requests
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional

app = FastAPI()

# Load benchmarks at startup
with open("data/benchmarks.json") as f:
    BENCHMARKS = json.load(f)

# Original model code
class SequenceRequest(BaseModel):
    sequence: str
    pdb_text: Optional[str] = None

@app.post("/api/runaiinference")
def run_inference(request: SequenceRequest):
    # Set deterministic seeds
    np.random.seed(42)
    
    # Generate mockup scores (replace with actual model in production)
    sequence = request.sequence
    scores = [0.1 + 0.8 * (i % 10) / 10 for i in range(len(sequence))]
    
    # Round outputs for stability
    ewcl_map = {str(i + 1): round(score, 4) for i, score in enumerate(scores)}
    
    return {"ai_map": ewcl_map}

# New benchmark endpoints
@app.get("/api/benchmarks")
def list_benchmarks():
    """
    Return list of { pdb_id, name, disprot } for user to pick from.
    """
    return BENCHMARKS

def fetch_reference_disorder(disprot_id: str) -> List[float]:
    """
    Pull per-residue disorder profile from MobiDB/PDBe.
    Return a flat [0.0-1.0] list in residue order.
    """
    url = f"https://www.ebi.ac.uk/pdbe/api/mobidb/{disprot_id}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Extract disorder predictions from MobiDB data
        predictions = data[disprot_id]["mobidb_annotations"]["disorder"]["predictions"]
        if not predictions:
            return []
            
        profile = predictions[0]["data"]
        return [float(d["value"]) for d in sorted(profile, key=lambda d: d["resi"])]
    except Exception as e:
        print(f"Error fetching disorder data for {disprot_id}: {e}")
        return []

def fetch_sequence_from_pdb(pdb_id: str) -> str:
    """
    Fetch sequence from PDB API
    """
    url = f"https://data.rcsb.org/rest/v1/core/entry/{pdb_id.lower()}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Extract sequence from PDB data
        return data.get("entity", [{}])[0].get("pdbx_seq_one_letter_code", "")
    except Exception as e:
        print(f"Error fetching sequence for {pdb_id}: {e}")
        return ""

def run_ewcl_model(sequence: str) -> List[float]:
    """
    Run EWCL model on sequence
    """
    # Setting fixed seed for reproducibility
    np.random.seed(42)
    
    # This is a mockup - replace with actual model call
    # In production, you would call your actual EWCL model
    return [0.1 + 0.8 * (i % 10) / 10 for i in range(len(sequence))]

def calculate_pearson(a: List[float], b: List[float]) -> float:
    """
    Calculate Pearson correlation
    """
    if len(a) != len(b) or len(a) == 0:
        return 0.0
        
    a_mean = sum(a) / len(a)
    b_mean = sum(b) / len(b)
    
    numerator = sum((x - a_mean) * (y - b_mean) for x, y in zip(a, b))
    denom_a = sum((x - a_mean) ** 2 for x in a) ** 0.5
    denom_b = sum((y - b_mean) ** 2 for y in b) ** 0.5
    
    if denom_a == 0 or denom_b == 0:
        return 0.0
        
    return numerator / (denom_a * denom_b)

def calculate_rmse(a: List[float], b: List[float]) -> float:
    """
    Calculate RMSE
    """
    if len(a) != len(b) or len(a) == 0:
        return 0.0
    
    return (sum((x - y) ** 2 for x, y in zip(a, b)) / len(a)) ** 0.5

@app.get("/api/validate/{pdb_id}")
def validate_against_reference(pdb_id: str):
    """
    Validate EWCL predictions against reference disorder data
    """
    # Look up DisProt ID
    benchmark = next((b for b in BENCHMARKS if b["pdb_id"].lower() == pdb_id.lower()), None)
    if not benchmark:
        return {"error": f"No benchmark found for PDB ID {pdb_id}"}
    
    disprot_id = benchmark["disprot"]
    
    # Get sequence from PDB
    sequence = fetch_sequence_from_pdb(pdb_id)
    if not sequence:
        return {"error": f"Could not fetch sequence for PDB ID {pdb_id}"}
    
    # Run EWCL model
    ewcl_scores = run_ewcl_model(sequence)
    
    # Fetch reference disorder data
    ref_scores = fetch_reference_disorder(disprot_id)
    if not ref_scores:
        return {"error": f"Could not fetch reference data for DisProt ID {disprot_id}"}
    
    # Ensure same length for comparison
    min_length = min(len(ewcl_scores), len(ref_scores))
    ewcl_scores = ewcl_scores[:min_length]
    ref_scores = ref_scores[:min_length]
    
    # Calculate metrics
    pearson = calculate_pearson(ewcl_scores, ref_scores)
    rmse = calculate_rmse(ewcl_scores, ref_scores)
    
    return {
        "pdb_id": pdb_id,
        "disprot_id": disprot_id,
        "name": benchmark["name"],
        "r": pearson,
        "rmse": rmse,
        "our": ewcl_scores,
        "ref": ref_scores
    }