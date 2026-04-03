// ML Pricing Service — Hyper-local dynamic premium calculator
// Simulates a Python/AI microservice with zone-based risk scoring

export interface ZoneRiskProfile {
  zone: string;
  city: string;
  riskScore: number;       // 0-100
  riskLabel: 'Low' | 'Medium' | 'High' | 'Extreme';
  riskColor: string;
  factors: {
    weather: number;       // 0-1 (40% weight)
    floodZone: number;     // 0-1 (25% weight)
    pollution: number;     // 0-1 (20% weight)
    strikeHistory: number; // 0-1 (15% weight)
  };
  seasonFactor: number;    // Zone monthly disruption / annual average
}

export interface DynamicPricing {
  basePremium: number;
  adjustedPremium: number;
  weeklyPremium: number;
  coverageCap: number;
  breakdown: { label: string; impact: 'positive'|'negative'|'neutral'; value: number }[];
}

export interface GScoreParams {
  timeEfficiency: number; // 0-1
  orderVolume: number;    // 0-1
  beforeTimeRate: number; // 0-1
  badWeatherDeliveries: number; // 0-1
  distanceCovered: number; // 0-1
  peakTimeOfDay: number;   // 0-1
}

// Zone risk database (mock — in prod this comes from ML model)
const ZONE_PROFILES: Record<string, ZoneRiskProfile> = {
  'Koramangala': {
    zone: 'Koramangala', city: 'Bengaluru',
    riskScore: 72, riskLabel: 'High', riskColor: '#FF7A45',
    factors: { weather: 0.7, floodZone: 0.8, pollution: 0.6, strikeHistory: 0.3 },
    seasonFactor: 1.15,
  },
  'Bengaluru South': {
    zone: 'Bengaluru South', city: 'Bengaluru',
    riskScore: 78, riskLabel: 'High', riskColor: '#FF3B30',
    factors: { weather: 0.8, floodZone: 0.9, pollution: 0.65, strikeHistory: 0.4 },
    seasonFactor: 1.25,
  },
  'HSR Layout': {
    zone: 'HSR Layout', city: 'Bengaluru',
    riskScore: 55, riskLabel: 'Medium', riskColor: '#FFCC00',
    factors: { weather: 0.5, floodZone: 0.4, pollution: 0.5, strikeHistory: 0.2 },
    seasonFactor: 1.0,
  },
  'Whitefield': {
    zone: 'Whitefield', city: 'Bengaluru',
    riskScore: 42, riskLabel: 'Medium', riskColor: '#FFCC00',
    factors: { weather: 0.4, floodZone: 0.3, pollution: 0.4, strikeHistory: 0.15 },
    seasonFactor: 0.9,
  },
  'Indiranagar': {
    zone: 'Indiranagar', city: 'Bengaluru',
    riskScore: 60, riskLabel: 'Medium', riskColor: '#FFCC00',
    factors: { weather: 0.55, floodZone: 0.5, pollution: 0.55, strikeHistory: 0.25 },
    seasonFactor: 1.05,
  },
  'Electronic City': {
    zone: 'Electronic City', city: 'Bengaluru',
    riskScore: 35, riskLabel: 'Low', riskColor: '#4CD964',
    factors: { weather: 0.4, floodZone: 0.2, pollution: 0.35, strikeHistory: 0.1 },
    seasonFactor: 0.8,
  },
};

const DEFAULT_ZONE: ZoneRiskProfile = {
  zone: 'Your Zone', city: 'Bengaluru',
  riskScore: 60, riskLabel: 'Medium', riskColor: '#FFCC00',
  factors: { weather: 0.5, floodZone: 0.5, pollution: 0.5, strikeHistory: 0.2 },
  seasonFactor: 1.0,
};

export function getZoneProfile(zone: string): ZoneRiskProfile {
  return ZONE_PROFILES[zone] ?? DEFAULT_ZONE;
}

export function getAllZones(): string[] {
  return Object.keys(ZONE_PROFILES);
}

