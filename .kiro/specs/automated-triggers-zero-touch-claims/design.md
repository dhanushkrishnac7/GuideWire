# Design Document: Automated Triggers and Zero-Touch Claims

## Overview

This design specifies an automated parametric insurance system that monitors environmental and social conditions through external APIs and processes claims without worker intervention. The system consists of a trigger engine that continuously evaluates weather and traffic data against predefined thresholds, a claim processor that verifies worker eligibility and executes payouts, and a simulation interface for demonstration purposes.

The architecture follows an event-driven model where external API data triggers claim workflows automatically. Workers receive instant compensation when adverse conditions prevent them from working, eliminating manual claim filing and reducing payout latency from days to seconds.

### Key Design Principles

1. **Zero-Touch Automation**: Claims are detected, verified, and paid without worker action
2. **Parametric Verification**: Objective, measurable thresholds eliminate subjective claim assessment
3. **Real-Time Processing**: Sub-10-second verification and payout execution
4. **Graceful Degradation**: System continues operating during API failures using fallback mechanisms
5. **Simulation-First**: Demo interface allows evaluation without production API dependencies

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  React Native    │              │   Web App        │         │
│  │  App             │              │   (Vite/React)   │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼───────────────────┘
            │                                  │
            └──────────────┬───────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                    Service Layer                                 │
│                          │                                        │
│  ┌───────────────────────▼────────────────────────┐              │
│  │         Trigger Engine Service                 │              │
│  │  - Monitors external APIs (polling)            │              │
│  │  - Evaluates parametric thresholds             │              │
│  │  - Emits trigger events                        │              │
│  └───────────────────┬────────────────────────────┘              │
│                      │                                            │
│                      │ (trigger events)                           │
│                      ▼                                            │
│  ┌──────────────────────────────────────────────┐                │
│  │         Claim Processor Service              │                │
│  │  - Verifies worker eligibility               │                │
│  │  - Creates claim records                     │                │
│  │  - Executes payouts                          │                │
│  └───────────────────┬──────────────────────────┘                │
│                      │                                            │
└──────────────────────┼────────────────────────────────────────────┘
                       │
┌──────────────────────┼────────────────────────────────────────────┐
│              External APIs & Storage                              │
│                      │                                            │
│  ┌──────────────┐   │   ┌──────────────┐   ┌──────────────┐     │
│  │ OpenWeather  │◄──┼──►│ Traffic API  │   │ Local Storage│     │
│  │ Map API      │   │   │ (or Mock)    │   │ (Claims DB)  │     │
│  └──────────────┘   │   └──────────────┘   └──────────────┘     │
│                     │                                             │
│                     ▼                                             │
│            ┌──────────────┐                                       │
│            │  UPI Gateway │                                       │
│            │  (Mock)      │                                       │
│            └──────────────┘                                       │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Monitoring Loop**: Trigger Engine polls OpenWeatherMap and Traffic APIs every 60 seconds
2. **Threshold Evaluation**: Engine compares API data against configured thresholds for each active worker zone
3. **Event Emission**: When threshold exceeded, engine emits trigger event with metadata (type, value, timestamp, location)
4. **Eligibility Check**: Claim Processor verifies worker was online and in affected geofence
5. **Claim Creation**: Processor creates claim record with status APPROVED or REJECTED
6. **Payout Execution**: For approved claims, processor initiates UPI transfer and updates claim status
7. **Notification**: Worker receives push notification with payout details

### Technology Stack

- **Frontend**: React Native (Expo) for mobile, React (Vite) for web
- **State Management**: React hooks (useState, useEffect) with local storage persistence
- **API Integration**: Fetch API with retry logic and exponential backoff
- **Storage**: AsyncStorage (React Native), localStorage (web) for claim history
- **External APIs**: OpenWeatherMap API v2.5, Google Maps Traffic API (or mock)
- **Testing**: Jest for unit tests, fast-check for property-based tests

## Components and Interfaces

### Trigger Engine Service

**Location**: `gig-worker-insurance/src/services/triggerEngine.ts`

**Responsibilities**:
- Poll external APIs at configured intervals
- Evaluate parametric thresholds for each trigger type
- Manage cooldown periods to prevent duplicate triggers
- Emit trigger events to claim processor
- Handle API failures with retry and fallback logic

**Interface**:

