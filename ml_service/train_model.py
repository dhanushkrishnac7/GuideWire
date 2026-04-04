import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error
import json
import joblib

def train_and_save_model():
    print("Loading synthetic data...")
    df = pd.read_csv("historical_disruptions.csv")
    
    # We need to encode the categorical zone_id
    label_encoder = LabelEncoder()
    df['zone_id_encoded'] = label_encoder.fit_transform(df['zone_id'])
    
    # Save the label encoder classes to use during inference
    with open('zone_classes.json', 'w') as f:
        json.dump(list(label_encoder.classes_), f)
        
    features = [
        'zone_id_encoded', 
        'month', 
        'weather_risk_score', 
        'flood_zone_index', 
        'pollution_index_7day_avg', 
        'strike_history_score'
    ]
    target = 'zone_risk_multiplier'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Regressor model...")
    # Initialize XGBRegressor
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    mae = mean_absolute_error(y_test, predictions)
    
    print(f"Model Evaluation - MSE: {mse:.4f}, MAE: {mae:.4f}")
    
    # Save model and artifacts
    model_path = "premium_xgboost_model.json"
    model.save_model(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
