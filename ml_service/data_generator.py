import pandas as pd
import numpy as np

def generate_synthetic_data(num_records=10000):
    np.random.seed(42)
    
    zones = ["Mumbai_Central", "Bangalore_Koramangala", "Chennai_TNagar", "Delhi_NCR"]
    
    data = []
    
    for _ in range(num_records):
        zone = np.random.choice(zones)
        month = np.random.randint(1, 13)
        
        # Weather risk depends heavily on the month (Monsoon vs Dry)
        if month in [6, 7, 8, 9] and zone in ["Mumbai_Central", "Chennai_TNagar"]:
            weather_risk = np.random.uniform(0.6, 1.0)
        else:
            weather_risk = np.random.uniform(0.0, 0.4)
            
        # Flood risk is correlated to zone and weather
        flood_index = weather_risk * np.random.uniform(0.5, 1.0)
        
        # Pollution is higher in Delhi and high in winter
        if zone == "Delhi_NCR" and month in [10, 11, 12, 1, 2]:
            pollution_index = np.random.uniform(0.7, 1.0)
        else:
            pollution_index = np.random.uniform(0.1, 0.5)
            
        # Strike history is random but slightly higher in some areas
        strike_score = np.random.beta(2, 5) # most values < 0.5
        
        # Base formula from README: 40% weather, 25% flood, 20% pollution, 15% strike
        # We'll add some noise for the ML model to learn instead of a strict 1:1 map
        noise = np.random.normal(0, 0.05)
        raw_multiplier = (
            0.40 * weather_risk +
            0.25 * flood_index +
            0.20 * pollution_index +
            0.15 * strike_score + 
            noise
        )
        
        # Normalize roughly around 0.8 to 1.8 to represent valid risk multipliers
        # Let's say max theoretical is around 1+noise. We map it to [0.8, 1.8]
        zone_risk_multiplier = 0.8 + raw_multiplier
        zone_risk_multiplier = min(max(zone_risk_multiplier, 0.5), 2.5) # clip extremes
        
        data.append({
            "zone_id": zone,
            "month": month,
            "weather_risk_score": round(weather_risk, 3),
            "flood_zone_index": round(flood_index, 3),
            "pollution_index_7day_avg": round(pollution_index, 3),
            "strike_history_score": round(strike_score, 3),
            "zone_risk_multiplier": round(zone_risk_multiplier, 3)
        })
        
    df = pd.DataFrame(data)
    df.to_csv("historical_disruptions.csv", index=False)
    print(f"Generated {num_records} synthetic records and saved to 'historical_disruptions.csv'")

if __name__ == "__main__":
    generate_synthetic_data(10000)