```typescript
interface TriggerConfig {
  rainThreshold: number;      // mm/hr (5-20)
  heatThreshold: number;      // °C (38-45)
  trafficThreshold: number;   // km/h (10-20)
  rainPayout: number;         // ₹
  heatPayout: number;         // ₹
  trafficPayout: number;      // ₹
  pollingInterval: number;    // seconds
  cooldownPeriod: number;     // seconds
}

interface TriggerEvent {
  id: string;                 // UUID
  type: 'rain' | 'heat' | 'traffic';
  timestamp: number;          // Unix timestamp
  location: {
    lat: number;
    lon: number;
    zone: string;
  };
  measuredValue: number;
  threshold: number;
  payoutAmount: number;
}

interface TriggerEngineService {
  start(config: TriggerConfig): void;
  stop(): void;
  evaluateTriggers(location: Location): Promise<TriggerEvent[]>;
  getActiveTriggers(): TriggerEvent[];
  simulateTrigger(type: TriggerEvent['type'], location: Location): TriggerEvent;
}
```

**Key Methods**:

- `start()`: Initializes polling loop and loads configuration
- `evaluateTriggers()`: Fetches API data and checks thresholds for a location
- `simulateTrigger()`: Creates mock trigger event for demo purposes (bypasses API)
- `getActiveTriggers()`: Returns currently active triggers within cooldown period

### Claim Processor Service

**Location**: `gig-worker-insurance/src/services/claimProcessor.ts`

**Responsibilities**:
- Verify worker eligibility (online status, geofence match)
- Create claim records with verification audit trail
- Execute payout transactions
- Retry failed payouts with exponential backoff
- Send notifications to workers

**Interface**:

```typescript
interface ClaimRecord {
  id: string;                 // UUID
  workerId: string;
  triggerEvent: TriggerEvent;
  status: 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED';
  verificationSteps: VerificationStep[];
  payoutTransactionId?: string;
  createdAt: number;
  updatedAt: number;
  rejectionReason?: string;
}

interface VerificationStep {
  step: string;
  timestamp: number;
  result: 'pass' | 'fail';
  details: string;
}

interface WorkerContext {
  workerId: string;
  isOnline: boolean;
  currentLocation: { lat: number; lon: number };
  activeZone: string;
  upiId: string;
}

interface ClaimProcessorService {
  processTrigger(event: TriggerEvent, worker: WorkerContext): Promise<ClaimRecord>;
  verifyClaim(event: TriggerEvent, worker: WorkerContext): Promise<VerificationResult>;
  executePayout(claim: ClaimRecord): Promise<PayoutResult>;
  getClaimHistory(workerId: string): Promise<ClaimRecord[]>;
  retryFailedPayout(claimId: string): Promise<PayoutResult>;
}

interface VerificationResult {
  approved: boolean;
  steps: VerificationStep[];
  rejectionReason?: string;
}

interface PayoutResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
```

**Key Methods**:

- `processTrigger()`: Main entry point - orchestrates verification and payout
- `verifyClaim()`: Checks worker online status and geofence match
- `executePayout()`: Initiates UPI transfer (mocked for demo)
- `retryFailedPayout()`: Implements exponential backoff retry logic

### Weather Service (Enhanced)

**Location**: `gig-worker-insurance/src/services/weatherService.ts` (existing, to be enhanced)

**Current State**: Already implements OpenWeatherMap integration with mock fallback

**Enhancements Needed**:
- Add structured error handling with retry logic
- Implement response validation against schema
- Add availability metrics tracking
- Support batch location queries for multiple workers

**New Interface Additions**:

```typescript
interface WeatherServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastSuccessTimestamp: number;
}

interface WeatherService {
  // Existing methods remain
  fetchWeather(lat: number, lon: number): Promise<WeatherData>;
  fetchWeatherByCity(city: string): Promise<WeatherData>;
  
  // New methods
  fetchWeatherBatch(locations: Array<{lat: number; lon: number}>): Promise<WeatherData[]>;
  getMetrics(): WeatherServiceMetrics;
  validateResponse(data: unknown): data is WeatherData;
}
```

### Traffic Service (New)

**Location**: `gig-worker-insurance/src/services/trafficService.ts`

