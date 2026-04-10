import { useEffect, useState } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSubscriptionStore } from '../hooks/useSubscription';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string>;
        createOrder: (_data: unknown, actions: { order: { create: (config: { purchase_units: Array<{ amount: { value: string } }> }) => Promise<string> } }) => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

// TODO: 替换为真实的 PayPal Client ID
const PAYPAL_CLIENT_ID = "AXJ8U8OrK_NcNAswDnZVjd0uy81DFgmv-onEiN-qjJCQaNx7SzjkNJp6eISg4xXe9dcsXTTTMpiuERrL";

export function Pricing() {
  const { setPhase } = useGameStore();
  const { setSubscription } = useSubscriptionStore();
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const handleBack = () => {
    setPhase('home');
  };

  useEffect(() => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (paypalLoaded && window.paypal) {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
        createOrder: (_data, actions) => actions.order.create({
          purchase_units: [{ amount: { value: '9.99' } }]
        }),
        onApprove: async () => {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          setSubscription('pro', expiresAt.toISOString());
          alert('感谢支持！付费功能已解锁。');
          setPhase('home');
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          alert('支付失败，请重试。');
        },
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, setSubscription, setPhase]);

  const handleSubscribe = (planKey: string) => {
    if (planKey === 'free') {
      setSubscription('free');
      setPhase('home');
    }
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 600 }}>选择版本</div>
        <div style={{ width: 40 }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Easy Chinese</div>
        <div style={{ fontSize: 16, color: '#666' }}>选择适合你的学习方案</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div onClick={() => handleSubscribe('free')} style={{ padding: '24px 20px', background: '#f5f5f5', borderRadius: 16, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>免费版</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>免费</div>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>✅ 解锁全部主题</div>
        </div>

        <div style={{ padding: '24px 20px', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 16, border: '2px solid #4CAF50', boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)', cursor: 'pointer' }} onClick={() => document.getElementById('paypal-button-container')?.querySelector('button')?.click()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>付费版</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50' }}>$9.99/年</div>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>✅ 解锁全部主题</div>
          <div style={{ fontSize: 14, color: '#555' }}>✅ 跟读评分功能</div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#4CAF50', fontWeight: 600 }}>推荐</div>
          <div id="paypal-button-container" style={{ marginTop: 16, minHeight: 45 }}>
            {!paypalLoaded && <div style={{color: '#999', fontSize: 14}}>加载中...</div>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: '#999' }}>
        🔒 安全支付，由 PayPal 保障
      </div>
    </div>
  );
}