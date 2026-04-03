/**
 * Traffic Service - Google Maps Traffic API integration with weather-correlated mock fallback
 * 
 * Provides real-time traffic data for trigger evaluation. Falls back to mock data
 * when API is unavailable, correlating traffic patterns with weather conditions.
 */

import { WeatherData } from './weatherService';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api';

export interface TrafficData {
  averageSpeed: number;       // km/h
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  affectedSegments: number;
  timestamp: number;
  source: 'api' | 'mock';
}

export interface Geofence {
  center: { lat: number; lon: number };
  radiusKm: number;
  zone: string;
}

export interface TrafficServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastSuccessTimestamp: number;
}

// Service metrics tracking
const metrics: TrafficServiceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageLatency: 0,
  lastSuccessTimestamp: 0,
};

const latencies: number[] = [];

/**
 * Fetch real-time traffic data from Google Maps Traffic API
 * Implements retry logic with exponential backoff (3 attempts)
 * Falls back to mock data if API unavailable
 */
export async function fetchTrafficData(
  geofence: Geofence,
  weather?: WeatherData
): Promise<TrafficData> {
  const maxRetries = 3;
  const baseBackoffMs = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      metrics.totalRequests++;

      // If no API key configured, skip to mock data
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key not configured');
      }

      // Call Google Maps Roads API to get traffic data
      // Note: In production, this would use the Roads API or Distance Matrix API
      // with traffic model to get real-time speed data
      const response = await fetch(
        `${GOOGLE_MAPS_BASE}/directions/json?` +
        `origin=${geofence.center.lat},${geofence.center.lon}&` +
        `destination=${geofence.center.lat + 0.01},${geofence.center.lon + 0.01}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.routes || data.routes.length === 0) {
        throw new Error('Invalid API response: no routes found');
      }

      // Calculate average speed from route legs
      const route = data.routes[0];
      const legs = route.legs || [];
      
      if (legs.length === 0) {
        throw new Error('Invalid API response: no legs found');
      }

      // Extract duration and distance to calculate speed
      const totalDistance = legs.reduce((sum: number, leg: any) => 
        sum + (leg.distance?.value || 0), 0
      ); // meters
      const totalDuration = legs.reduce((sum: number, leg: any) => 
        sum + (leg.duration_in_traffic?.value || leg.duration?.value || 0), 0
      ); // seconds

      if (totalDuration === 0) {
        throw new Error('Invalid API response: zero duration');
      }

      // Calculate average speed in km/h
      const averageSpeed = (totalDistance / 1000) / (totalDuration / 3600);

      // Determine congestion level
      const congestionLevel = getCongestionLevel(averageSpeed);

      // Update metrics
      const latency = Date.now() - startTime;
      latencies.push(latency);
      if (latencies.length > 100) latencies.shift(); // Keep last 100
      metrics.averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      metrics.successfulRequests++;
      metrics.lastSuccessTimestamp = Date.now();

      return {
        averageSpeed: Math.round(averageSpeed * 10) / 10, // Round to 1 decimal
        congestionLevel,
        affectedSegments: legs.length,
        timestamp: Date.now(),
        source: 'api',
      };

    } catch (error) {
      // Log error
      console.error(`Traffic API attempt ${attempt + 1} failed:`, error);

      // If this was the last attempt, fall back to mock data
      if (attempt === maxRetries - 1) {
        metrics.failedRequests++;
        console.warn('Traffic API failed after all retries, using mock data');
        return getMockTrafficData(weather);
      }

      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = baseBackoffMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // Fallback (should never reach here due to return in catch block)
  return getMockTrafficData(weather);
}

/**
 * Generate mock traffic data correlated with weather conditions
 * Used as fallback when Traffic API is unavailable
 * 
 * Correlation patterns:
 * - Heavy rain (>10mm/hr): 8-12 km/h (severe congestion)
 * - Moderate rain (5-10mm/hr): 15-20 km/h (high congestion)
 * - Clear weather: 25-35 km/h (low-medium congestion)
 * - Extreme heat (>40°C): 20-25 km/h (medium congestion, reduced activity)
 */
export function getMockTrafficData(weather?: WeatherData): TrafficData {
  let averageSpeed: number;
  let congestionLevel: 'low' | 'medium' | 'high' | 'severe';

  if (weather) {
    // Correlate with weather conditions
    if (weather.rainfall1h > 10) {
      // Heavy rain - severe congestion
      averageSpeed = 8 + Math.random() * 4; // 8-12 km/h
      congestionLevel = 'severe';
    } else if (weather.rainfall1h > 5) {
      // Moderate rain - high congestion
      averageSpeed = 15 + Math.random() * 5; // 15-20 km/h
      congestionLevel = 'high';
    } else if (weather.temp > 40) {
      // Extreme heat - medium congestion (reduced activity)
      averageSpeed = 20 + Math.random() * 5; // 20-25 km/h
      congestionLevel = 'medium';
    } else {
      // Clear weather - low to medium congestion
      averageSpeed = 25 + Math.random() * 10; // 25-35 km/h
      congestionLevel = averageSpeed < 30 ? 'medium' : 'low';
    }
  } else {
    // No weather data - use neutral mock values
    averageSpeed = 22 + Math.random() * 8; // 22-30 km/h
    congestionLevel = averageSpeed < 25 ? 'medium' : 'low';
  }

  return {
    averageSpeed: Math.round(averageSpeed * 10) / 10, // Round to 1 decimal
    congestionLevel,
    affectedSegments: Math.floor(Math.random() * 5) + 3, // 3-7 segments
    timestamp: Date.now(),
    source: 'mock',
  };
}

/**
 * Determine congestion level based on average speed
 */
function getCongestionLevel(speed: number): 'low' | 'medium' | 'high' | 'severe' {
  if (speed < 10) return 'severe';
  if (speed < 15) return 'high';
  if (speed < 25) return 'medium';
  return 'low';
}

/**
 * Get service metrics for monitoring and alerting
 */
export function getMetrics(): TrafficServiceMetrics {
  return { ...metrics };
}

/**
 * Reset metrics (useful for testing)
 */
export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.successfulRequests = 0;
  metrics.failedRequests = 0;
  metrics.averageLatency = 0;
  metrics.lastSuccessTimestamp = 0;
  latencies.length = 0;
}

/**
 * Check if API availability is below threshold (95%)
 * Returns true if alert should be triggered
 */
export function shouldAlertLowAvailability(): boolean {
  if (metrics.totalRequests === 0) return false;
  const successRate = metrics.successfulRequests / metrics.totalRequests;
  return successRate < 0.95;
}