**Responsibilities**:
- Fetch real-time traffic data from Google Maps Traffic API
- Calculate average speed across road segments in geofence
- Provide mock traffic data when API unavailable
- Correlate traffic with weather conditions for mock fallback

**Interface**:

```typescript
interface TrafficData {
  averageSpeed: number;       // km/h
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  affectedSegments: number;
  timestamp: number;
  source: 'api' | 'mock';
}

interface Geofence {
  center: { lat: number; lon: number };
  radiusKm: number;
  zone: string;
}

interface TrafficService {
  fetchTrafficData(geofence: Geofence): Promise<TrafficData>;
  getMockTrafficData(weather: WeatherData): TrafficData;
  getMetrics(): TrafficServiceMetrics;
}
```

**Mock Traffic Logic**:
When Traffic API unavailable, generate mock data based on weather:
- Heavy rain (>10mm/hr): 8-12 km/h average speed
- Moderate rain (5-10mm/hr): 15-20 km/h average speed
- Clear weather: 25-35 km/h average speed
- Heat >40°C: 20-25 km/h (reduced activity)

### Simulation Screen Component

**Location**: 
- `gig-worker-insurance/src/screens/SimulationScreen.tsx` (React Native)
- `web/src/components/SimulationPage.tsx` (Web)

**Responsibilities**:
- Display current trigger status with visual indicators
- Provide manual trigger buttons for each event type
- Show real-time event log with timestamps
- Display explanatory text for AI judges
- Clearly label as demo/simulation mode

**Interface**:

```typescript
interface SimulationScreenProps {
  zone: string;
  onNavigate: (screen: string) => void;
}

interface TriggerSimulationState {
  rain: { active: boolean; value: number; lastTriggered?: number };
  heat: { active: boolean; value: number; lastTriggered?: number };
  traffic: { active: boolean; value: number; lastTriggered?: number };
  eventLog: SimulationEvent[];
}

interface SimulationEvent {
  id: string;
  type: 'rain' | 'heat' | 'traffic';
  timestamp: number;
  value: number;
  payoutAmount: number;
  status: 'triggered' | 'processing' | 'completed';
}
```

**UI Components**:
- Trigger status cards (3 cards: rain, heat, traffic)
- Manual trigger buttons with cooldown indicators
- Real-time event log with auto-scroll
- Explanatory modal with trigger mechanics
- Demo mode banner at top

### Claims Screen (Enhanced)

**Location**: `gig-worker-insurance/src/screens/ClaimsScreen.tsx` (existing, to be enhanced)

**Current State**: Already displays mock claim history and verification steps

**Enhancements Needed**:
- Connect to real claim processor service
- Display live trigger status from trigger engine
- Show cooldown timers for active triggers
- Add filter/sort for claim history
- Display total compensation by trigger type

## Data Models

### Trigger Configuration

Stored in: `gig-worker-insurance/src/config/triggerConfig.json`

```json
{
  "triggers": {
    "rain": {
      "threshold": 10,
      "unit": "mm/hr",
      "minThreshold": 5,
      "maxThreshold": 20,
      "payout": 350,
      "enabled": true
    },
    "heat": {
      "threshold": 40,
      "unit": "°C",
      "minThreshold": 38,
      "maxThreshold": 45,
      "payout": 200,
      "enabled": true
    },
    "traffic": {
      "threshold": 15,
      "unit": "km/h",
      "minThreshold": 10,
      "maxThreshold": 20,
      "payout": 120,
      "enabled": true
    }
  },
  "engine": {
    "pollingIntervalSeconds": 60,
    "cooldownPeriodSeconds": 7200,
    "maxRetries": 3,
    "retryBackoffMs": 1000
  }
}
```

### Claim Record Schema

Stored in: AsyncStorage (React Native) / localStorage (web)

```typescript
interface ClaimRecord {
  id: string;                    // UUID v4
  workerId: string;
  triggerEvent: {
    type: 'rain' | 'heat' | 'traffic';
    timestamp: number;
    location: {
      lat: number;
      lon: number;
      zone: string;
    };
    measuredValue: number;
    threshold: number;
  };
  status: 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED';
  verificationSteps: Array<{
    step: string;
    timestamp: number;
    result: 'pass' | 'fail';
    details: string;
  }>;
  payoutAmount: number;
  payoutTransactionId?: string;
  createdAt: number;
  updatedAt: number;
  rejectionReason?: string;
}
```

