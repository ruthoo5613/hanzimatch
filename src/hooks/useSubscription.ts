import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SubscriptionTier = 'free' | 'pro';

interface SubscriptionState {
  tier: SubscriptionTier;
  expiresAt: string | null;
  setSubscription: (tier: SubscriptionTier, expiresAt?: string) => void;
  isSubscribed: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      expiresAt: null,

      setSubscription: (tier: SubscriptionTier, expiresAt?: string) => {
        const isExpired = expiresAt && new Date(expiresAt) < new Date();
        const actualTier = isExpired ? 'free' : tier;
        
        set({
          tier: actualTier,
          expiresAt: isExpired ? null : (expiresAt || null),
        });
      },

      isSubscribed: () => get().tier === 'pro',
    }),
    {
      name: 'hanzimatch-subscription',
    }
  )
);

// 订阅计划配置
export const SUBSCRIPTION_PLANS = {
  free: {
    name: '免费版',
    tier: 'free' as SubscriptionTier,
  },
  pro: {
    name: '付费版',
    tier: 'pro' as SubscriptionTier,
  },
};