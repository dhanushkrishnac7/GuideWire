/**
 * Trigger Engine Service - Core monitoring logic for automated parametric triggers
 * 
 * Monitors external APIs (weather and traffic) at configured intervals and evaluates
 * parametric thresholds. Emits trigger events when conditions are met and manages
 * cooldown periods to prevent duplicate triggers.
 */

import { fetchWeather, WeatherData } from './weatherService';
import { fetchTrafficData, TrafficData, Geofence } from './trafficService';
import { TriggerEvent, WorkerContext } from '../types/triggers';
import triggerConfig from '../config/triggerConfig.json';

interface TriggerEngineConfig {
  pollingIntervalSeconds: number;
  cooldownPeriodSeconds: number;
  maxRetries: number;
  retryBackoffMs: number;
}

interface TriggerThresholds {
  rain: { threshold: number; payout: number; enabled: boolean };
  heat: { threshold: number; payout: number; enabled: boolean };
  traffic: { threshold: number; payout: number; enabled: boolean };
}

interface CooldownState {
  [triggerType: string]: {
    [workerId: string]: {
      lastTriggered: number;
      cooldownUntil: number;
    };
  };
}

// Service state
let pollingInterval: NodeJS.Timeout | null = null;
let isRunning = false;
let config: TriggerEngineConfig;
let thresholds: TriggerThresholds;
const cooldownState: CooldownState = {
  rain: {},
  heat: {},
  traffic: {},
};

// Event listeners for trigger events
type TriggerEventListener = (event: TriggerEvent) => void;
const eventListeners: TriggerEventListener[] = [];

/**
 * Load configuration from triggerConfig.json
 * Validates thresholds and payout amounts
 */
function loadConfiguration(): void {
  // Load engine configuration
  config = {
    pollingIntervalSeconds: triggerConfig.engine.pollingIntervalSeconds,
    cooldownPeriodSeconds: triggerConfig.engine.cooldownPeriodSeconds,
    maxRetries: triggerConfig.engine.maxRetries,
    retryBackoffMs: triggerConfig.engine.retryBackoffMs,
  };

  // Load trigger thresholds
  thresholds = {
    rain: {
      threshold: triggerConfig.triggers.rain.threshold,
      payout: triggerConfig.triggers.rain.payout,
      enabled: triggerConfig.triggers.rain.enabled,
    },
    heat: {
      threshold: triggerConfig.triggers.heat.threshold,
      payout: triggerConfig.triggers.heat.payout,
      enabled: triggerConfig.triggers.heat.enabled,
    },
    traffic: {
      threshold: triggerConfig.triggers.traffic.threshold,
      payout: triggerConfig.triggers.traffic.payout,
      enabled: triggerConfig.triggers.traffic.enabled,
    },
  };

  // Validate configuration
  validateConfiguration();
}

/**
 * Validate configuration values are within acceptable ranges
 * Throws error if validation fails
 */
function validateConfiguration(): void {
  // Validate rain threshold (5-20 mm/hr)
  if (thresholds.rain.threshold < 5 || thresholds.rain.threshold > 20) {
    throw new Error(
      `Invalid rain threshold: ${thresholds.rain.threshold}. Must be between 5 and 20 mm/hr.`
    );
  }

  // Validate heat threshold (38-45°C)
  if (thresholds.heat.threshold < 38 || thresholds.heat.threshold > 45) {
    throw new Error(
      `Invalid heat threshold: ${thresholds.heat.threshold}. Must be between 38 and 45°C.`
    );
  }

  // Validate traffic threshold (10-20 km/h)
  if (thresholds.traffic.threshold < 10 || thresholds.traffic.threshold > 20) {
    throw new Error(
      `Invalid traffic threshold: ${thresholds.traffic.threshold}. Must be between 10 and 20 km/h.`
    );
  }

  // Validate payout amounts are positive
  if (thresholds.rain.payout <= 0) {
    throw new Error(`Invalid rain payout: ${thresholds.rain.payout}. Must be positive.`);
  }
  if (thresholds.heat.payout <= 0) {
    throw new Error(`Invalid heat payout: ${thresholds.heat.payout}. Must be positive.`);
  }
  if (thresholds.traffic.payout <= 0) {
    throw new Error(`Invalid traffic payout: ${thresholds.traffic.payout}. Must be positive.`);
  }
}