**Storage Key**: `claims_history_${workerId}`

**Retention**: 12 months (auto-cleanup on app launch)

### Worker Activity State

Stored in: AsyncStorage (React Native) / localStorage (web)

```typescript
interface WorkerActivityState {
  workerId: string;
  isOnline: boolean;
  currentLocation: {
    lat: number;
    lon: number;
    accuracy: number;
  };
  activeZone: string;
  lastUpdated: number;
  upiId: string;
}
```

**Storage Key**: `worker_activity_${workerId}`

**Update Frequency**: Every 30 seconds when worker is online

### Trigger Cooldown State

Stored in: Memory (service state) + AsyncStorage for persistence

```typescript
interface TriggerCooldownState {
  [triggerType: string]: {
    [workerId: string]: {
      lastTriggered: number;
      cooldownUntil: number;
    };
  };
}
```

**Storage Key**: `trigger_cooldowns`

**Purpose**: Prevent duplicate triggers for same condition within 2-hour window

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Properties 1.3, 4.6, and 5.6 all test that records contain required fields - these can be combined into comprehensive data completeness properties
- Properties 1.4, 2.4, and 3.4 all test payout amounts for specific trigger types - these are distinct and necessary
- Properties 4.1 and 4.2 both test verification logic but for different conditions - both are necessary
- Properties 1.2, 2.2, and 3.2 all test threshold evaluation but for different trigger types - these are distinct patterns and all necessary

All identified properties provide unique validation value and will be retained.

### Property 1: Rain Trigger Activation

*For any* rainfall measurement and configured threshold, when rainfall exceeds the threshold in a worker's active geofence, the trigger engine should activate a rain trigger event.

**Validates: Requirements 1.2**

### Property 2: Heat Trigger Activation Using Feels-Like Temperature

*For any* weather data with feels-like temperature and configured threshold, when feels-like temperature exceeds the threshold, the trigger engine should activate a heat trigger event regardless of actual temperature value.

**Validates: Requirements 2.2, 2.3**

### Property 3: Traffic Trigger Activation

*For any* traffic speed measurement and configured threshold, when average speed drops below the threshold in a worker's active geofence, the trigger engine should activate a traffic trigger event.

**Validates: Requirements 3.2**

### Property 4: Traffic Speed Calculation

*For any* non-empty array of road segment speeds, the calculated average speed should equal the arithmetic mean of all segment speeds.

**Validates: Requirements 3.3**

### Property 5: Rain Trigger Payout Amount

*For any* rain trigger event, the payout amount should equal ₹350.

**Validates: Requirements 1.4**

### Property 6: Heat Trigger Payout Amount

*For any* heat trigger event, the payout amount should equal ₹200.

**Validates: Requirements 2.4**

### Property 7: Traffic Trigger Payout Amount

*For any* traffic trigger event, the payout amount should equal ₹120.

**Validates: Requirements 3.4**

### Property 8: Trigger Event Data Completeness

*For any* trigger event created by the trigger engine, the event should contain measuredValue, timestamp, location, threshold, and payoutAmount fields.

**Validates: Requirements 1.3**

### Property 9: Configuration Threshold Validation

*For any* trigger configuration, all threshold values should be within their defined acceptable ranges (rain: 5-20mm/hr, heat: 38-45°C, traffic: 10-20km/h), and invalid values should be rejected.

**Validates: Requirements 1.5, 2.5, 8.3**

### Property 10: Configuration Payout Validation

*For any* trigger configuration, all payout amounts should be positive numbers, and non-positive values should be rejected.

**Validates: Requirements 8.4**

### Property 11: Offline Worker Claim Rejection

*For any* trigger event and worker context, when the worker's activity status is "offline" at the time of the event, the claim processor should create a claim record with status "REJECTED".

**Validates: Requirements 4.1**

### Property 12: Out-of-Geofence Claim Rejection

*For any* trigger event and worker context, when the worker's GPS location is outside the affected geofence, the claim processor should create a claim record with status "REJECTED" and include a rejection reason.

**Validates: Requirements 4.2, 4.5**

### Property 13: Successful Verification Approval

*For any* trigger event and worker context, when the worker is online and their GPS location is within the affected geofence, the claim processor should create a claim record with status "APPROVED".

**Validates: Requirements 4.4**

