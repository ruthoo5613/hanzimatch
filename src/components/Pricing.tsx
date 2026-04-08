import { useGameStore } from '../hooks/useGame';
import { useSubscriptionStore } from '../hooks/useSubscription';

export function Pricing() {
  const { setPhase } = useGameStore();
  const { setSubscription } = useSubscriptionStore();

  const handleBack = () => {
    setPhase('home');
  };

  const handleSubscribe = (planKey: string) => {
    if (planKey === 'free') {
      setSubscription('free');
      setPhase('home');
    } else if (planKey === 'pro') {
      // 付费版 - 提示即将上线
      alert('感谢支持！付费功能即将上线。');
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

        <div onClick={() => handleSubscribe('pro')} style={{ padding: '24px 20px', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 16, cursor: 'pointer', border: '2px solid #4CAF50', boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>付费版</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50' }}>$9.99/年</div>
          </div>
          <div style={{ fontSize: 14, color: '#555' }}>✅ 解锁全部主题</div>
          <div style={{ fontSize: 14, color: '#555' }}>✅ 跟读评分功能</div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#4CAF50', fontWeight: 600 }}>推荐</div>
        </div>
      </div>
    </div>
  );
}