// GScore — strict IJFMR reference weight formula
// GScore = (0.15×Time) + (0.20×Orders) + (0.15×BeforeTime) + (0.15×BadWeather) + (0.20×Distance) + (0.15×TimeOfDay)
export function calculateGScore(params: GScoreParams): { score: number; raw: number; label: string; color: string } {
  const gScoreRaw = 
    (0.15 * params.timeEfficiency) + 
    (0.20 * params.orderVolume) + 
    (0.15 * params.beforeTimeRate) + 
    (0.15 * params.badWeatherDeliveries) + 
    (0.20 * params.distanceCovered) + 
    (0.15 * params.peakTimeOfDay);
  
  const scoreRaw = Math.max(0, Math.min(1, gScoreRaw)); // Clamp between 0 and 1
  const score100 = Math.round(scoreRaw * 100);

  let label = 'Standard';
  let color = '#FFCC00';
  if (scoreRaw >= 0.75) { label = 'Elite'; color = '#4CD964'; }
  else if (scoreRaw >= 0.50) { label = 'Reliable'; color = '#3B82F6'; }
  else if (scoreRaw < 0.30) { label = 'At-Risk'; color = '#FF3B30'; }

  return {
    raw: scoreRaw,
    score: score100,
    label,
    color,
  };
}

// Calculate dynamic weekly premium based on true strict weekly pricing model
export function calculateDynamicPremium(
  zone: string,
  gScoreRaw: number
): DynamicPricing {
  // Strict non-negotiable base
  const BASE_PREMIUM = 35;
  const profile = getZoneProfile(zone);

  // Zone_Risk_Multiplier = weather(40%) + flood_zone(25%) + pollution(20%) + strike_history(15%)
  // Factors are scaled 0-1, so 0.5 average gives a 1.0 multiplier logic, approx it below:
  const z = profile.factors;
  const rawRisk = (0.40 * z.weather) + (0.25 * z.floodZone) + (0.20 * z.pollution) + (0.15 * z.strikeHistory);
  // Scale risk (avg risk 0.5 -> multiplier 1.0, higher -> higher multiplier)
  const zoneRiskMultiplier = 0.5 + rawRisk;

  // GScore_Modifier = 1 - ((GScore - 0.5) * 0.3) -> range 0.85 to 1.15
  const gScoreModifier = 1 - ((gScoreRaw - 0.5) * 0.3);
  
  // Weekly Premium = Base (₹35) × Zone_Risk_Multiplier × Season_Factor × GScore_Modifier
  const calculatedPremium = BASE_PREMIUM * zoneRiskMultiplier * profile.seasonFactor * gScoreModifier;
  
  const finalPremium = Math.max(10, Math.round(calculatedPremium)); // never drop below 10

  const breakdown: DynamicPricing['breakdown'] = [
    { label: 'Weekly Base', impact: 'neutral', value: BASE_PREMIUM },
  ];

  const zoneDiff = Math.round((zoneRiskMultiplier * BASE_PREMIUM) - BASE_PREMIUM);
  if (zoneDiff !== 0) breakdown.push({ label: `Zone Risk (${profile.riskLabel})`, impact: zoneDiff > 0 ? 'negative' : 'positive', value: zoneDiff });

  const seasonDiff = Math.round((profile.seasonFactor * BASE_PREMIUM) - BASE_PREMIUM);
  if (seasonDiff !== 0) breakdown.push({ label: `Season Factor`, impact: seasonDiff > 0 ? 'negative' : 'positive', value: seasonDiff });

  const gScoreDiff = Math.abs(finalPremium - (BASE_PREMIUM + zoneDiff + seasonDiff));
  if (gScoreModifier < 1.0) {
    breakdown.push({ label: `GScore Discount`, impact: 'positive', value: -Math.round(gScoreDiff) });
  } else if (gScoreModifier > 1.0) {
    breakdown.push({ label: `GScore Risk Load`, impact: 'negative', value: Math.round(gScoreDiff) });
  }

  return {
    basePremium: BASE_PREMIUM,
    adjustedPremium: finalPremium,
    weeklyPremium: finalPremium,
    coverageCap: finalPremium * 5, // strict coverage cap: 5x weekly premium
    breakdown,
  };
}