### Property 14: Claim Record Audit Trail

*For any* claim record created by the claim processor, the record should contain a verificationSteps array where each step has a timestamp, step name, result, and details.

**Validates: Requirements 4.6**

### Property 15: Approved Claim Payout Initiation

*For any* claim record with status "APPROVED", the claim processor should initiate a payout to the worker's registered UPI account.

**Validates: Requirements 5.1**

### Property 16: Successful Payout Status Update

*For any* claim record where payout execution succeeds, the claim processor should update the claim status to "SUCCESS" and record the transaction ID and timestamp.

**Validates: Requirements 5.3, 5.6**

### Property 17: Failed Payout Retry Logic

*For any* claim record where payout execution fails, the claim processor should retry up to 3 times before updating the claim status to "FAILED".

**Validates: Requirements 5.4**

### Property 18: Successful Payout Notification

*For any* claim record with status "SUCCESS", the claim processor should send a push notification to the worker with payout details.

**Validates: Requirements 5.5**

### Property 19: Independent Trigger Evaluation

*For any* set of weather and traffic conditions that satisfy multiple trigger thresholds simultaneously, the trigger engine should evaluate and activate each trigger type independently without one affecting the others.

**Validates: Requirements 7.1**

### Property 20: Multiple Trigger Claim Creation

*For any* worker and set of multiple trigger events occurring within a 1-hour window, the claim processor should create separate claim records for each trigger event.

**Validates: Requirements 7.2**

### Property 21: Trigger Cooldown Prevention

*For any* trigger type and worker, when a trigger activates and then the same condition occurs again within a 2-hour cooldown period, the trigger engine should not create a duplicate trigger event.

**Validates: Requirements 7.4**

### Property 22: Trigger Cooldown Expiry

*For any* trigger type and worker, when a trigger activates and then the same condition occurs again after the 2-hour cooldown period has expired, the trigger engine should treat it as a new event and create a new trigger event.

**Validates: Requirements 7.5**

### Property 23: API Retry with Exponential Backoff

*For any* OpenWeatherMap API request that fails, the trigger engine should retry the request up to 3 times with exponential backoff before giving up.

**Validates: Requirements 10.1**

### Property 24: Traffic API Fallback to Mock Data

*For any* Traffic API request that fails after all retries, the trigger engine should return mock traffic data correlated with current weather conditions instead of throwing an error.

**Validates: Requirements 3.5, 10.2**

### Property 25: API Response Schema Validation

*For any* API response received from external services, the trigger engine should validate the response against the expected schema and reject malformed data without crashing.

**Validates: Requirements 10.5**



## Error Handling

### API Integration Errors

**OpenWeatherMap API Failures**:
- Retry strategy: 3 attempts with exponential backoff (1s, 2s, 4s)
- Fallback: Use last known good weather data (cached for up to 5 minutes)
- Logging: Record all API failures with timestamp, error message, and retry count
- Alert: Notify system operators when API success rate drops below 95%

**Traffic API Failures**:
- Retry strategy: 3 attempts with exponential backoff (1s, 2s, 4s)
- Fallback: Generate mock traffic data based on weather correlation:
  - Heavy rain (>10mm/hr): 8-12 km/h average speed
  - Moderate rain (5-10mm/hr): 15-20 km/h average speed
  - Clear weather: 25-35 km/h average speed
  - Heat >40°C: 20-25 km/h
- Logging: Record all fallback activations for monitoring
- Source tracking: Mark traffic data with source field ('api' or 'mock')

**Response Validation Errors**:
- Schema validation: Validate all API responses against TypeScript interfaces
- Required fields: Reject responses missing critical fields (temp, rainfall, speed)
- Range validation: Reject responses with impossible values (temp > 60°C, rainfall > 500mm/hr)
- Error handling: Log validation failures and skip the polling cycle
- Graceful degradation: Continue monitoring other locations if one fails

### Payout Processing Errors

**UPI Transfer Failures**:
- Retry strategy: 3 attempts with exponential backoff (2s, 4s, 8s)
- Status tracking: Update claim status to "FAILED" after all retries exhausted
- Manual intervention: Flag failed payouts for manual review
- Worker notification: Send notification explaining payout delay
- Audit trail: Record all retry attempts with timestamps and error messages

