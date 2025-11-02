import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReminderFrequency, ReminderLimit } from '../store/lowStockAlertStore';

/**
 * Reminder Utilities
 * Tracks how many times a product has been reminded within the current period
 */

const REMINDER_COUNT_KEY = 'low_stock_reminder_counts';
const REMINDER_PERIOD_KEY = 'low_stock_reminder_period';

interface ReminderCount {
  productId: string;
  count: number;
  periodStart: number; // timestamp
}

/**
 * Get current reminder counts from storage
 */
async function getReminderCounts(): Promise<Record<string, ReminderCount>> {
  try {
    const data = await AsyncStorage.getItem(REMINDER_COUNT_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load reminder counts:', error);
  }
  return {};
}

/**
 * Save reminder counts to storage
 */
async function saveReminderCounts(counts: Record<string, ReminderCount>): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDER_COUNT_KEY, JSON.stringify(counts));
  } catch (error) {
    console.warn('Failed to save reminder counts:', error);
  }
}

/**
 * Get period start timestamp based on frequency
 */
function getPeriodStart(frequency: ReminderFrequency): number {
  const now = Date.now();
  
  if (frequency === 'day') {
    // Start of today (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  } else {
    // Start of current week (Monday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }
}

/**
 * Check if we can send a reminder for a product
 */
export async function canSendReminder(
  productId: string,
  frequency: ReminderFrequency,
  limit: ReminderLimit
): Promise<boolean> {
  const counts = await getReminderCounts();
  const currentPeriod = getPeriodStart(frequency);
  const productCount = counts[productId];

  // If no record exists, can send
  if (!productCount) {
    return true;
  }

  // If period changed, reset count
  if (productCount.periodStart < currentPeriod) {
    return true;
  }

  // Check if limit reached
  return productCount.count < limit;
}

/**
 * Record that a reminder was sent for a product
 */
export async function recordReminderSent(productId: string, frequency: ReminderFrequency): Promise<void> {
  const counts = await getReminderCounts();
  const currentPeriod = getPeriodStart(frequency);
  const productCount = counts[productId];

  if (!productCount || productCount.periodStart < currentPeriod) {
    // New period, start fresh
    counts[productId] = {
      productId,
      count: 1,
      periodStart: currentPeriod,
    };
  } else {
    // Same period, increment count
    counts[productId] = {
      ...productCount,
      count: productCount.count + 1,
    };
  }

  await saveReminderCounts(counts);
}

/**
 * Clear all reminder counts (for testing or reset)
 */
export async function clearReminderCounts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REMINDER_COUNT_KEY);
  } catch (error) {
    console.warn('Failed to clear reminder counts:', error);
  }
}

