/**
 * Unit tests for Claim Processor Service
 */

import {
  processTrigger,
  verifyClaim,
  executePayout,
  retryFailedPayout,
  getClaimHistory,
  clearClaimHistory,
  cleanupOldClaims,
} from './claimProcessor';
import { TriggerEvent, WorkerContext, ClaimRecord } from '../types/triggers';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('Claim Processor Service', () => {
  const mockTriggerEvent: TriggerEvent = {
    id: 'trigger-123',
    type: 'rain',
    timestamp: Date.now(),
    location: {
      lat: 12.9716,
      lon: 77.5946,
      zone: 'Koramangala',
    },
    measuredValue: 12.5,
    threshold: 10,
    payoutAmount: 350,
  };

  const mockWorker: WorkerContext = {
    workerId: 'worker-123',
    isOnline: true,
    currentLocation: { lat: 12.9716, lon: 77.5946 },
    activeZone: 'Koramangala',
    upiId: 'worker@upi',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
  });

  describe('verifyClaim()', () => {
    it('should approve claim when worker is online and in geofence', async () => {
      const result = await verifyClaim(mockTriggerEvent, mockWorker);

      expect(result.approved).toBe(true);
      expect(result.rejectionReason).toBeUndefined();
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].step).toBe('online_status_check');
      expect(result.steps[0].result).toBe('pass');
      expect(result.steps[1].step).toBe('geofence_check');
      expect(result.steps[1].result).toBe('pass');
      expect(result.steps[2].step).toBe('zone_check');
      expect(result.steps[2].result).toBe('pass');
    });

    it('should reject claim when worker is offline', async () => {
      const offlineWorker = { ...mockWorker, isOnline: false };
      const result = await verifyClaim(mockTriggerEvent, offlineWorker);

      expect(result.approved).toBe(false);
      expect(result.rejectionReason).toBe('Worker was not online during trigger event');
      expect(result.steps[0].result).toBe('fail');
    });

    it('should reject claim when worker is outside geofence', async () => {
      // Worker location far from trigger location (Mumbai vs Bangalore)
      const farWorker = {
        ...mockWorker,
        currentLocation: { lat: 19.0760, lon: 72.8777 },
      };
      const result = await verifyClaim(mockTriggerEvent, farWorker);

      expect(result.approved).toBe(false);
      expect(result.rejectionReason).toBe('Worker location outside affected geofence');
      expect(result.steps[1].result).toBe('fail');
    });

    it('should reject claim when worker zone does not match trigger zone', async () => {
      const differentZoneWorker = { ...mockWorker, activeZone: 'Whitefield' };
      const result = await verifyClaim(mockTriggerEvent, differentZoneWorker);

      expect(result.approved).toBe(false);
      expect(result.rejectionReason).toBe('Worker zone does not match trigger zone');
      expect(result.steps[2].result).toBe('fail');
    });

    it('should include timestamps in all verification steps', async () => {
      const result = await verifyClaim(mockTriggerEvent, mockWorker);

      result.steps.forEach((step) => {
        expect(step.timestamp).toBeDefined();
        expect(typeof step.timestamp).toBe('number');
        expect(step.timestamp).toBeGreaterThan(0);
      });
    });

    it('should include details in all verification steps', async () => {
      const result = await verifyClaim(mockTriggerEvent, mockWorker);

      result.steps.forEach((step) => {
        expect(step.details).toBeDefined();
        expect(typeof step.details).toBe('string');
        expect(step.details.length).toBeGreaterThan(0);
      });
    });
  });

  describe('executePayout()', () => {
    it('should return success with transaction ID on successful payout', async () => {
      // Mock Math.random to ensure success (> 0.1)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const mockClaim: ClaimRecord = {
        id: 'claim-123',
        workerId: 'worker-123',
        triggerEvent: mockTriggerEvent,
        status: 'APPROVED',
        verificationSteps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = await executePayout(mockClaim);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.transactionId).toMatch(/^UPI_[A-F0-9]{8}$/);
      expect(result.error).toBeUndefined();

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should return failure on unsuccessful payout', async () => {
      // Mock Math.random to ensure failure (<= 0.1)
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      const mockClaim: ClaimRecord = {
        id: 'claim-123',
        workerId: 'worker-123',
        triggerEvent: mockTriggerEvent,
        status: 'APPROVED',
        verificationSteps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = await executePayout(mockClaim);

      expect(result.success).toBe(false);
      expect(result.error).toBe('UPI transaction failed');
      expect(result.transactionId).toBeUndefined();

      jest.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('retryFailedPayout()', () => {
    it('should retry payout up to 3 times on failure', async () => {
      // Mock Math.random to always fail
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      const mockClaim: ClaimRecord = {
        id: 'claim-456',
        workerId: 'worker-123',
        triggerEvent: mockTriggerEvent,
        status: 'APPROVED',
        verificationSteps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock storage to return the claim
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-123',
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockClaim])
      );

      const result = await retryFailedPayout('claim-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payout failed after 3 attempts');

      // Verify claim status was updated to FAILED
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedClaims = JSON.parse(lastCall[1]);
      expect(savedClaims[0].status).toBe('FAILED');

      jest.spyOn(Math, 'random').mockRestore();
    }, 15000); // Increase timeout for retry delays

    it('should succeed on second retry attempt', async () => {
      let attemptCount = 0;
      jest.spyOn(Math, 'random').mockImplementation(() => {
        attemptCount++;
        return attemptCount === 1 ? 0.05 : 0.5; // Fail first, succeed second
      });

      const mockClaim: ClaimRecord = {
        id: 'claim-789',
        workerId: 'worker-123',
        triggerEvent: mockTriggerEvent,
        status: 'APPROVED',
        verificationSteps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-123',
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockClaim])
      );

      const result = await retryFailedPayout('claim-789');

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();

      // Verify claim status was updated to SUCCESS
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedClaims = JSON.parse(lastCall[1]);
      expect(savedClaims[0].status).toBe('SUCCESS');

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);

    it('should return error if claim not found', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

      const result = await retryFailedPayout('nonexistent-claim');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Claim not found');
    });

    it('should return existing transaction if claim already successful', async () => {
      const successfulClaim: ClaimRecord = {
        id: 'claim-success',
        workerId: 'worker-123',
        triggerEvent: mockTriggerEvent,
        status: 'SUCCESS',
        verificationSteps: [],
        payoutTransactionId: 'UPI_EXISTING',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-123',
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([successfulClaim])
      );

      const result = await retryFailedPayout('claim-success');

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('UPI_EXISTING');
    });
  });

  describe('processTrigger()', () => {
    it('should create approved claim and execute payout for eligible worker', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // Ensure payout success

      // Mock getAllKeys and getItem to support getClaimById
      let savedClaims: ClaimRecord[] = [];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-123',
      ]);
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'claims_history_worker-123' && savedClaims.length > 0) {
          return Promise.resolve(JSON.stringify(savedClaims));
        }
        return Promise.resolve(null);
      });
      (AsyncStorage.setItem as jest.Mock).mockImplementation((key, value) => {
        if (key === 'claims_history_worker-123') {
          savedClaims = JSON.parse(value);
        }
        return Promise.resolve();
      });

      const claim = await processTrigger(mockTriggerEvent, mockWorker);

      expect(claim.id).toBeDefined();
      expect(claim.workerId).toBe('worker-123');
      expect(claim.triggerEvent).toEqual(mockTriggerEvent);
      expect(claim.status).toBe('SUCCESS');
      expect(claim.verificationSteps).toHaveLength(3);
      expect(claim.payoutTransactionId).toBeDefined();
      expect(claim.createdAt).toBeDefined();
      expect(claim.updatedAt).toBeDefined();

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);

    it('should create rejected claim for offline worker', async () => {
      const offlineWorker = { ...mockWorker, isOnline: false };

      const claim = await processTrigger(mockTriggerEvent, offlineWorker);

      expect(claim.status).toBe('REJECTED');
      expect(claim.rejectionReason).toBe('Worker was not online during trigger event');
      expect(claim.payoutTransactionId).toBeUndefined();
    });

    it('should create rejected claim for worker outside geofence', async () => {
      const farWorker = {
        ...mockWorker,
        currentLocation: { lat: 19.0760, lon: 72.8777 },
      };

      const claim = await processTrigger(mockTriggerEvent, farWorker);

      expect(claim.status).toBe('REJECTED');
      expect(claim.rejectionReason).toBe('Worker location outside affected geofence');
      expect(claim.payoutTransactionId).toBeUndefined();
    });

    it('should save claim to storage', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      await processTrigger(mockTriggerEvent, mockWorker);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      expect(setItemCalls[0][0]).toBe('claims_history_worker-123');

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);
  });

  describe('getClaimHistory()', () => {
    it('should return empty array when no claims exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const history = await getClaimHistory('worker-123');

      expect(history).toEqual([]);
    });

    it('should return claims sorted by date descending', async () => {
      const now = Date.now();
      const claims: ClaimRecord[] = [
        {
          id: 'claim-1',
          workerId: 'worker-123',
          triggerEvent: { ...mockTriggerEvent, timestamp: now - 3000 },
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: now - 3000,
          updatedAt: now - 3000,
        },
        {
          id: 'claim-2',
          workerId: 'worker-123',
          triggerEvent: { ...mockTriggerEvent, timestamp: now - 1000 },
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: now - 1000,
          updatedAt: now - 1000,
        },
        {
          id: 'claim-3',
          workerId: 'worker-123',
          triggerEvent: { ...mockTriggerEvent, timestamp: now - 2000 },
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: now - 2000,
          updatedAt: now - 2000,
        },
      ];

      // Mock getItem to return the claims - need to override beforeEach mock
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(claims)
      );

      const history = await getClaimHistory('worker-123');

      expect(history).toHaveLength(3);
      // Claims should be sorted by createdAt descending
      expect(history[0].id).toBe('claim-2'); // Most recent
      expect(history[1].id).toBe('claim-3'); // Middle
      expect(history[2].id).toBe('claim-1'); // Oldest
    });

    it('should filter out claims older than 12 months', async () => {
      const now = Date.now();
      const thirteenMonthsAgo = now - 13 * 30 * 24 * 60 * 60 * 1000;
      const elevenMonthsAgo = now - 11 * 30 * 24 * 60 * 60 * 1000;

      const claims: ClaimRecord[] = [
        {
          id: 'claim-old',
          workerId: 'worker-123',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: thirteenMonthsAgo,
          updatedAt: thirteenMonthsAgo,
        },
        {
          id: 'claim-recent',
          workerId: 'worker-123',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: elevenMonthsAgo,
          updatedAt: elevenMonthsAgo,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(claims)
      );

      const history = await getClaimHistory('worker-123');

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('claim-recent');

      // Verify storage was updated to remove old claims
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const history = await getClaimHistory('worker-123');

      expect(history).toEqual([]);
    });
  });

  describe('clearClaimHistory()', () => {
    it('should remove claim history from storage', async () => {
      await clearClaimHistory('worker-123');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        'claims_history_worker-123'
      );
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      // Should not throw
      await expect(clearClaimHistory('worker-123')).resolves.toBeUndefined();
    });
  });

  describe('cleanupOldClaims()', () => {
    it('should remove claims older than 12 months across all workers', async () => {
      const now = Date.now();
      const thirteenMonthsAgo = now - 13 * 30 * 24 * 60 * 60 * 1000;
      const elevenMonthsAgo = now - 11 * 30 * 24 * 60 * 60 * 1000;

      const worker1Claims: ClaimRecord[] = [
        {
          id: 'claim-old-1',
          workerId: 'worker-1',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: thirteenMonthsAgo,
          updatedAt: thirteenMonthsAgo,
        },
        {
          id: 'claim-recent-1',
          workerId: 'worker-1',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: elevenMonthsAgo,
          updatedAt: elevenMonthsAgo,
        },
      ];

      const worker2Claims: ClaimRecord[] = [
        {
          id: 'claim-old-2',
          workerId: 'worker-2',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: thirteenMonthsAgo,
          updatedAt: thirteenMonthsAgo,
        },
        {
          id: 'claim-recent-2',
          workerId: 'worker-2',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: now,
          updatedAt: now,
        },
      ];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-1',
        'claims_history_worker-2',
        'other_key',
      ]);

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'claims_history_worker-1') {
          return Promise.resolve(JSON.stringify(worker1Claims));
        }
        if (key === 'claims_history_worker-2') {
          return Promise.resolve(JSON.stringify(worker2Claims));
        }
        return Promise.resolve(null);
      });

      await cleanupOldClaims();

      // Verify setItem was called for both workers
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);

      // Verify worker-1 claims were cleaned
      const worker1Call = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0] === 'claims_history_worker-1'
      );
      expect(worker1Call).toBeDefined();
      const worker1SavedClaims = JSON.parse(worker1Call[1]);
      expect(worker1SavedClaims).toHaveLength(1);
      expect(worker1SavedClaims[0].id).toBe('claim-recent-1');

      // Verify worker-2 claims were cleaned
      const worker2Call = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0] === 'claims_history_worker-2'
      );
      expect(worker2Call).toBeDefined();
      const worker2SavedClaims = JSON.parse(worker2Call[1]);
      expect(worker2SavedClaims).toHaveLength(1);
      expect(worker2SavedClaims[0].id).toBe('claim-recent-2');
    });

    it('should not update storage if no old claims exist', async () => {
      const now = Date.now();
      const recentClaims: ClaimRecord[] = [
        {
          id: 'claim-recent',
          workerId: 'worker-1',
          triggerEvent: mockTriggerEvent,
          status: 'SUCCESS',
          verificationSteps: [],
          createdAt: now,
          updatedAt: now,
        },
      ];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-1',
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(recentClaims)
      );

      await cleanupOldClaims();

      // setItem should not be called since no cleanup was needed
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      // Should not throw
      await expect(cleanupOldClaims()).resolves.toBeUndefined();
    });

    it('should skip non-claim keys', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-1',
        'user_preferences',
        'app_settings',
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await cleanupOldClaims();

      // getItem should only be called for claim keys
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('claims_history_worker-1');
    });

    it('should handle empty claim arrays', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'claims_history_worker-1',
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await cleanupOldClaims();

      // Should not throw and should not call setItem
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Claim Record Structure', () => {
    it('should create claim with all required fields', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const claim = await processTrigger(mockTriggerEvent, mockWorker);

      // Verify all required fields exist
      expect(claim.id).toBeDefined();
      expect(claim.workerId).toBeDefined();
      expect(claim.triggerEvent).toBeDefined();
      expect(claim.status).toBeDefined();
      expect(claim.verificationSteps).toBeDefined();
      expect(claim.createdAt).toBeDefined();
      expect(claim.updatedAt).toBeDefined();

      // Verify trigger event structure
      expect(claim.triggerEvent.id).toBeDefined();
      expect(claim.triggerEvent.type).toBeDefined();
      expect(claim.triggerEvent.timestamp).toBeDefined();
      expect(claim.triggerEvent.location).toBeDefined();
      expect(claim.triggerEvent.measuredValue).toBeDefined();
      expect(claim.triggerEvent.threshold).toBeDefined();
      expect(claim.triggerEvent.payoutAmount).toBeDefined();

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);

    it('should include verification steps with required fields', async () => {
      const claim = await processTrigger(mockTriggerEvent, mockWorker);

      claim.verificationSteps.forEach((step) => {
        expect(step.step).toBeDefined();
        expect(step.timestamp).toBeDefined();
        expect(step.result).toBeDefined();
        expect(step.details).toBeDefined();
        expect(['pass', 'fail']).toContain(step.result);
      });
    });
  });

  describe('Payout Amounts', () => {
    it('should use correct payout amount for rain trigger', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const rainEvent: TriggerEvent = {
        ...mockTriggerEvent,
        type: 'rain',
        payoutAmount: 350,
      };

      const claim = await processTrigger(rainEvent, mockWorker);

      expect(claim.triggerEvent.payoutAmount).toBe(350);

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);

    it('should use correct payout amount for heat trigger', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const heatEvent: TriggerEvent = {
        ...mockTriggerEvent,
        type: 'heat',
        payoutAmount: 200,
      };

      const claim = await processTrigger(heatEvent, mockWorker);

      expect(claim.triggerEvent.payoutAmount).toBe(200);

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);

    it('should use correct payout amount for traffic trigger', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const trafficEvent: TriggerEvent = {
        ...mockTriggerEvent,
        type: 'traffic',
        payoutAmount: 120,
      };

      const claim = await processTrigger(trafficEvent, mockWorker);

      expect(claim.triggerEvent.payoutAmount).toBe(120);

      jest.spyOn(Math, 'random').mockRestore();
    }, 10000);
  });
});