**Insufficient Balance Errors**:
- Detection: Check insurance pool balance before initiating payout
- Handling: Mark claim as "PENDING" and queue for processing when funds available
- Notification: Alert system operators of low balance condition
- Worker communication: Inform worker of temporary delay

**Invalid UPI ID Errors**:
- Validation: Verify UPI ID format before payout attempt
- Handling: Mark claim as "FAILED" with specific error reason
- Worker notification: Request worker to update UPI ID in profile
- Retry: Allow manual retry after worker updates UPI ID

### Configuration Errors

**Invalid Threshold Values**:
- Validation: Check all thresholds are within acceptable ranges on config load
- Handling: Reject invalid config and continue using previous valid config
- Logging: Record validation errors with specific field and value
- Alert: Notify system operators of configuration errors

**Missing Configuration File**:
- Detection: Check for config file existence on service startup
- Handling: Use hardcoded default values as fallback
- Logging: Record missing config file event
- Alert: Notify system operators to restore config file

**Malformed JSON**:
- Detection: Catch JSON parse errors on config load
- Handling: Use previous valid config or hardcoded defaults
- Logging: Record parse error with file path
- Alert: Notify system operators of malformed config

### Worker Context Errors

**Missing Location Data**:
- Detection: Check for valid GPS coordinates in worker context
- Handling: Skip trigger evaluation for that worker
- Logging: Record missing location events
- Worker notification: Prompt worker to enable location services

**Stale Location Data**:
- Detection: Check location timestamp is within last 5 minutes
- Handling: Skip trigger evaluation for that worker
- Logging: Record stale location events
- Worker notification: Prompt worker to refresh location

**Invalid Worker ID**:
- Detection: Validate worker ID exists in system
- Handling: Reject trigger event and log error
- Logging: Record invalid worker ID attempts
- Alert: Investigate potential security issue

### Storage Errors

**AsyncStorage/localStorage Failures**:
- Detection: Catch storage write/read errors
- Handling: Continue operation without persistence (in-memory only)
- Logging: Record storage errors
- User impact: Claim history may not persist across app restarts
- Retry: Attempt to write to storage on next successful operation

**Storage Quota Exceeded**:
- Detection: Catch quota exceeded errors on write
- Handling: Trigger automatic cleanup of old claims (>12 months)
- Logging: Record cleanup operations
- Retry: Attempt write again after cleanup

### Simulation Mode Errors

**Invalid Trigger Type**:
- Detection: Validate trigger type is one of 'rain', 'heat', 'traffic'
- Handling: Display error message to user
- Logging: Record invalid simulation attempts
- UI feedback: Highlight invalid input

**Cooldown Active**:
- Detection: Check if trigger is in cooldown period
- Handling: Display cooldown timer to user
- UI feedback: Disable trigger button until cooldown expires
- Logging: Record cooldown prevention events

## Testing Strategy

### Unit Testing

Unit tests will focus on specific examples, edge cases, and error conditions that demonstrate correct behavior. Property-based tests will handle comprehensive input coverage.

**Trigger Engine Tests**:
- Test rain trigger activates when rainfall = 10.1mm (just above threshold)
- Test rain trigger does not activate when rainfall = 9.9mm (just below threshold)
- Test heat trigger uses feels-like temperature, not actual temperature
- Test traffic trigger activates when speed = 14.9km/h (just below threshold)
- Test trigger event contains all required fields (measuredValue, timestamp, location)
- Test cooldown prevents duplicate triggers within 2-hour window
- Test cooldown expires after 2 hours and allows new trigger
- Test configuration validation rejects invalid threshold values
- Test configuration validation rejects negative payout amounts

**Claim Processor Tests**:
- Test claim approved when worker is online and in geofence
- Test claim rejected when worker is offline
- Test claim rejected when worker is outside geofence
- Test claim status updates to SUCCESS after successful payout
- Test claim status updates to FAILED after 3 failed payout attempts
- Test verification steps are recorded with timestamps
- Test notification is sent after successful payout
- Test multiple simultaneous triggers create separate claim records

**Weather Service Tests**:
- Test API retry logic executes 3 times on failure
- Test fallback to cached data when API fails
- Test response validation rejects malformed data
- Test response validation rejects impossible values (temp > 60°C)

