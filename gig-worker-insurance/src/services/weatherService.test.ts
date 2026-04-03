/**
 * Unit tests for Weather Service
 * Tests retry logic, batch queries, response validation, and metrics tracking
 */

import {
  fetchWeather,
  fetchWeatherByCity,
  fetchWeatherBatch,
  validateResponse,
  getMetrics,
  resetMetrics,
  shouldAlertLowAvailability,
  getMockWeather,
  WeatherData,
} from './weatherService';

// Mock global fetch
global.fetch = jest.fn();

describe('Weather Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMetrics();
  });

  describe('validateResponse', () => {
    it('should accept valid weather data', () => {
      const validData: WeatherData = {
        temp: 25,
        feelsLike: 27,
        humidity: 60,
        rainfall1h: 5,
        windSpeed: 10,
        description: 'clear sky',
        city: 'Test City',
        aqi: 2,
        icon: '01d',
      };

      expect(validateResponse(validData)).toBe(true);
    });

    it('should reject data with missing fields', () => {
      const invalidData = {
        temp: 25,
        feelsLike: 27,
        // missing other required fields
      };

      expect(validateResponse(invalidData)).toBe(false);
    });

    it('should reject data with wrong types', () => {
      const invalidData = {
        temp: '25', // should be number
        feelsLike: 27,
        humidity: 60,
        rainfall1h: 5,
        windSpeed: 10,
        description: 'clear',
        city: 'Test',
        aqi: 2,
        icon: '01d',
      };

      expect(validateResponse(invalidData)).toBe(false);
    });

    it('should reject impossible temperature values', () => {
      const invalidData: WeatherData = {
        temp: 70, // > 60°C
        feelsLike: 27,
        humidity: 60,
        rainfall1h: 5,
        windSpeed: 10,
        description: 'clear',
        city: 'Test',
        aqi: 2,
        icon: '01d',
      };

      expect(validateResponse(invalidData)).toBe(false);
    });

    it('should reject impossible rainfall values', () => {
      const invalidData: WeatherData = {
        temp: 25,
        feelsLike: 27,
        humidity: 60,
        rainfall1h: 600, // > 500mm/hr
        windSpeed: 10,
        description: 'clear',
        city: 'Test',
        aqi: 2,
        icon: '01d',
      };

      expect(validateResponse(invalidData)).toBe(false);
    });

    it('should reject invalid AQI values', () => {
      const invalidData: WeatherData = {
        temp: 25,
        feelsLike: 27,
        humidity: 60,
        rainfall1h: 5,
        windSpeed: 10,
        description: 'clear',
        city: 'Test',
        aqi: 6, // > 5
        icon: '01d',
      };

      expect(validateResponse(invalidData)).toBe(false);
    });
  });

  describe('fetchWeather', () => {
    it('should fetch weather data successfully on first attempt', async () => {
      const mockWeatherResponse = {
        main: { temp: 25, feels_like: 27, humidity: 60 },
        rain: { '1h': 5 },
        wind: { speed: 10 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        name: 'Test City',
      };

      const mockAqiResponse = {
        list: [{ main: { aqi: 2 } }],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAqiResponse,
        });

      const result = await fetchWeather(12.9716, 77.5946);

      expect(result.temp).toBe(25);
      expect(result.city).toBe('Test City');
      expect(result.rainfall1h).toBe(5);
      expect(getMetrics().successfulRequests).toBe(1);
      expect(getMetrics().totalRequests).toBe(1);
    });

    it('should retry 3 times with exponential backoff on failure', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const promise = fetchWeather(12.9716, 77.5946);

      // Fast-forward through all retries
      await jest.advanceTimersByTimeAsync(1000); // First retry after 1s
      await jest.advanceTimersByTimeAsync(2000); // Second retry after 2s
      await jest.advanceTimersByTimeAsync(4000); // Third retry after 4s

      const result = await promise;

      // Should fall back to mock data
      expect(result).toEqual(getMockWeather());
      expect(global.fetch).toHaveBeenCalledTimes(6); // 3 attempts × 2 calls (weather + aqi)
      expect(getMetrics().failedRequests).toBe(1);

      jest.useRealTimers();
    });

    it('should fall back to mock data after all retries fail', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await fetchWeather(12.9716, 77.5946);

      expect(result).toEqual(getMockWeather());
      expect(getMetrics().failedRequests).toBe(1);
    });

    it('should reject invalid response data', async () => {
      const invalidWeatherResponse = {
        main: { temp: 100, feels_like: 105, humidity: 60 }, // temp > 60°C
        rain: { '1h': 5 },
        wind: { speed: 10 },
        weather: [{ description: 'clear', icon: '01d' }],
        name: 'Test',
      };

      const mockAqiResponse = {
        list: [{ main: { aqi: 2 } }],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => invalidWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAqiResponse,
        });

      const result = await fetchWeather(12.9716, 77.5946);

      // Should fall back to mock data due to validation failure
      expect(result).toEqual(getMockWeather());
    });
  });

  describe('fetchWeatherByCity', () => {
    it('should fetch weather by city name successfully', async () => {
      const mockResponse = {
        cod: 200,
        main: { temp: 30, feels_like: 33, humidity: 70 },
        rain: { '1h': 0 },
        wind: { speed: 5 },
        weather: [{ description: 'sunny', icon: '01d' }],
        name: 'Bangalore',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchWeatherByCity('Bangalore');

      expect(result.temp).toBe(30);
      expect(result.city).toBe('Bangalore');
      expect(getMetrics().successfulRequests).toBe(1);
    });

    it('should retry on failure and fall back to mock data', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await fetchWeatherByCity('InvalidCity');

      expect(result).toEqual(getMockWeather());
      expect(getMetrics().failedRequests).toBe(1);
    });

    it('should handle non-200 response codes', async () => {
      const mockResponse = {
        cod: 404,
        message: 'city not found',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchWeatherByCity('NonExistentCity');

      expect(result).toEqual(getMockWeather());
    });
  });

  describe('fetchWeatherBatch', () => {
    it('should fetch weather for multiple locations in parallel', async () => {
      const mockWeatherResponse = {
        main: { temp: 25, feels_like: 27, humidity: 60 },
        rain: { '1h': 0 },
        wind: { speed: 10 },
        weather: [{ description: 'clear', icon: '01d' }],
        name: 'Test City',
      };

      const mockAqiResponse = {
        list: [{ main: { aqi: 2 } }],
      };

      // Mock responses for weather and AQI calls
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => callCount % 2 === 1 ? mockWeatherResponse : mockAqiResponse,
        });
      });

      const locations = [
        { lat: 12.9716, lon: 77.5946 },
        { lat: 13.0827, lon: 80.2707 },
        { lat: 19.0760, lon: 72.8777 },
      ];

      const results = await fetchWeatherBatch(locations);

      expect(results).toHaveLength(3);
      // Each location makes 1 request (which internally makes 2 API calls)
      expect(getMetrics().totalRequests).toBe(3);
    });

    it('should handle empty location array', async () => {
      const results = await fetchWeatherBatch([]);

      expect(results).toHaveLength(0);
      expect(getMetrics().totalRequests).toBe(0);
    });
  });

  describe('Metrics tracking', () => {
    it('should track successful requests', async () => {
      const mockWeatherResponse = {
        main: { temp: 25, feels_like: 27, humidity: 60 },
        rain: { '1h': 0 },
        wind: { speed: 10 },
        weather: [{ description: 'clear', icon: '01d' }],
        name: 'Test',
      };

      const mockAqiResponse = {
        list: [{ main: { aqi: 2 } }],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAqiResponse,
        });

      await fetchWeather(12.9716, 77.5946);

      const metrics = getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.lastSuccessTimestamp).toBeGreaterThan(0);
    });

    it('should track failed requests', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await fetchWeather(12.9716, 77.5946);

      const metrics = getMetrics();
      expect(metrics.totalRequests).toBe(3); // 3 retry attempts
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
    });

    it('should calculate average latency', async () => {
      const mockWeatherResponse = {
        main: { temp: 25, feels_like: 27, humidity: 60 },
        rain: { '1h': 0 },
        wind: { speed: 10 },
        weather: [{ description: 'clear', icon: '01d' }],
        name: 'Test',
      };

      const mockAqiResponse = {
        list: [{ main: { aqi: 2 } }],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeatherResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAqiResponse,
        });

      await fetchWeather(12.9716, 77.5946);

      const metrics = getMetrics();
      expect(metrics.averageLatency).toBeGreaterThan(0);
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
  });

  describe('shouldAlertLowAvailability', () => {
    it('should return false when no requests made', () => {
      expect(shouldAlertLowAvailability()).toBe(false);
    });

    it('should return true when success rate below 95%', async () => {
      jest.useFakeTimers();

      // Simulate 3 requests with all failures
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(fetchWeather(12.9716, 77.5946));
      }

      // Fast-forward through all retries for all requests
      await jest.advanceTimersByTimeAsync(7000 * 3); // 7s per request × 3 requests

      await Promise.all(promises);

      // Success rate = 0/9 = 0% < 95%
      expect(shouldAlertLowAvailability()).toBe(true);

      jest.useRealTimers();
    });

    it('should return false when success rate above 95%', async () => {
      const mockWeatherResponse = {
        main: { temp: 25, feels_like: 27, humidity: 60 },
        rain: { '1h': 0 },
        wind: { speed: 10 },
        weather: [{ description: 'clear', icon: '01d' }],
        name: 'Test',
      };

      const mockAqiResponse = {
        list: [{ main: { aqi: 2 } }],
      };

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => callCount % 2 === 1 ? mockWeatherResponse : mockAqiResponse,
        });
      });

      // Make 20 successful requests
      for (let i = 0; i < 20; i++) {
        await fetchWeather(12.9716, 77.5946);
      }

      // Success rate = 20/20 = 100% > 95%
      expect(shouldAlertLowAvailability()).toBe(false);
    });
  });
});