/**
 * Start the trigger engine with polling loop
 * Initializes configuration and begins monitoring
 */
export function start(): void {
  if (isRunning) {
    console.warn('Trigger engine is already running');
    return;
  }

  try {
    // Load and validate configuration
    loadConfiguration();

    // Start polling loop
    const intervalMs = config.pollingIntervalSeconds * 1000;
    pollingInterval = setInterval(() => {
      // Polling logic will be triggered by external calls to evaluateTriggers
      // This interval is just to maintain the service heartbeat
    }, intervalMs);

    isRunning = true;
    console.log(
      `Trigger engine started with ${config.pollingIntervalSeconds}s polling interval`
    );
  } catch (error) {
    console.error('Failed to start trigger engine:', error);
    throw error;
  }
}

/**
 * Stop the trigger engine and cleanup resources
 */
export function stop(): void {
  if (!isRunning) {
    console.warn('Trigger engine is not running');
    return;
  }

  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  isRunning = false;
  console.log('Trigger engine stopped');
}

/**
 * Check if a trigger is in cooldown period for a specific worker
 */
function isInCooldown(triggerType: 'rain' | 'heat' | 'traffic', workerId: string): boolean {
  const cooldown = cooldownState[triggerType]?.[workerId];
  if (!cooldown) return false;

  const now = Date.now();
  return now < cooldown.cooldownUntil;
}

/**
 * Set cooldown for a trigger type and worker
 */
function setCooldown(triggerType: 'rain' | 'heat' | 'traffic', workerId: string): void {
  const now = Date.now();
  const cooldownUntil = now + config.cooldownPeriodSeconds * 1000;

  if (!cooldownState[triggerType]) {
    cooldownState[triggerType] = {};
  }

  cooldownState[triggerType][workerId] = {
    lastTriggered: now,
    cooldownUntil,
  };
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a trigger event
 */
function createTriggerEvent(
  type: 'rain' | 'heat' | 'traffic',
  measuredValue: number,
  threshold: number,
  payoutAmount: number,
  location: { lat: number; lon: number; zone: string }
): TriggerEvent {
  return {
    id: generateUUID(),
    type,
    timestamp: Date.now(),
    location,
    measuredValue,
    threshold,
    payoutAmount,
  };
}

/**
 * Emit a trigger event to all registered listeners
 */
function emitTriggerEvent(event: TriggerEvent): void {
  eventListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error('Error in trigger event listener:', error);
    }
  });
}

/**
 * Register a listener for trigger events
 */
export function onTriggerEvent(listener: TriggerEventListener): () => void {
  eventListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  };
}

/**
 * Evaluate triggers for a specific worker location
 * Fetches weather and traffic data, compares against thresholds,
 * and emits trigger events when conditions are met
 * 
 * @param worker - Worker context with location and ID
 * @returns Array of trigger events that were activated
 */
