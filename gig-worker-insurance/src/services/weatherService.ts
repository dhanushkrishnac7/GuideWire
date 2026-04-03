/**
 * Weather Service - OpenWeatherMap API integration with retry logic and metrics
 * 
 * Provides real-time weather data for trigger evaluation with robust error handling,
 * response validation, and batch query support.
 */

const OWM_KEY = '6cccaedf7127e88c4b9b618f5c775d6e';
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;          // °C
  feelsLike: number;
  humidity: number;
  rainfall1h: number;    // mm in last 1hr
  windSpeed: number;     // m/s
  description: string;
  city: string;
  aqi: number;           // 1-5 scale
  icon: string;
}

export interface WeatherServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastSuccessTimestamp: number;
}

// Service metrics tracking
const metrics: WeatherServiceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageLatency: 0,
  lastSuccessTimestamp: 0,
};

const latencies: number[] = [];

export interface TriggerStatus {
  rain: { active: boolean; value: number; threshold: number; payout: number };
  heat: { active: boolean; value: number; threshold: number; payout: number };
  traffic: { active: boolean; value: number; threshold: number; payout: number };
}

/**
 * Validate API response against expected schema
 * Rejects malformed data and impossible values
 */
export function validateResponse(data: unknown): data is WeatherData {
  if (!data || typeof data !== 'object') return false;
  
  const d = data as any;
  
  // Check required fields exist and have correct types
  if (typeof d.temp !== 'number') return false;
  if (typeof d.feelsLike !== 'number') return false;
  if (typeof d.humidity !== 'number') return false;
  if (typeof d.rainfall1h !== 'number') return false;
  if (typeof d.windSpeed !== 'number') return false;
  if (typeof d.description !== 'string') return false;
  if (typeof d.city !== 'string') return false;
  if (typeof d.aqi !== 'number') return false;
  if (typeof d.icon !== 'string') return false;
  
  // Range validation - reject impossible values
  if (d.temp < -50 || d.temp > 60) return false;
  if (d.feelsLike < -50 || d.feelsLike > 60) return false;
  if (d.humidity < 0 || d.humidity > 100) return false;
  if (d.rainfall1h < 0 || d.rainfall1h > 500) return false;
  if (d.windSpeed < 0 || d.windSpeed > 200) return false;
  if (d.aqi < 1 || d.aqi > 5) return false;
  
  return true;
}

/**
 * Fetch current weather for lat/lon with retry logic and exponential backoff
 * Implements 3 retry attempts with 1s, 2s, 4s delays
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const maxRetries = 3;
  const baseBackoffMs = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      metrics.totalRequests++;

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`${OWM_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`),
        fetch(`${OWM_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`),
      ]);

      if (!weatherRes.ok) {
        throw new Error(`Weather API returned status ${weatherRes.status}`);
      }

      const weather = await weatherRes.json();
      const aqi = await aqiRes.json();

      const weatherData: WeatherData = {
        temp: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        rainfall1h: weather.rain?.['1h'] ?? 0,
        windSpeed: weather.wind?.speed ?? 0,
        description: weather.weather?.[0]?.description ?? 'clear',
        city: weather.name ?? 'Your Zone',
        aqi: aqi.list?.[0]?.main?.aqi ?? 1,
        icon: weather.weather?.[0]?.icon ?? '01d',
      };

      // Validate response
      if (!validateResponse(weatherData)) {
        throw new Error('Invalid weather data: failed schema validation');
      }

      // Update metrics
      const latency = Date.now() - startTime;
      latencies.push(latency);
      if (latencies.length > 100) latencies.shift(); // Keep last 100
      metrics.averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      metrics.successfulRequests++;
      metrics.lastSuccessTimestamp = Date.now();

      return weatherData;

    } catch (error) {
      console.error(`Weather API attempt ${attempt + 1} failed:`, error);

      // If this was the last attempt, fall back to mock data
      if (attempt === maxRetries - 1) {
        metrics.failedRequests++;
        console.warn('Weather API failed after all retries, using mock data');
        return getMockWeather();
      }

      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = baseBackoffMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // Fallback (should never reach here due to return in catch block)
  return getMockWeather();
}

/**
 * Fetch weather by city name with retry logic and exponential backoff
 * Implements 3 retry attempts with 1s, 2s, 4s delays
 */
