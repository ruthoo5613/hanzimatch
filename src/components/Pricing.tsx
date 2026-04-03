import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSubscriptionStore, PRICING_CONFIG } from '../hooks/useSubscription';
import { useAuthStore } from '../hooks/useAuth';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string>;
        createOrder: (_data: unknown, actions: { order: { create: (config: { purchase_units: Array<{ amount: { value: string }; custom_id?: string; description?: string }> }) => Promise<string> } }) => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

const PRICES: Record<string, string> = {
  basic: '9.99',
  pro: '14.99',
  ultimate: '19.99',
};

// 后端 API 地址（根据环境自动切换）
const API_BASE = import.meta.env.PROD 
  ? '' 
  : 'https://hanzimatch.pages.dev';

// 验证订单 API
async function verifyOrder(orderID: string): Promise<{ valid: boolean; amount?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/verify-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID }),
    });
    return await response.json();
  } catch (error) {
    console.error('Verify order error:', error);
    return { valid: false };
  }
}

export function Pricing() {
  const { setPhase } = useGameStore();
  const { setSubscription } = useSubscriptionStore();
  const { isAuthenticated, login } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'ultimate' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => setPhase('home');

  // 预加载 PayPal SDK
  useEffect(() => {
    if (window.paypal) return;
    
    const script = document.createElement('script');
    script.src = 'https://www.sandbox.paypal.com/sdk/js?client-id=AR4yawe_hpBv1Ops3gzrX6ZYvujhQknnxY63vOjfu5b1uFR4Y33Cofov-m6iiZ71GKDaGYit1_KtolxL&currency=USD';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // 渲染 PayPal 按钮
  useEffect(() => {
    if (!showModal || !selectedPlan || !window.paypal) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = '';
    
    const price = PRICES[selectedPlan];
    const planName = PRICING_CONFIG[selectedPlan].name;

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect' },
      createOrder: async (_data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: price },
            custom_id: 'hanzimatch_user', // 可替换为实际用户ID
            description: `${planName} 订阅`
          }]
        });
      },
      onApprove: async (data) => {
        console.log('onApprove called, selectedPlan:', selectedPlan, 'OrderID:', data.orderID);
        if (!selectedPlan) {
          alert('订单信息缺失，请重试');
          return;
        }
        setIsLoading(true);
        try {
          // 1. 先调用后端验证订单
          const verifyResult = await verifyOrder(data.orderID);
          console.log('Verify result:', verifyResult);
          
          if (!verifyResult.valid) {
            alert('订单验证失败，请重试');
            return;
          }
          
          // 2. 验证通过后激活订阅
          const plan = PRICING_CONFIG[selectedPlan];
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          setSubscription(plan.tier, expiresAt);
          alert(`已成功订阅${plan.name}！`);
          setShowModal(false);
          setSelectedPlan(null);
          setPhase('home');
        } catch (e) {
          console.error('Payment error:', e);
          alert('支付失败');
        } finally {
          setIsLoading(false);
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        alert('支付出错');
      },
    }).render('#paypal-button-container');
  }, [showModal, selectedPlan, setSubscription, setPhase]);

  const handleSubscribe = async (planKey: 'basic' | 'pro' | 'ultimate') => {
    if (!isAuthenticated) {
      try {
        await login();
        alert('请再次点击订阅按钮');
        return;
      } catch {
        alert('登录失败');
        return;
      }
    }
    setSelectedPlan(planKey);
    setShowModal(true);
  };

  const plans = [
    { key: 'basic', name: '基础版', price: '$9.99', features: ['✅ 解锁全部主题'], recommended: false },
    { key: 'pro', name: '进阶版', price: '$14.99', features: ['✅ 解锁全部主题', '✅ 跟读评分功能'], recommended: true },
    { key: 'ultimate', name: '尊享版', price: '$19.99', features: ['✅ 解锁全部主题', '✅ 跟读评分功能', '✅ AI对话陪练'], recommended: false },
  ];

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24 }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>定价</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Pricing</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>升级你的学习体验</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map(plan => (
          <div key={plan.key} style={{
            background: plan.recommended ? '#4CAF50' : 'white',
            borderRadius: 16, padding: 20,
            border: plan.recommended ? '2px solid #4CAF50' : '2px solid transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 700, color: plan.recommended ? 'white' : '#333' }}>{plan.name}</span>
              </div>
              {plan.recommended && <span style={{ background: 'white', color: '#4CAF50', padding: '4px 12px', borderRadius: 12, fontSize: 12 }}>推荐</span>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: plan.recommended ? 'white' : '#333' }}>{plan.price}</span>
              <span style={{ fontSize: 14, color: plan.recommended ? '#E8F5E9' : '#9E9E9E' }}>/月</span>
            </div>
            {plan.features.map((f, i) => <div key={i} style={{ color: plan.recommended ? 'white' : '#666', marginBottom: 8 }}>{f}</div>)}
            <button onClick={() => handleSubscribe(plan.key as any)} disabled={isLoading} style={{
              width: '100%', padding: '14px', fontSize: 16, fontWeight: 600,
              background: plan.recommended ? 'white' : '#4CAF50',
              color: plan.recommended ? '#4CAF50' : 'white', border: 'none', borderRadius: 12,
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
            }}>
              {isLoading ? '处理中...' : '立即订阅'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ width: '90%', maxWidth: 400, padding: 24, background: 'white', borderRadius: 16, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowModal(false); setSelectedPlan(null); }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#999' }}>×</button>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
              {selectedPlan && PRICING_CONFIG[selectedPlan].name} - ${PRICES[selectedPlan!]}/月
            </div>
            <div id="paypal-button-container" style={{ minHeight: 200 }}></div>
          </div>
        </div>
      )}
    </div>
  );
}