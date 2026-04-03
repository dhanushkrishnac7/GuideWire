/**
 * Notification Service - Sends push notifications to workers
 * 
 * Provides push notification functionality for payout alerts and other
 * system notifications. This is a mock implementation for demo purposes.
 * In production, this would integrate with Expo Notifications or FCM.
 */

import { ClaimRecord } from '../types/triggers';

/**
 * Notification payload for payout alerts
 */
export interface PayoutNotification {
  workerId: string;
  claimId: string;
  triggerType: 'rain' | 'heat' | 'traffic';
  payoutAmount: number;
  transactionId: string;
  timestamp: number;
}

/**
 * Result of notification send attempt
 */
export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

/**
 * Send push notification to worker when payout completes successfully
 * 
 * This is a mock implementation that logs notifications to the console.
 * In production, this would integrate with:
 * - Expo Notifications (React Native)
 * - Firebase Cloud Messaging (FCM)
 * - Apple Push Notification Service (APNS)
 * 
 * @param workerId - The ID of the worker to notify
 * @param claim - The claim record with payout details
 * @returns Promise resolving to notification result
 */
export async function sendPayoutNotification(
  workerId: string,
  claim: ClaimRecord
): Promise<NotificationResult> {
  try {
    // Validate inputs
    if (!workerId) {
      throw new Error('Worker ID is required');
    }

    if (!claim) {
      throw new Error('Claim record is required');
    }

    if (claim.status !== 'SUCCESS') {
      throw new Error('Can only send notifications for successful payouts');
    }

    if (!claim.payoutTransactionId) {
      throw new Error('Transaction ID is required for payout notifications');
    }

    // Create notification payload
    const notification: PayoutNotification = {
      workerId,
      claimId: claim.id,
      triggerType: claim.triggerEvent.type,
      payoutAmount: claim.triggerEvent.payoutAmount,
      transactionId: claim.payoutTransactionId,
      timestamp: Date.now(),
    };

    // Mock notification send - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock notification ID
    const notificationId = `NOTIF_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Log notification to console (mock implementation)
    console.log('📱 Push Notification Sent:');
    console.log(`   Worker ID: ${notification.workerId}`);
    console.log(`   Title: Payout Successful!`);
    console.log(`   Message: ₹${notification.payoutAmount} has been credited to your account`);
    console.log(`   Trigger Type: ${getTriggerDisplayName(notification.triggerType)}`);
    console.log(`   Transaction ID: ${notification.transactionId}`);
    console.log(`   Notification ID: ${notificationId}`);
    console.log(`   Timestamp: ${new Date(notification.timestamp).toISOString()}`);

    return {
      success: true,
      notificationId,
    };
  } catch (error) {
    console.error('Error sending payout notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get human-readable display name for trigger type
 */
function getTriggerDisplayName(triggerType: 'rain' | 'heat' | 'traffic'): string {
  const displayNames = {
    rain: 'Heavy Rain/Flood',
    heat: 'Extreme Heat',
    traffic: 'Traffic Gridlock',
  };
  return displayNames[triggerType];
}

/**
 * Send general notification to worker (for future use)
 * 
 * @param workerId - The ID of the worker to notify
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Optional additional data
 * @returns Promise resolving to notification result
 */
export async function sendNotification(
  workerId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<NotificationResult> {
  try {
    // Validate inputs
    if (!workerId) {
      throw new Error('Worker ID is required');
    }

    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    // Mock notification send - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock notification ID
    const notificationId = `NOTIF_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Log notification to console (mock implementation)
    console.log('📱 Push Notification Sent:');
    console.log(`   Worker ID: ${workerId}`);
    console.log(`   Title: ${title}`);
    console.log(`   Message: ${message}`);
    if (data) {
      console.log(`   Data: ${JSON.stringify(data)}`);
    }
    console.log(`   Notification ID: ${notificationId}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    return {
      success: true,
      notificationId,
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
