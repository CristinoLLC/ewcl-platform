import torch
import numpy as np
from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Dict, Optional

app = FastAPI()

class SequenceRequest(BaseModel):
    sequence: str
    pdb_text: Optional[str] = None

@app.post("/api/runaiinference")
def run_inference(request: SequenceRequest = Body(...)):
    # 1. Extract sequence from request
    sequence = request.sequence
    
    # 2. Set deterministic seeds
    torch.manual_seed(42)
    np.random.seed(42)
    torch.use_deterministic_algorithms(True)
    
    # 3. Run inference with your model
    # Here you would run your actual model
    # For now, just generate dummy values
    scores = [0.1 + 0.8 * (i % 10) / 10 for i in range(len(sequence))]
    
    # 4. Round outputs for stability
    ewcl_map = {str(i + 1): round(score, 4) for i, score in enumerate(scores)}
    
    return {"ai_map": ewcl_map}