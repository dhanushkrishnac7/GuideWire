/**
 * Unit tests for Notification Service
 */

import { sendPayoutNotification, sendNotification } from './notificationService';
import { ClaimRecord, TriggerEvent } from '../types/triggers';

describe('Notification Service', () => {
  describe('sendPayoutNotification', () => {
    it('should send notification for successful payout', async () => {
      // Arrange
      const mockTriggerEvent: TriggerEvent = {
        id: 'trigger-123',
        type: 'rain',
        timestamp: Date.now(),
        location: {
          lat: 12.9716,
          lon: 77.5946,
          zone: 'Bangalore Central',
        },
        measuredValue: 15.5,
        threshold: 10,
        payoutAmount: 350,
      };

      const mockClaim: ClaimRecord = {
        id: 'claim-123',
        workerId: 'worker-456',
        triggerEvent: mockTriggerEvent,
        status: 'SUCCESS',
        verificationSteps: [],
        payoutTransactionId: 'UPI_ABC123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Act
      const result = await sendPayoutNotification('worker-456', mockClaim);

      // Assert
      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
      expect(result.notificationId).toMatch(/^NOTIF_/);
      expect(result.error).toBeUndefined();
    });

    it('should fail when worker ID is missing', async () => {
      // Arrange
      const mockClaim: ClaimRecord = {
        id: 'claim-123',
        workerId: 'worker-456',
        triggerEvent: {
          id: 'trigger-123',
          type: 'heat',
          timestamp: Date.now(),
          location: { lat: 12.9716, lon: 77.5946, zone: 'Bangalore Central' },
          measuredValue: 42,
          threshold: 40,
          payoutAmount: 200,
        },
        status: 'SUCCESS',
        verificationSteps: [],
        payoutTransactionId: 'UPI_XYZ789',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Act
      const result = await sendPayoutNotification('', mockClaim);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Worker ID is required');
      expect(result.notificationId).toBeUndefined();
    });

    it('should fail when claim status is not SUCCESS', async () => {
      // Arrange
      const mockClaim: ClaimRecord = {
        id: 'claim-123',
        workerId: 'worker-456',
        triggerEvent: {
          id: 'trigger-123',
          type: 'traffic',
          timestamp: Date.now(),
          location: { lat: 12.9716, lon: 77.5946, zone: 'Bangalore Central' },
          measuredValue: 12,
          threshold: 15,
          payoutAmount: 120,
        },
        status: 'APPROVED',
        verificationSteps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Act
      const result = await sendPayoutNotification('worker-456', mockClaim);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Can only send notifications for successful payouts');
      expect(result.notificationId).toBeUndefined();
    });

    it('should fail when transaction ID is missing', async () => {
      // Arrange
      const mockClaim: ClaimRecord = {
        id: 'claim-123',
        workerId: 'worker-456',
        triggerEvent: {
          id: 'trigger-123',
          type: 'rain',
          timestamp: Date.now(),
          location: { lat: 12.9716, lon: 77.5946, zone: 'Bangalore Central' },
          measuredValue: 15,
          threshold: 10,
          payoutAmount: 350,
        },
        status: 'SUCCESS',
        verificationSteps: [],
        // payoutTransactionId is missing
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Act
      const result = await sendPayoutNotification('worker-456', mockClaim);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction ID is required for payout notifications');
      expect(result.notificationId).toBeUndefined();
    });

    it('should handle all trigger types correctly', async () => {
      // Test rain trigger
      const rainClaim: ClaimRecord = {
        id: 'claim-rain',
        workerId: 'worker-123',
        triggerEvent: {
          id: 'trigger-rain',
          type: 'rain',
          timestamp: Date.now(),
          location: { lat: 12.9716, lon: 77.5946, zone: 'Zone A' },
          measuredValue: 15,
          threshold: 10,
          payoutAmount: 350,
        },
        status: 'SUCCESS',
        verificationSteps: [],
        payoutTransactionId: 'UPI_RAIN123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const rainResult = await sendPayoutNotification('worker-123', rainClaim);
      expect(rainResult.success).toBe(true);

      // Test heat trigger
      const heatClaim: ClaimRecord = {
        id: 'claim-heat',
        workerId: 'worker-123',
        triggerEvent: {
          id: 'trigger-heat',
          type: 'heat',
          timestamp: Date.now(),
          location: { lat: 12.9716, lon: 77.5946, zone: 'Zone A' },
          measuredValue: 42,
          threshold: 40,
          payoutAmount: 200,
        },
        status: 'SUCCESS',
        verificationSteps: [],
        payoutTransactionId: 'UPI_HEAT456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const heatResult = await sendPayoutNotification('worker-123', heatClaim);
      expect(heatResult.success).toBe(true);

      // Test traffic trigger
      const trafficClaim: ClaimRecord = {
        id: 'claim-traffic',
        workerId: 'worker-123',
        triggerEvent: {
          id: 'trigger-traffic',
          type: 'traffic',
          timestamp: Date.now(),
          location: { lat: 12.9716, lon: 77.5946, zone: 'Zone A' },
          measuredValue: 12,
          threshold: 15,
          payoutAmount: 120,
        },
        status: 'SUCCESS',
        verificationSteps: [],
        payoutTransactionId: 'UPI_TRAFFIC789',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const trafficResult = await sendPayoutNotification('worker-123', trafficClaim);
      expect(trafficResult.success).toBe(true);
    });
  });

  describe('sendNotification', () => {
    it('should send general notification successfully', async () => {
      // Act
      const result = await sendNotification(
        'worker-789',
        'Test Title',
        'Test Message',
        { key: 'value' }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
      expect(result.notificationId).toMatch(/^NOTIF_/);
      expect(result.error).toBeUndefined();
    });

    it('should send notification without optional data', async () => {
      // Act
      const result = await sendNotification(
        'worker-789',
        'Test Title',
        'Test Message'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should fail when worker ID is missing', async () => {
      // Act
      const result = await sendNotification('', 'Title', 'Message');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Worker ID is required');
      expect(result.notificationId).toBeUndefined();
    });

    it('should fail when title is missing', async () => {
      // Act
      const result = await sendNotification('worker-123', '', 'Message');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Title and message are required');
      expect(result.notificationId).toBeUndefined();
    });

    it('should fail when message is missing', async () => {
      // Act
      const result = await sendNotification('worker-123', 'Title', '');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Title and message are required');
      expect(result.notificationId).toBeUndefined();
    });
  });
});
