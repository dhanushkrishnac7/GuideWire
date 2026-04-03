/**
 * Unit tests for Traffic Service
 * 
 * Tests cover:
 * - Mock traffic data generation with weather correlation
 * - Congestion level determination
 * - Metrics tracking
 * - API fallback behavior
 */

import {
  fetchTrafficData,
  getMockTrafficData,
  getMetrics,
  resetMetrics,
  shouldAlertLowAvailability,
  TrafficData,
  Geofence,
} from './trafficService';
import { WeatherData } from './weatherService';

describe('Traffic Service', () => {
  beforeEach(() => {
    resetMetrics();
  });

  describe('getMockTrafficData', () => {
    it('should generate severe congestion during heavy rain (>10mm/hr)', () => {
      const weather: WeatherData = {
        temp: 30,
        feelsLike: 32,
        humidity: 85,
        rainfall1h: 12.5,
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Test City',
        aqi: 2,
        icon: '10d',
      };

      const traffic = getMockTrafficData(weather);

      expect(traffic.averageSpeed).toBeGreaterThanOrEqual(8);
      expect(traffic.averageSpeed).toBeLessThanOrEqual(12);
      expect(traffic.congestionLevel).toBe('severe');
      expect(traffic.source).toBe('mock');
      expect(traffic.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should generate high congestion during moderate rain (5-10mm/hr)', () => {
      const weather: WeatherData = {
        temp: 28,
        feelsLike: 30,
        humidity: 80,
        rainfall1h: 7.5,
        windSpeed: 4,
        description: 'moderate rain',
        city: 'Test City',
        aqi: 2,
        icon: '10d',
      };

      const traffic = getMockTrafficData(weather);

      expect(traffic.averageSpeed).toBeGreaterThanOrEqual(15);
      expect(traffic.averageSpeed).toBeLessThanOrEqual(20);
      expect(traffic.congestionLevel).toBe('high');
      expect(traffic.source).toBe('mock');
    });

    it('should generate medium congestion during extreme heat (>40°C)', () => {
      const weather: WeatherData = {
        temp: 42,
        feelsLike: 45,
        humidity: 40,
        rainfall1h: 0,
        windSpeed: 2,
        description: 'clear sky',
        city: 'Test City',
        aqi: 3,
        icon: '01d',
      };

      const traffic = getMockTrafficData(weather);

      expect(traffic.averageSpeed).toBeGreaterThanOrEqual(20);
      expect(traffic.averageSpeed).toBeLessThanOrEqual(25);
      expect(traffic.congestionLevel).toBe('medium');
      expect(traffic.source).toBe('mock');
    });

    it('should generate low to medium congestion during clear weather', () => {
      const weather: WeatherData = {
        temp: 28,
        feelsLike: 30,
        humidity: 60,
        rainfall1h: 0,
        windSpeed: 3,
        description: 'clear sky',
        city: 'Test City',
        aqi: 2,
        icon: '01d',
      };

      const traffic = getMockTrafficData(weather);

      expect(traffic.averageSpeed).toBeGreaterThanOrEqual(25);
      expect(traffic.averageSpeed).toBeLessThanOrEqual(35);
      expect(['low', 'medium']).toContain(traffic.congestionLevel);
      expect(traffic.source).toBe('mock');
    });

    it('should generate neutral mock data when no weather provided', () => {
      const traffic = getMockTrafficData();

      expect(traffic.averageSpeed).toBeGreaterThanOrEqual(22);
      expect(traffic.averageSpeed).toBeLessThanOrEqual(30);
      expect(['low', 'medium']).toContain(traffic.congestionLevel);
      expect(traffic.source).toBe('mock');
      expect(traffic.affectedSegments).toBeGreaterThanOrEqual(3);
      expect(traffic.affectedSegments).toBeLessThanOrEqual(7);
    });

    it('should include all required fields in traffic data', () => {
      const traffic = getMockTrafficData();

      expect(traffic).toHaveProperty('averageSpeed');
      expect(traffic).toHaveProperty('congestionLevel');
      expect(traffic).toHaveProperty('affectedSegments');
      expect(traffic).toHaveProperty('timestamp');
      expect(traffic).toHaveProperty('source');
      expect(typeof traffic.averageSpeed).toBe('number');
      expect(typeof traffic.timestamp).toBe('number');
    });
  });

  describe('fetchTrafficData', () => {
    it('should fall back to mock data when API key not configured', async () => {
      const geofence: Geofence = {
        center: { lat: 12.9716, lon: 77.5946 },
        radiusKm: 5,
        zone: 'Koramangala',
      };

      const weather: WeatherData = {
        temp: 30,
        feelsLike: 32,
        humidity: 70,
        rainfall1h: 0,
        windSpeed: 3,
        description: 'clear sky',
        city: 'Bangalore',
        aqi: 2,
        icon: '01d',
      };

      const traffic = await fetchTrafficData(geofence, weather);

      // Should return mock data since no API key configured
      expect(traffic.source).toBe('mock');
      expect(traffic.averageSpeed).toBeGreaterThan(0);
      expect(traffic.congestionLevel).toBeDefined();
    });

    it('should update metrics after API call', async () => {
      const geofence: Geofence = {
        center: { lat: 12.9716, lon: 77.5946 },
        radiusKm: 5,
        zone: 'Koramangala',
      };

      await fetchTrafficData(geofence);

      const metrics = getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });
  });

  describe('Metrics tracking', () => {
    it('should track failed requests', async () => {
      const geofence: Geofence = {
        center: { lat: 12.9716, lon: 77.5946 },
        radiusKm: 5,
        zone: 'Koramangala',
      };

      // This will fail and fall back to mock (no API key)
      await fetchTrafficData(geofence);

      const metrics = getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.failedRequests).toBeGreaterThan(0);
    });

    it('should reset metrics correctly', () => {
      resetMetrics();
      const metrics = getMetrics();

      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.averageLatency).toBe(0);
      expect(metrics.lastSuccessTimestamp).toBe(0);
    });

    it('should not alert when no requests made', () => {
      resetMetrics();
      expect(shouldAlertLowAvailability()).toBe(false);
    });

    it('should alert when success rate below 95%', async () => {
      resetMetrics();
      
      // Simulate multiple failed requests
      const geofence: Geofence = {
        center: { lat: 12.9716, lon: 77.5946 },
        radiusKm: 5,
        zone: 'Koramangala',
      };

      // Make 2 requests (all will fail without API key)
      // This is enough to test the alert logic
      await fetchTrafficData(geofence);
      await fetchTrafficData(geofence);

      // Success rate should be 0%, which is < 95%
      expect(shouldAlertLowAvailability()).toBe(true);
    }, 30000); // 30 second timeout for this test
  });

  describe('Edge cases', () => {
    it('should handle zero rainfall correctly', () => {
      const weather: WeatherData = {
        temp: 25,
        feelsLike: 26,
        humidity: 60,
        rainfall1h: 0,
        windSpeed: 2,
        description: 'clear',
        city: 'Test',
        aqi: 1,
        icon: '01d',
      };

      const traffic = getMockTrafficData(weather);
      expect(traffic.averageSpeed).toBeGreaterThan(0);
    });

    it('should handle boundary rainfall values', () => {
      // Exactly 10mm/hr (boundary between moderate and heavy)
      const weather1: WeatherData = {
        temp: 28,
        feelsLike: 30,
        humidity: 80,
        rainfall1h: 10,
        windSpeed: 4,
        description: 'rain',
        city: 'Test',
        aqi: 2,
        icon: '10d',
      };

      const traffic1 = getMockTrafficData(weather1);
      expect(traffic1.congestionLevel).toBe('high');

      // Just over 10mm/hr (heavy rain)
      const weather2: WeatherData = {
        ...weather1,
        rainfall1h: 10.1,
      };

      const traffic2 = getMockTrafficData(weather2);
      expect(traffic2.congestionLevel).toBe('severe');
    });

    it('should handle boundary temperature values', () => {
      // Exactly 40°C (boundary)
      const weather1: WeatherData = {
        temp: 40,
        feelsLike: 42,
        humidity: 40,
        rainfall1h: 0,
        windSpeed: 2,
        description: 'clear',
        city: 'Test',
        aqi: 3,
        icon: '01d',
      };

      const traffic1 = getMockTrafficData(weather1);
      expect(['low', 'medium']).toContain(traffic1.congestionLevel);

      // Just over 40°C (extreme heat)
      const weather2: WeatherData = {
        ...weather1,
        temp: 40.1,
      };

      const traffic2 = getMockTrafficData(weather2);
      expect(traffic2.congestionLevel).toBe('medium');
    });
  });
});