**Traffic Service Tests**:
- Test fallback to mock data when API fails
- Test mock data correlates with weather (rain → slow traffic)
- Test average speed calculation for multiple segments
- Test traffic data is marked with source ('api' or 'mock')

**Storage Tests**:
- Test claim records persist to AsyncStorage/localStorage
- Test claim history retrieval returns records sorted by date descending
- Test automatic cleanup removes claims older than 12 months
- Test storage quota exceeded triggers cleanup

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using randomized test data. Each test will run a minimum of 100 iterations.

**Testing Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property test configured with:
```typescript
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // property assertion
  }),
  { numRuns: 100 }
);
```

**Property Test Suite**:

**Property 1: Rain Trigger Activation**
- Generator: Random rainfall values (0-50mm/hr), random thresholds (5-20mm/hr)
- Assertion: rainfall > threshold ⟹ trigger activates
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 1: Rain trigger activation`

**Property 2: Heat Trigger Activation Using Feels-Like Temperature**
- Generator: Random feels-like temps (30-50°C), random actual temps (30-50°C), random thresholds (38-45°C)
- Assertion: feelsLike > threshold ⟹ trigger activates (regardless of actual temp)
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 2: Heat trigger uses feels-like temperature`

**Property 3: Traffic Trigger Activation**
- Generator: Random speeds (0-60km/h), random thresholds (10-20km/h)
- Assertion: speed < threshold ⟹ trigger activates
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 3: Traffic trigger activation`

**Property 4: Traffic Speed Calculation**
- Generator: Random non-empty arrays of segment speeds (0-60km/h)
- Assertion: calculateAverage(speeds) === sum(speeds) / length(speeds)
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 4: Traffic speed calculation`

**Property 5-7: Trigger Payout Amounts**
- Generator: Random trigger events of each type
- Assertion: rain.payout === 350, heat.payout === 200, traffic.payout === 120
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 5-7: Trigger payout amounts`

**Property 8: Trigger Event Data Completeness**
- Generator: Random trigger events
- Assertion: event has measuredValue, timestamp, location, threshold, payoutAmount
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 8: Trigger event data completeness`

**Property 9: Configuration Threshold Validation**
- Generator: Random threshold values (both valid and invalid ranges)
- Assertion: valid ranges accepted, invalid ranges rejected
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 9: Configuration threshold validation`

**Property 10: Configuration Payout Validation**
- Generator: Random payout values (positive, zero, negative)
- Assertion: positive values accepted, non-positive values rejected
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 10: Configuration payout validation`

**Property 11: Offline Worker Claim Rejection**
- Generator: Random trigger events, worker contexts with isOnline=false
- Assertion: claim.status === 'REJECTED'
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 11: Offline worker claim rejection`

**Property 12: Out-of-Geofence Claim Rejection**
- Generator: Random trigger events, worker locations outside geofence
- Assertion: claim.status === 'REJECTED' && claim.rejectionReason exists
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 12: Out-of-geofence claim rejection`

**Property 13: Successful Verification Approval**
- Generator: Random trigger events, worker contexts with isOnline=true and location in geofence
- Assertion: claim.status === 'APPROVED'
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 13: Successful verification approval`

**Property 14: Claim Record Audit Trail**
- Generator: Random claim records
- Assertion: claim.verificationSteps is array && all steps have timestamp, step, result, details
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 14: Claim record audit trail`

**Property 15: Approved Claim Payout Initiation**
- Generator: Random approved claim records
- Assertion: payout function called with worker.upiId and claim.payoutAmount
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 15: Approved claim payout initiation`

**Property 16: Successful Payout Status Update**
- Generator: Random claim records with successful payout
- Assertion: claim.status === 'SUCCESS' && claim.payoutTransactionId exists && claim.updatedAt exists
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 16: Successful payout status update`

**Property 17: Failed Payout Retry Logic**
- Generator: Random claim records with failing payout
- Assertion: payout function called exactly 3 times before status set to 'FAILED'
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 17: Failed payout retry logic`

**Property 18: Successful Payout Notification**
- Generator: Random successful claim records
- Assertion: notification function called with workerId and payout details
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 18: Successful payout notification`

**Property 19: Independent Trigger Evaluation**
- Generator: Random weather/traffic conditions satisfying multiple thresholds
- Assertion: all applicable triggers activate independently
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 19: Independent trigger evaluation`

**Property 20: Multiple Trigger Claim Creation**
- Generator: Random sets of multiple trigger events within 1-hour window
- Assertion: number of claim records === number of trigger events
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 20: Multiple trigger claim creation`

