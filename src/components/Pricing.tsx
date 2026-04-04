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

// 生产环境需要配置后端 API 地址
// const API_BASE = import.meta.env.PROD ? '' : 'https://hanzimatch.pages.dev';

export function Pricing() {
  const { setPhase } = useGameStore();
  const { setSubscription } = useSubscriptionStore();
  const { isAuthenticated, login } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'ultimate' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => setPhase('home');

  // 预加载 PayPal SDK (生产环境)
  useEffect(() => {
    if (window.paypal) return;
    
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AXJ8U8OrK_NcNAswDnZVjd0uy81DFgmv-onEiN-qjJCQaNx7SzjkNJp6eISg4xXe9dcsXTTTMpiuERrL&currency=USD';
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
          // 直接激活订阅（跳过后端验证，简化为沙盒测试）
          // 生产环境需要调用后端验证订单
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