export async function evaluateTriggers(worker: WorkerContext): Promise<TriggerEvent[]> {
  if (!isRunning) {
    throw new Error('Trigger engine is not running. Call start() first.');
  }

  const triggeredEvents: TriggerEvent[] = [];

  try {
    // Fetch weather data
    const weather = await fetchWeather(
      worker.currentLocation.lat,
      worker.currentLocation.lon
    );

    // Fetch traffic data
    const geofence: Geofence = {
      center: worker.currentLocation,
      radiusKm: 5, // 5km radius for geofence
      zone: worker.activeZone,
    };
    const traffic = await fetchTrafficData(geofence, weather);

    // Evaluate rain trigger
    if (thresholds.rain.enabled && !isInCooldown('rain', worker.workerId)) {
      if (weather.rainfall1h >= thresholds.rain.threshold) {
        const event = createTriggerEvent(
          'rain',
          weather.rainfall1h,
          thresholds.rain.threshold,
          thresholds.rain.payout,
          {
            lat: worker.currentLocation.lat,
            lon: worker.currentLocation.lon,
            zone: worker.activeZone,
          }
        );
        triggeredEvents.push(event);
        setCooldown('rain', worker.workerId);
        emitTriggerEvent(event);
        console.log(`Rain trigger activated for worker ${worker.workerId}: ${weather.rainfall1h}mm/hr`);
      }
    }

    // Evaluate heat trigger (using feels-like temperature)
    if (thresholds.heat.enabled && !isInCooldown('heat', worker.workerId)) {
      if (weather.feelsLike >= thresholds.heat.threshold) {
        const event = createTriggerEvent(
          'heat',
          weather.feelsLike,
          thresholds.heat.threshold,
          thresholds.heat.payout,
          {
            lat: worker.currentLocation.lat,
            lon: worker.currentLocation.lon,
            zone: worker.activeZone,
          }
        );
        triggeredEvents.push(event);
        setCooldown('heat', worker.workerId);
        emitTriggerEvent(event);
        console.log(`Heat trigger activated for worker ${worker.workerId}: ${weather.feelsLike}°C`);
      }
    }

    // Evaluate traffic trigger
    if (thresholds.traffic.enabled && !isInCooldown('traffic', worker.workerId)) {
      if (traffic.averageSpeed <= thresholds.traffic.threshold) {
        const event = createTriggerEvent(
          'traffic',
          traffic.averageSpeed,
          thresholds.traffic.threshold,
          thresholds.traffic.payout,
          {
            lat: worker.currentLocation.lat,
            lon: worker.currentLocation.lon,
            zone: worker.activeZone,
          }
        );
        triggeredEvents.push(event);
        setCooldown('traffic', worker.workerId);
        emitTriggerEvent(event);
        console.log(`Traffic trigger activated for worker ${worker.workerId}: ${traffic.averageSpeed}km/h`);
      }
    }
  } catch (error) {
    console.error('Error evaluating triggers:', error);
    // Don't throw - allow monitoring to continue
  }

  return triggeredEvents;
}

/**
 * Simulate a trigger event for demo/testing purposes
 * Bypasses API calls and cooldown checks
 * 
 * @param type - Type of trigger to simulate
 * @param worker - Worker context
 * @returns Simulated trigger event
 */
export function simulateTrigger(
  type: 'rain' | 'heat' | 'traffic',
  worker: WorkerContext
): TriggerEvent {
  // Get threshold and payout for trigger type
  const triggerConfig = thresholds[type];
  
  // Generate a value that exceeds the threshold
  let measuredValue: number;
  switch (type) {
    case 'rain':
      measuredValue = triggerConfig.threshold + 2; // 2mm above threshold
      break;
    case 'heat':
      measuredValue = triggerConfig.threshold + 2; // 2°C above threshold
      break;
    case 'traffic':
      measuredValue = triggerConfig.threshold - 2; // 2km/h below threshold
      break;
  }

  // Create trigger event
  const event = createTriggerEvent(
    type,
    measuredValue,
    triggerConfig.threshold,
    triggerConfig.payout,
    {
      lat: worker.currentLocation.lat,
      lon: worker.currentLocation.lon,
      zone: worker.activeZone,
    }
  );

  // Emit event to listeners
  emitTriggerEvent(event);
  
  console.log(`Simulated ${type} trigger for worker ${worker.workerId}`);
  
  return event;
}

/**
 * Get active triggers (within cooldown period) for a worker
 */
export function getActiveTriggers(workerId: string): Array<{
  type: 'rain' | 'heat' | 'traffic';
  lastTriggered: number;
  cooldownUntil: number;
}> {
  const active: Array<{
    type: 'rain' | 'heat' | 'traffic';
    lastTriggered: number;
    cooldownUntil: number;
  }> = [];

  const triggerTypes: Array<'rain' | 'heat' | 'traffic'> = ['rain', 'heat', 'traffic'];
  
  triggerTypes.forEach((type) => {
    const cooldown = cooldownState[type]?.[workerId];
    if (cooldown && Date.now() < cooldown.cooldownUntil) {
      active.push({
        type,
        lastTriggered: cooldown.lastTriggered,
        cooldownUntil: cooldown.cooldownUntil,
      });
    }
  });

  return active;
}

/**
 * Get current configuration
 */
export function getConfiguration(): {
  engine: TriggerEngineConfig;
  thresholds: TriggerThresholds;
} {
  return {
    engine: { ...config },
    thresholds: { ...thresholds },
  };
}

/**
 * Check if engine is running
 */
export function isEngineRunning(): boolean {
  return isRunning;
}

/**
 * Reset cooldown state (useful for testing)
 */
export function resetCooldowns(): void {
  Object.keys(cooldownState).forEach((type) => {
    cooldownState[type] = {};
  });
}