export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  const maxRetries = 3;
  const baseBackoffMs = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      metrics.totalRequests++;

      const res = await fetch(`${OWM_BASE}/weather?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric`);
      
      if (!res.ok) {
        throw new Error(`Weather API returned status ${res.status}`);
      }

      const weather = await res.json();
      
      if (weather.cod !== 200) {
        throw new Error(`Weather API returned error code ${weather.cod}`);
      }

      const weatherData: WeatherData = {
        temp: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        rainfall1h: weather.rain?.['1h'] ?? 0,
        windSpeed: weather.wind?.speed ?? 0,
        description: weather.weather?.[0]?.description ?? 'clear',
        city: weather.name ?? city,
        aqi: 2,
        icon: weather.weather?.[0]?.icon ?? '01d',
      };

      // Validate response
      if (!validateResponse(weatherData)) {
        throw new Error('Invalid weather data: failed schema validation');
      }

      // Update metrics
      const latency = Date.now() - startTime;
      latencies.push(latency);
      if (latencies.length > 100) latencies.shift();
      metrics.averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      metrics.successfulRequests++;
      metrics.lastSuccessTimestamp = Date.now();

      return weatherData;

    } catch (error) {
      console.error(`Weather API attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        metrics.failedRequests++;
        console.warn('Weather API failed after all retries, using mock data');
        return getMockWeather();
      }

      const backoffMs = baseBackoffMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  return getMockWeather();
}

/**
 * Fetch weather data for multiple locations in batch
 * Processes requests in parallel for efficiency
 */
export async function fetchWeatherBatch(
  locations: Array<{ lat: number; lon: number }>
): Promise<WeatherData[]> {
  // Process all locations in parallel
  const promises = locations.map(loc => fetchWeather(loc.lat, loc.lon));
  return Promise.all(promises);
}

export function getMockWeather(): WeatherData {
  return {
    temp: 38,
    feelsLike: 42,
    humidity: 78,
    rainfall1h: 12.4,
    windSpeed: 3.2,
    description: 'heavy intensity rain',
    city: 'Koramangala',
    aqi: 3,
    icon: '10d',
  };
}

/**
 * Get service metrics for monitoring and alerting
 */
export function getMetrics(): WeatherServiceMetrics {
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

// Evaluate triggers based on weather data
export function evaluateTriggers(weather: WeatherData): TriggerStatus {
  const RAIN_THRESHOLD = 10;    // mm/hr
  const HEAT_THRESHOLD = 38;    // °C
  const TRAFFIC_THRESHOLD = 15; // km/h avg speed (mocked)

  // Mock traffic speed — in real impl would call Google Maps / TomTom
  const mockTrafficSpeed = weather.description.includes('rain') ? 8 : 22;

  return {
    rain: {
      active: weather.rainfall1h >= RAIN_THRESHOLD,
      value: weather.rainfall1h,
      threshold: RAIN_THRESHOLD,
      payout: 350,
    },
    heat: {
      active: weather.temp >= HEAT_THRESHOLD,
      value: weather.temp,
      threshold: HEAT_THRESHOLD,
      payout: 200,
    },
    traffic: {
      active: mockTrafficSpeed <= TRAFFIC_THRESHOLD,
      value: mockTrafficSpeed,
      threshold: TRAFFIC_THRESHOLD,
      payout: 120,
    },
  };
}

export function getTriggerSummary(triggers: TriggerStatus): string[] {
  const active: string[] = [];
  if (triggers.rain.active) active.push(`🌧️ Rain Alert — ${triggers.rain.value.toFixed(1)}mm/hr (threshold: ${triggers.rain.threshold}mm)`);
  if (triggers.heat.active) active.push(`🌡️ Heat Warning — ${triggers.heat.value}°C (threshold: ${triggers.heat.threshold}°C)`);
  if (triggers.traffic.active) active.push(`🚦 Traffic Gridlock — ${triggers.traffic.value}km/h avg speed`);
  return active;
}
