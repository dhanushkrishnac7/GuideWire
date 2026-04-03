/**
 * Type definitions for the automated triggers and zero-touch claims system
 */

/**
 * Configuration for trigger thresholds and payout amounts
 */
export interface TriggerConfig {
  rainThreshold: number;      // mm/hr (5-20)
  heatThreshold: number;      // °C (38-45)
  trafficThreshold: number;   // km/h (10-20)
  rainPayout: number;         // ₹
  heatPayout: number;         // ₹
  trafficPayout: number;      // ₹
  pollingInterval: number;    // seconds
  cooldownPeriod: number;     // seconds
}

/**
 * A trigger event created when parametric thresholds are exceeded
 */
export interface TriggerEvent {
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

/**
 * A claim record created when processing a trigger event
 */
export interface ClaimRecord {
  id: string;                    // UUID v4
  workerId: string;
  triggerEvent: TriggerEvent;
  status: 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED' | 'FRAUD_HOLD';
  fraudScore?: number;           // Anti-spoofing score 0-1
  verificationSteps: VerificationStep[];
  payoutTransactionId?: string;
  createdAt: number;
  updatedAt: number;
  rejectionReason?: string;
}

/**
 * Worker context information for claim verification
 */
export interface WorkerContext {
  workerId: string;
  isOnline: boolean;
  currentLocation: { lat: number; lon: number };
  activeZone: string;
  upiId: string;
}

/**
 * A verification step in the claim processing audit trail
 */
export interface VerificationStep {
  step: string;
  timestamp: number;
  result: 'pass' | 'fail';
  details: string;
}

/**
 * Result of a payout execution attempt
 */
export interface PayoutResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