**Property 21: Trigger Cooldown Prevention**
- Generator: Random trigger events occurring twice within 2-hour window
- Assertion: only one trigger event created
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 21: Trigger cooldown prevention`

**Property 22: Trigger Cooldown Expiry**
- Generator: Random trigger events occurring twice with >2-hour gap
- Assertion: two separate trigger events created
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 22: Trigger cooldown expiry`

**Property 23: API Retry with Exponential Backoff**
- Generator: Random API requests that fail
- Assertion: API called exactly 3 times with delays of 1s, 2s, 4s
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 23: API retry with exponential backoff`

**Property 24: Traffic API Fallback to Mock Data**
- Generator: Random traffic API failures with weather data
- Assertion: mock data returned && data.source === 'mock' && speed correlates with weather
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 24: Traffic API fallback to mock data`

**Property 25: API Response Schema Validation**
- Generator: Random malformed API responses (missing fields, wrong types)
- Assertion: validation rejects malformed data && system doesn't crash
- Tag: `Feature: automated-triggers-zero-touch-claims, Property 25: API response schema validation`

### Integration Testing

Integration tests will verify end-to-end workflows across multiple components:

**End-to-End Trigger Flow**:
1. Mock OpenWeatherMap API returns rainfall > threshold
2. Trigger engine detects condition and creates trigger event
3. Claim processor verifies worker eligibility
4. Claim processor creates approved claim record
5. Payout service executes UPI transfer
6. Claim status updates to SUCCESS
7. Worker receives push notification
8. Claim appears in worker's claim history

**Simulation Mode Flow**:
1. User clicks rain trigger button in simulation screen
2. Simulation service creates mock trigger event
3. Claim processor processes trigger normally
4. Payout completes and claim history updates
5. UI displays success message and updates event log

**Multi-Trigger Flow**:
1. Mock APIs return conditions exceeding multiple thresholds
2. Trigger engine creates separate events for rain, heat, and traffic
3. Claim processor creates 3 separate claim records
4. All 3 payouts execute in parallel
5. All 3 claims appear in history with correct amounts

**API Failure Recovery Flow**:
1. Mock OpenWeatherMap API returns 500 error
2. Trigger engine retries 3 times with exponential backoff
3. After 3 failures, engine falls back to cached data
4. System continues monitoring without crashing
5. Error logged for operator review

### Manual Testing Checklist

**Simulation Screen**:
- [ ] All 3 trigger buttons (rain, heat, traffic) are visible
- [ ] Clicking each button creates a trigger event
- [ ] Event log updates in real-time with timestamps
- [ ] Trigger status indicators show active/inactive correctly
- [ ] Current values and thresholds display correctly
- [ ] Explanatory text is clear and understandable
- [ ] "Demo Mode" label is prominently displayed
- [ ] Screen accessible from both React Native app and web

**Claims Screen**:
- [ ] Claim history displays all triggered events
- [ ] Each claim shows correct trigger type icon
- [ ] Payout amounts match trigger type (₹350, ₹200, ₹120)
- [ ] Claim status badges display correctly (SUCCESS, FAILED, REJECTED)
- [ ] Verification steps show timestamps and results
- [ ] Total compensation calculates correctly
- [ ] Claims sorted by date descending

**Error Scenarios**:
- [ ] App handles missing location data gracefully
- [ ] App handles API failures without crashing
- [ ] App displays error messages for failed payouts
- [ ] App recovers from storage quota exceeded
- [ ] App validates configuration on load

### Performance Testing

**Trigger Engine Performance**:
- Polling cycle completes within 5 seconds for 100 active workers
- Threshold evaluation completes within 100ms per worker
- Memory usage remains stable over 24-hour monitoring period

**Claim Processor Performance**:
- Verification completes within 5 seconds per claim
- Payout execution completes within 10 seconds per claim
- Parallel processing of 10 simultaneous claims completes within 15 seconds

**Storage Performance**:
- Claim history retrieval completes within 500ms for 1000 records
- Claim record write completes within 100ms
- Automatic cleanup of old claims completes within 2 seconds

---

**Design Document Status**: Complete and ready for implementation
