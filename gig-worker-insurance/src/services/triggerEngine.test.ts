/**
 * Unit tests for Trigger Engine Service
 */

import {
  start,
  stop,
  evaluateTriggers,
  simulateTrigger,
  getActiveTriggers,
  getConfiguration,
  isEngineRunning,
  resetCooldowns,
  onTriggerEvent,
} from './triggerEngine';
import { WorkerContext, TriggerEvent } from '../types/triggers';
import * as weatherService from './weatherService';
import * as trafficService from './trafficService';

// Mock the services
jest.mock('./weatherService');
jest.mock('./trafficService');

const mockFetchWeather = weatherService.fetchWeather as jest.MockedFunction<
  typeof weatherService.fetchWeather
>;
const mockFetchTrafficData = trafficService.fetchTrafficData as jest.MockedFunction<
  typeof trafficService.fetchTrafficData
>;

describe('Trigger Engine Service', () => {
  const mockWorker: WorkerContext = {
    workerId: 'worker-123',
    isOnline: true,
    currentLocation: { lat: 12.9716, lon: 77.5946 },
    activeZone: 'Koramangala',
    upiId: 'worker@upi',
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    resetCooldowns();
    
    // Stop engine if running
    if (isEngineRunning()) {
      stop();
    }
  });

  afterEach(() => {
    // Clean up
    if (isEngineRunning()) {
      stop();
    }
  });

  describe('start() and stop()', () => {
    it('should start the engine successfully', () => {
      expect(isEngineRunning()).toBe(false);
      start();
      expect(isEngineRunning()).toBe(true);
    });

    it('should stop the engine successfully', () => {
      start();
      expect(isEngineRunning()).toBe(true);
      stop();
      expect(isEngineRunning()).toBe(false);
    });

    it('should warn when starting an already running engine', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      start();
      start(); // Try to start again
      expect(consoleSpy).toHaveBeenCalledWith('Trigger engine is already running');
      consoleSpy.mockRestore();
    });

    it('should warn when stopping a non-running engine', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      stop(); // Try to stop when not running
      expect(consoleSpy).toHaveBeenCalledWith('Trigger engine is not running');
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration', () => {
    it('should load configuration from triggerConfig.json', () => {
      start();
      const config = getConfiguration();
      
      expect(config.engine.pollingIntervalSeconds).toBe(60);
      expect(config.engine.cooldownPeriodSeconds).toBe(7200);
      expect(config.thresholds.rain.threshold).toBe(10);
      expect(config.thresholds.heat.threshold).toBe(40);
      expect(config.thresholds.traffic.threshold).toBe(15);
    });

    it('should validate threshold ranges on start', () => {
      // This test verifies that the current config is valid
      expect(() => start()).not.toThrow();
      stop();
    });
  });

  describe('evaluateTriggers()', () => {
    beforeEach(() => {
      start();
    });

    it('should activate rain trigger when rainfall exceeds threshold', async () => {
      // Mock weather data with high rainfall
      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 80,
        rainfall1h: 12, // Above threshold of 10
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Koramangala',
        aqi: 2,
        icon: '10d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25,
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      const events = await evaluateTriggers(mockWorker);
      
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('rain');
      expect(events[0].measuredValue).toBe(12);
      expect(events[0].payoutAmount).toBe(350);
    });

    it('should activate heat trigger when feels-like temperature exceeds threshold', async () => {
      mockFetchWeather.mockResolvedValue({
        temp: 38,
        feelsLike: 42, // Above threshold of 40
        humidity: 60,
        rainfall1h: 0,
        windSpeed: 2,
        description: 'clear sky',
        city: 'Koramangala',
        aqi: 3,
        icon: '01d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25,
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      const events = await evaluateTriggers(mockWorker);
      
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('heat');
      expect(events[0].measuredValue).toBe(42);
      expect(events[0].payoutAmount).toBe(200);
    });

    it('should activate traffic trigger when speed drops below threshold', async () => {
      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 70,
        rainfall1h: 0,
        windSpeed: 3,
        description: 'clear sky',
        city: 'Koramangala',
        aqi: 2,
        icon: '01d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 12, // Below threshold of 15
        congestionLevel: 'high',
        affectedSegments: 5,
        timestamp: Date.now(),
        source: 'api',
      });

      const events = await evaluateTriggers(mockWorker);
      
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('traffic');
      expect(events[0].measuredValue).toBe(12);
      expect(events[0].payoutAmount).toBe(120);
    });

    it('should activate multiple triggers when multiple thresholds exceeded', async () => {
      mockFetchWeather.mockResolvedValue({
        temp: 38,
        feelsLike: 42, // Above heat threshold
        humidity: 80,
        rainfall1h: 15, // Above rain threshold
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Koramangala',
        aqi: 3,
        icon: '10d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 10, // Below traffic threshold
        congestionLevel: 'severe',
        affectedSegments: 8,
        timestamp: Date.now(),
        source: 'mock',
      });

      const events = await evaluateTriggers(mockWorker);
      
      expect(events).toHaveLength(3);
      expect(events.map(e => e.type).sort()).toEqual(['heat', 'rain', 'traffic']);
    });

    it('should not activate triggers when thresholds not exceeded', async () => {
      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 60,
        rainfall1h: 5, // Below threshold
        windSpeed: 3,
        description: 'clear sky',
        city: 'Koramangala',
        aqi: 2,
        icon: '01d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25, // Above threshold
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      const events = await evaluateTriggers(mockWorker);
      
      expect(events).toHaveLength(0);
    });

    it('should throw error if engine not started', async () => {
      stop();
      await expect(evaluateTriggers(mockWorker)).rejects.toThrow(
        'Trigger engine is not running'
      );
    });
  });

  describe('Cooldown Management', () => {
    beforeEach(() => {
      start();
    });

    it('should prevent duplicate triggers within cooldown period', async () => {
      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 80,
        rainfall1h: 12,
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Koramangala',
        aqi: 2,
        icon: '10d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25,
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      // First evaluation - should trigger
      const events1 = await evaluateTriggers(mockWorker);
      expect(events1).toHaveLength(1);
      expect(events1[0].type).toBe('rain');

      // Second evaluation immediately after - should not trigger due to cooldown
      const events2 = await evaluateTriggers(mockWorker);
      expect(events2).toHaveLength(0);
    });

    it('should track active triggers in cooldown', async () => {
      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 80,
        rainfall1h: 12,
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Koramangala',
        aqi: 2,
        icon: '10d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25,
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      await evaluateTriggers(mockWorker);
      
      const activeTriggers = getActiveTriggers(mockWorker.workerId);
      expect(activeTriggers).toHaveLength(1);
      expect(activeTriggers[0].type).toBe('rain');
      expect(activeTriggers[0].cooldownUntil).toBeGreaterThan(Date.now());
    });
  });

  describe('simulateTrigger()', () => {
    it('should create a simulated rain trigger', () => {
      const event = simulateTrigger('rain', mockWorker);
      
      expect(event.type).toBe('rain');
      expect(event.measuredValue).toBeGreaterThan(10); // Above threshold
      expect(event.payoutAmount).toBe(350);
      expect(event.location.zone).toBe('Koramangala');
    });

    it('should create a simulated heat trigger', () => {
      const event = simulateTrigger('heat', mockWorker);
      
      expect(event.type).toBe('heat');
      expect(event.measuredValue).toBeGreaterThan(40); // Above threshold
      expect(event.payoutAmount).toBe(200);
    });

    it('should create a simulated traffic trigger', () => {
      const event = simulateTrigger('traffic', mockWorker);
      
      expect(event.type).toBe('traffic');
      expect(event.measuredValue).toBeLessThan(15); // Below threshold
      expect(event.payoutAmount).toBe(120);
    });
  });

  describe('Event Listeners', () => {
    beforeEach(() => {
      start();
    });

    it('should notify listeners when trigger event occurs', async () => {
      const listener = jest.fn();
      const unsubscribe = onTriggerEvent(listener);

      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 80,
        rainfall1h: 12,
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Koramangala',
        aqi: 2,
        icon: '10d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25,
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      await evaluateTriggers(mockWorker);
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rain',
          measuredValue: 12,
        })
      );

      unsubscribe();
    });

    it('should allow unsubscribing from events', async () => {
      const listener = jest.fn();
      const unsubscribe = onTriggerEvent(listener);
      
      unsubscribe(); // Unsubscribe immediately

      mockFetchWeather.mockResolvedValue({
        temp: 30,
        feelsLike: 32,
        humidity: 80,
        rainfall1h: 12,
        windSpeed: 5,
        description: 'heavy rain',
        city: 'Koramangala',
        aqi: 2,
        icon: '10d',
      });

      mockFetchTrafficData.mockResolvedValue({
        averageSpeed: 25,
        congestionLevel: 'low',
        affectedSegments: 3,
        timestamp: Date.now(),
        source: 'mock',
      });

      await evaluateTriggers(mockWorker);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
