/**
 * Claim Processor Service - Verifies worker eligibility and executes payouts
 * 
 * Processes trigger events from the trigger engine, verifies worker eligibility
 * (online status and geofence match), executes payouts, and maintains claim history.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ClaimRecord,
  TriggerEvent,
  WorkerContext,
  VerificationStep,
  PayoutResult
} from '../types/triggers';
import { sendPayoutNotification } from './notificationService';

// Constants
const CLAIM_HISTORY_KEY_PREFIX = 'claims_history_';
const CLAIM_RETENTION_MONTHS = 12;
const PAYOUT_RETRY_ATTEMPTS = 3;
const PAYOUT_RETRY_BASE_DELAY_MS = 2000; // 2 seconds base delay
const GEOFENCE_RADIUS_KM = 5;

/**
 * Result of claim verification
 */
interface VerificationResult {
  approved: boolean;
  steps: VerificationStep[];
  rejectionReason?: string;
  fraudScore?: number;
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
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verify worker eligibility for a claim
 * Checks online status and geofence match
 */
export async function verifyClaim(
  event: TriggerEvent,
  worker: WorkerContext
): Promise<VerificationResult> {
  const steps: VerificationStep[] = [];
  let approved = true;
  let rejectionReason: string | undefined;

  // Step 1: Verify worker is online
  const onlineCheckTimestamp = Date.now();
  if (!worker.isOnline) {
    steps.push({
      step: 'online_status_check',
      timestamp: onlineCheckTimestamp,
      result: 'fail',
      details: `Worker ${worker.workerId} was offline at time of trigger event`,
    });
    approved = false;
    rejectionReason = 'Worker was not online during trigger event';
  } else {
    steps.push({
      step: 'online_status_check',
      timestamp: onlineCheckTimestamp,
      result: 'pass',
      details: `Worker ${worker.workerId} was online at time of trigger event`,
    });
  }

  // Step 2: Verify worker location is within geofence
  const geofenceCheckTimestamp = Date.now();
  const distance = calculateDistance(
    worker.currentLocation.lat,
    worker.currentLocation.lon,
    event.location.lat,
    event.location.lon
  );

  if (distance > GEOFENCE_RADIUS_KM) {
    steps.push({
      step: 'geofence_check',
      timestamp: geofenceCheckTimestamp,
      result: 'fail',
      details: `Worker location (${worker.currentLocation.lat}, ${worker.currentLocation.lon}) is ${distance.toFixed(2)}km from trigger location, exceeds ${GEOFENCE_RADIUS_KM}km radius`,
    });
    approved = false;
    rejectionReason = rejectionReason || 'Worker location outside affected geofence';
  } else {
    steps.push({
      step: 'geofence_check',
      timestamp: geofenceCheckTimestamp,
      result: 'pass',
      details: `Worker location is ${distance.toFixed(2)}km from trigger location, within ${GEOFENCE_RADIUS_KM}km radius`,
    });
  }

  // Step 3: Verify zone match
  const zoneCheckTimestamp = Date.now();
  if (worker.activeZone !== event.location.zone) {
    steps.push({
      step: 'zone_check',
      timestamp: zoneCheckTimestamp,
      result: 'fail',
      details: `Worker active zone '${worker.activeZone}' does not match trigger zone '${event.location.zone}'`,
    });
    approved = false;
    rejectionReason = rejectionReason || 'Worker zone does not match trigger zone';
  } else {
    steps.push({
      step: 'zone_check',
      timestamp: zoneCheckTimestamp,
      result: 'pass',
      details: `Worker active zone '${worker.activeZone}' matches trigger zone`,
    });
  }

  // Step 4: Adversarial Defense & Anti-Spoofing (Isolation Forest sim)
  const fraudCheckTimestamp = Date.now();
  // Simulate Isolation Forest score considering device fingerprint, history, payout vs income, claim frequency
  // Range: <0.3 Auto-approve | 0.3-0.6 24hr hold | >0.6 Reject & flag
  const randomFraudBase = Math.random(); // mock logic
  // Slightly increase fraud score if location distance is borderline (e.g. 4-5km)
  const penalty = distance > 4 ? 0.3 : 0;
  const simulatedFraudScore = Math.min(1.0, randomFraudBase + penalty);

  if (simulatedFraudScore > 0.6) {
    steps.push({
      step: 'adversarial_defense_check',
      timestamp: fraudCheckTimestamp,
      result: 'fail',
      details: `Isolation Forest flagged claim. Score: ${simulatedFraudScore.toFixed(2)} (High Risk)`,
    });
    approved = false;
    rejectionReason = rejectionReason || 'Claim flagged by anti-spoofing model (High Risk)';
  } else if (simulatedFraudScore >= 0.3) {
    steps.push({
      step: 'adversarial_defense_check',
      timestamp: fraudCheckTimestamp,
      result: 'fail',
      details: `Isolation Forest flagged claim. Score: ${simulatedFraudScore.toFixed(2)} (Medium Risk - Hold)`,
    });
    // Not technically "rejected" but we fail it here and rewrite status to FRAUD_HOLD in processTrigger
    approved = false;
    rejectionReason = rejectionReason || `FRAUD_HOLD_24HR - Score: ${simulatedFraudScore.toFixed(2)}`;
  } else {
    steps.push({
      step: 'adversarial_defense_check',
      timestamp: fraudCheckTimestamp,
      result: 'pass',
      details: `Isolation Forest cleared claim. Score: ${simulatedFraudScore.toFixed(2)} (Low Risk)`,
    });
  }

  return {
    approved,
    steps,
    rejectionReason,
    fraudScore: simulatedFraudScore,
  };
}

/**
 * Execute payout to worker's UPI account
 * This is a mock implementation for demo purposes
 */
export async function executePayout(claim: ClaimRecord): Promise<PayoutResult> {
  try {
    // Simulate UPI API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock UPI integration - 90% success rate for demo
    const success = Math.random() > 0.1;

    if (success) {
      const transactionId = `UPI_${generateUUID().substring(0, 8).toUpperCase()}`;
      console.log(
        `Payout successful: ₹${claim.triggerEvent.payoutAmount} to worker ${claim.workerId}, txn: ${transactionId}`
      );
      return {
        success: true,
        transactionId,
      };
    } else {
      console.error(`Payout failed for claim ${claim.id}`);
      return {
        success: false,
        error: 'UPI transaction failed',
      };
    }
  } catch (error) {
    console.error('Error executing payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retry failed payout with exponential backoff
 * Attempts up to 3 times with delays of 2s, 4s, 8s
 */
export async function retryFailedPayout(claimId: string): Promise<PayoutResult> {
  // Retrieve claim from storage
  const claim = await getClaimById(claimId);
  if (!claim) {
    return {
      success: false,
      error: 'Claim not found',
    };
  }

  if (claim.status === 'SUCCESS') {
    return {
      success: true,
      transactionId: claim.payoutTransactionId,
    };
  }

  // Retry with exponential backoff
  for (let attempt = 1; attempt <= PAYOUT_RETRY_ATTEMPTS; attempt++) {
    console.log(`Retry attempt ${attempt}/${PAYOUT_RETRY_ATTEMPTS} for claim ${claimId}`);

    const result = await executePayout(claim);

    if (result.success) {
      // Update claim status to SUCCESS
      claim.status = 'SUCCESS';
      claim.payoutTransactionId = result.transactionId;
      claim.updatedAt = Date.now();
      await saveClaimToStorage(claim);
      return result;
    }

    // Wait before next retry (exponential backoff)
    if (attempt < PAYOUT_RETRY_ATTEMPTS) {
      const delay = PAYOUT_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  claim.status = 'FAILED';
  claim.updatedAt = Date.now();
  await saveClaimToStorage(claim);

  return {
    success: false,
    error: `Payout failed after ${PAYOUT_RETRY_ATTEMPTS} attempts`,
  };
}

/**
 * Save claim record to AsyncStorage
 */
async function saveClaimToStorage(claim: ClaimRecord): Promise<void> {
  try {
    const key = `${CLAIM_HISTORY_KEY_PREFIX}${claim.workerId}`;
    const existingData = await AsyncStorage.getItem(key);
    const claims: ClaimRecord[] = existingData ? JSON.parse(existingData) : [];

    // Update existing claim or add new one
    const existingIndex = claims.findIndex((c) => c.id === claim.id);
    if (existingIndex >= 0) {
      claims[existingIndex] = claim;
    } else {
      claims.push(claim);
    }

    // Sort by createdAt descending
    claims.sort((a, b) => b.createdAt - a.createdAt);

    await AsyncStorage.setItem(key, JSON.stringify(claims));
  } catch (error) {
    console.error('Error saving claim to storage:', error);
    // Continue operation even if storage fails
  }
}

/**
 * Get claim by ID from storage
 */
async function getClaimById(claimId: string): Promise<ClaimRecord | null> {
  try {
    // Search through all worker claim histories
    const allKeys = await AsyncStorage.getAllKeys();
    const claimKeys = allKeys.filter((key) =>
      key.startsWith(CLAIM_HISTORY_KEY_PREFIX)
    );

    for (const key of claimKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const claims: ClaimRecord[] = JSON.parse(data);
        const claim = claims.find((c) => c.id === claimId);
        if (claim) {
          return claim;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error retrieving claim:', error);
    return null;
  }
}

/**
 * Process a trigger event and create a claim
 * Main entry point for claim processing workflow
 */
export async function processTrigger(
  event: TriggerEvent,
  worker: WorkerContext
): Promise<ClaimRecord> {
  console.log(
    `Processing ${event.type} trigger for worker ${worker.workerId}, payout: ₹${event.payoutAmount}`
  );

  // Step 1: Verify worker eligibility
  const verification = await verifyClaim(event, worker);

  let finalStatus: ClaimRecord['status'] = verification.approved ? 'APPROVED' : 'REJECTED';
  if (!verification.approved && verification.rejectionReason?.includes('FRAUD_HOLD_24HR')) {
    finalStatus = 'FRAUD_HOLD';
  }

  // Step 2: Create claim record
  const claim: ClaimRecord = {
    id: generateUUID(),
    workerId: worker.workerId,
    triggerEvent: event,
    status: finalStatus,
    fraudScore: (verification as any).fraudScore,
    verificationSteps: verification.steps,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rejectionReason: verification.rejectionReason,
  };

  // Save initial claim record
  await saveClaimToStorage(claim);

  // Step 3: Execute payout if approved
  if (verification.approved) {
    const payoutResult = await retryFailedPayout(claim.id);

    if (payoutResult.success) {
      // Retrieve updated claim from storage (status is now SUCCESS)
      const updatedClaim = await getClaimById(claim.id);

      if (updatedClaim) {
        // Send notification using notification service
        await sendPayoutNotification(worker.workerId, updatedClaim);
      }

      return updatedClaim || claim;
    }
  } else {
    console.log(
      `Claim ${claim.id} rejected: ${verification.rejectionReason}`
    );
  }

  // Return final claim record (either rejected or failed payout)
  const finalClaim = await getClaimById(claim.id);
  return finalClaim || claim;
}

/**
 * Get claim history for a worker
 * Returns claims sorted by date descending
 */
export async function getClaimHistory(
  workerId: string
): Promise<ClaimRecord[]> {
  try {
    const key = `${CLAIM_HISTORY_KEY_PREFIX}${workerId}`;
    const data = await AsyncStorage.getItem(key);

    if (!data) {
      return [];
    }

    const claims: ClaimRecord[] = JSON.parse(data);

    // Filter out claims older than retention period
    const retentionCutoff = Date.now() - CLAIM_RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000;
    const validClaims = claims.filter((claim) => claim.createdAt >= retentionCutoff);

    // Sort by createdAt descending (most recent first)
    validClaims.sort((a, b) => b.createdAt - a.createdAt);

    // If we filtered any claims, update storage
    if (validClaims.length < claims.length) {
      await AsyncStorage.setItem(key, JSON.stringify(validClaims));
      console.log(
        `Cleaned up ${claims.length - validClaims.length} expired claims for worker ${workerId}`
      );
    }

    return validClaims;
  } catch (error) {
    console.error('Error retrieving claim history:', error);
    return [];
  }
}

/**
 * Clean up old claims across all workers
 * Removes claims older than 12 months from storage
 * Should be called on app launch and daily thereafter
 */
export async function cleanupOldClaims(): Promise<void> {
  try {
    const retentionCutoff = Date.now() - CLAIM_RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000;
    const allKeys = await AsyncStorage.getAllKeys();
    const claimKeys = allKeys.filter((key) =>
      key.startsWith(CLAIM_HISTORY_KEY_PREFIX)
    );

    let totalCleaned = 0;

    for (const key of claimKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const claims: ClaimRecord[] = JSON.parse(data);
        const validClaims = claims.filter((claim) => claim.createdAt >= retentionCutoff);

        if (validClaims.length < claims.length) {
          await AsyncStorage.setItem(key, JSON.stringify(validClaims));
          totalCleaned += claims.length - validClaims.length;
        }
      }
    }

    if (totalCleaned > 0) {
      console.log(`Cleanup completed: removed ${totalCleaned} expired claims`);
    }
  } catch (error) {
    console.error('Error during claim cleanup:', error);
  }
}

/**
 * Clear all claim history (for testing purposes)
 */
export async function clearClaimHistory(workerId: string): Promise<void> {
  try {
    const key = `${CLAIM_HISTORY_KEY_PREFIX}${workerId}`;
    await AsyncStorage.removeItem(key);
    console.log(`Cleared claim history for worker ${workerId}`);
  } catch (error) {
    console.error('Error clearing claim history:', error);
  }
}
