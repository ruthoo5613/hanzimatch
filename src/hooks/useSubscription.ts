import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'ultimate';

interface SubscriptionState {
  tier: SubscriptionTier;
  expiresAt: string | null;
  
  // 功能权限
  canAccessAllThemes: boolean;
  canUseRecording: boolean;
  canUseAIChat: boolean;
  
  // Actions
  setSubscription: (tier: SubscriptionTier, expiresAt?: string) => void;
  isSubscribed: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      expiresAt: null,
      
      canAccessAllThemes: false,
      canUseRecording: false,
      canUseAIChat: false,
      
      setSubscription: (tier: SubscriptionTier, expiresAt?: string) => {
        const now = new Date();
        const isExpired = expiresAt && new Date(expiresAt) < now;
        const actualTier = isExpired ? 'free' : tier;
        
        set({
          tier: actualTier,
          expiresAt: expiresAt || null,
          canAccessAllThemes: actualTier !== 'free',
          canUseRecording: actualTier === 'pro' || actualTier === 'ultimate',
          canUseAIChat: actualTier === 'ultimate',
        });
      },
      
      isSubscribed: () => get().tier !== 'free',
    }),
    {
      name: 'hanzimatch-subscription',
    }
  )
);

// 价格配置
export const PRICING_CONFIG = {
  basic: {
    name: '基础版',
    nameEn: 'Basic',
    price: 9.99,
    priceYearly: 59.99,
    features: ['解锁全部主题'],
    tier: 'basic' as SubscriptionTier,
  },
  pro: {
    name: '进阶版',
    nameEn: 'Pro',
    price: 14.99,
    priceYearly: 89.99,
    features: ['解锁全部主题', '跟读评分功能'],
    tier: 'pro' as SubscriptionTier,
  },
  ultimate: {
    name: '尊享版',
    nameEn: 'Ultimate',
    price: 19.99,
    priceYearly: 119.99,
    features: ['解锁全部主题', '跟读评分功能', 'AI对话陪练'],
    tier: 'ultimate' as SubscriptionTier,
  },
};