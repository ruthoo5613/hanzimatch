import { useGameStore } from '../hooks/useGame';
import { useSubscriptionStore, PRICING_CONFIG } from '../hooks/useSubscription';

export function Pricing() {
  const { setPhase } = useGameStore();
  const { setSubscription } = useSubscriptionStore();

  const handleBack = () => {
    setPhase('home');
  };

  const handleSubscribe = (planKey: 'basic' | 'pro' | 'ultimate') => {
    // TODO: 接入 PayPal 支付
    // 暂时模拟订阅成功
    const plan = PRICING_CONFIG[planKey];
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30天后
    setSubscription(plan.tier, expiresAt);
    alert(`已成功订阅${plan.name}！`);
    setPhase('home');
  };

  const plans = [
    {
      key: 'basic',
      name: '基础版',
      nameEn: 'Basic',
      price: '$9.99',
      priceYearly: '$59.99',
      features: ['✅ 解锁全部主题'],
      recommended: false,
    },
    {
      key: 'pro',
      name: '进阶版',
      nameEn: 'Pro',
      price: '$14.99',
      priceYearly: '$89.99',
      features: ['✅ 解锁全部主题', '✅ 跟读评分功能'],
      recommended: true,
    },
    {
      key: 'ultimate',
      name: '尊享版',
      nameEn: 'Ultimate',
      price: '$19.99',
      priceYearly: '$119.99',
      features: ['✅ 解锁全部主题', '✅ 跟读评分功能', '✅ AI对话陪练'],
      recommended: false,
    },
  ];

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>定价</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Pricing</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>升级你的学习体验</h1>
        <p style={{ color: '#666' }}>Unlock all features and accelerate your Chinese learning</p>
      </div>

      {/* 价格卡片 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map((plan) => (
          <div
            key={plan.key}
            style={{
              background: plan.recommended ? '#4CAF50' : 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: plan.recommended ? '2px solid #4CAF50' : '2px solid transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 700, color: plan.recommended ? 'white' : '#333' }}>
                  {plan.name}
                </span>
                <span style={{ fontSize: 14, color: plan.recommended ? '#E8F5E9' : '#9E9E9E', marginLeft: 8 }}>
                  {plan.nameEn}
                </span>
              </div>
              {plan.recommended && (
                <span style={{ background: 'white', color: '#4CAF50', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                  推荐
                </span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: plan.recommended ? 'white' : '#333' }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 14, color: plan.recommended ? '#E8F5E9' : '#9E9E9E' }}>/月</span>
              <div style={{ fontSize: 12, color: plan.recommended ? '#E8F5E9' : '#9E9E9E', marginTop: 4 }}>
                年付仅 {plan.priceYearly}（省 60%）
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              {plan.features.map((feature, i) => (
                <div key={i} style={{ color: plan.recommended ? 'white' : '#666', marginBottom: 8, fontSize: 14 }}>
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan.key as any)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 16,
                fontWeight: 600,
                background: plan.recommended ? 'white' : '#4CAF50',
                color: plan.recommended ? '#4CAF50' : 'white',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              立即订阅
            </button>
          </div>
        ))}
      </div>

      {/* 底部说明 */}
      <div style={{ textAlign: 'center', marginTop: 32, color: '#9E9E9E', fontSize: 12 }}>
        <p>支付由 PayPal 安全处理</p>
        <p>随时取消，月付无长期合约</p>
      </div>

      {/* FAQ 入口 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button 
          onClick={() => setPhase('faq')}
          style={{ background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', textDecoration: 'underline' }}
        >
          查看常见问题 →
        </button>
      </div>
    </div>
  );
}