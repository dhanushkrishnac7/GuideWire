from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd
import json
import os

app = FastAPI(title="GigShield ML Service", version="1.0.0")

# Global variables for model and encoders
model = None
zone_classes = None

class PremiumRequest(BaseModel):
    worker_id: str
    zone_id: str
    month: int
    weather_risk_score: float
    flood_zone_index: float
    pollution_index_7day_avg: float
    strike_history_score: float
    g_score: float
    base_premium: float

class PremiumResponse(BaseModel):
    worker_id: str
    weekly_premium: float
    zone_risk_multiplier: float
    g_score_modifier: float
    season_factor: float

@app.on_event("startup")
def load_assets():
    global model, zone_classes
    
    # Load XGBoost model
    model_path = "premium_xgboost_model.json"
    if os.path.exists(model_path):
        model = xgb.XGBRegressor()
        model.load_model(model_path)
    else:
        print(f"Warning: Model not found at {model_path}. Please train the model first.")
        
    # Load LabelEncoder classes
    classes_path = "zone_classes.json"
    if os.path.exists(classes_path):
        with open(classes_path, "r") as f:
            zone_classes = json.load(f)

def get_season_factor(zone_id: str, month: int) -> float:
    # A simplified version of historical_disruption_freq calculation
    if month in [6, 7, 8, 9] and zone_id in ["Mumbai_Central", "Chennai_TNagar"]:
        return 1.60
    elif zone_id == "Delhi_NCR" and month in [10, 11, 12, 1, 2]:
        return 1.40
    return 0.80

@app.post("/predict-premium", response_model=PremiumResponse)
def predict_premium(request: PremiumRequest):
    if model is None or zone_classes is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Train the model first.")
        
    if request.zone_id not in zone_classes:
        raise HTTPException(status_code=400, detail=f"Unknown zone_id: {request.zone_id}")
        
    # 1. Encode zone_id
    zone_id_encoded = zone_classes.index(request.zone_id)
    
    # 2. Prepare features for prediction
    features = pd.DataFrame([{
        'zone_id_encoded': zone_id_encoded,
        'month': request.month,
        'weather_risk_score': request.weather_risk_score,
        'flood_zone_index': request.flood_zone_index,
        'pollution_index_7day_avg': request.pollution_index_7day_avg,
        'strike_history_score': request.strike_history_score
    }])
    
    # 3. Predict Zone Risk Multiplier
    # Extract prediction value
    zone_risk_multiplier = float(model.predict(features)[0])
    
    # Clip multiplier to reasonable ranges just in case
    zone_risk_multiplier = max(0.5, min(zone_risk_multiplier, 3.0))
    
    # 4. Calculate GScore modifier
    # Formula: 1 - ((GScore - 0.5) * 0.3)
    g_score_modifier = 1.0 - ((request.g_score - 0.5) * 0.3)
    g_score_modifier = max(0.85, min(g_score_modifier, 1.15))
    
    # 5. Calculate Season Factor
    season_factor = get_season_factor(request.zone_id, request.month)
    
    # 6. Final Premium Calculation
    weekly_premium = request.base_premium * zone_risk_multiplier * season_factor * g_score_modifier
    
    return PremiumResponse(
        worker_id=request.worker_id,
        weekly_premium=round(weekly_premium, 2),
        zone_risk_multiplier=round(zone_risk_multiplier, 3),
        g_score_modifier=round(g_score_modifier, 3),
        season_factor=round(season_factor, 3)
    )

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
