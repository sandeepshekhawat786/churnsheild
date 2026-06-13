from pydantic import BaseModel
from typing import List, Dict


class PredictionResponse(BaseModel):
    prediction: str
    churn_probability: float
    risk_level: str
    top_influencing_factors: List[str]
    recommendations: List[Dict]