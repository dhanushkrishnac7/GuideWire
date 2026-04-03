import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TriggerType = 'rain' | 'heat' | 'flood' | 'aqi' | 'strike';

export interface SimulatedTrigger {
  id: string;
  type: TriggerType;
  label: string;
  sub: string;
  payout: number;
  color: string;
  icon: string;
}

export interface PayoutEvent {
  id: string;
  amount: number;
  type: TriggerType;
  label: string;
  timestamp: number;
}

interface PayoutContextType {
  totalPayouts: number;
  recentPayouts: PayoutEvent[];
  addPayout: (amount: number, type: TriggerType, label: string) => void;
  activeTriggers: SimulatedTrigger[];
  setActiveTriggers: React.Dispatch<React.SetStateAction<SimulatedTrigger[]>>;
  refreshPayouts: () => Promise<void>;
  clearSimulation: () => void;
}

const PayoutContext = createContext<PayoutContextType | undefined>(undefined);

const PAYOUT_STORAGE_KEY = 'demo_payouts_v3';

export const PayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [recentPayouts, setRecentPayouts] = useState<PayoutEvent[]>([]);
  const [activeTriggers, setActiveTriggers] = useState<SimulatedTrigger[]>([]);

  // Load payouts from storage on mount
  useEffect(() => {
    refreshPayouts();
  }, []);

  const refreshPayouts = async () => {
    try {
      const stored = await AsyncStorage.getItem(PAYOUT_STORAGE_KEY);
      if (stored) {
        const payouts = JSON.parse(stored);
        setRecentPayouts(payouts);
        const total = payouts.reduce((sum: number, p: any) => sum + p.amount, 0);
        setTotalPayouts(total);
      }
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
  };

  const addPayout = async (amount: number, type: TriggerType, label: string) => {
    const newPayout: PayoutEvent = {
      id: `payout_${Date.now()}_${Math.random()}`,
      amount,
      type,
      label,
      timestamp: Date.now(),
    };

    const updated = [newPayout, ...recentPayouts].slice(0, 15); // Keep last 15
    setRecentPayouts(updated);
    setTotalPayouts(prev => prev + amount);

    try {
      await AsyncStorage.setItem(PAYOUT_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving payout:', error);
    }
  };

  const clearSimulation = async () => {
    setRecentPayouts([]);
    setTotalPayouts(0);
    setActiveTriggers([]);
    await AsyncStorage.removeItem(PAYOUT_STORAGE_KEY);
  };

  return (
    <PayoutContext.Provider value={{ totalPayouts, recentPayouts, addPayout, activeTriggers, setActiveTriggers, refreshPayouts, clearSimulation }}>
      {children}
    </PayoutContext.Provider>
  );
};

export const usePayouts = () => {
  const context = useContext(PayoutContext);
  if (!context) {
    throw new Error('usePayouts must be used within PayoutProvider');
  }
  return context;
};
