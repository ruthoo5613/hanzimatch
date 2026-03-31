import { useGameStore } from '../hooks/useGame';
import { useAuthStore } from '../hooks/useAuth';
import { useSubscriptionStore } from '../hooks/useSubscription';
import { useReviewStore } from '../hooks/useReview';

export function Profile() {
  const { setPhase, completedLevels } = useGameStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { tier, isSubscribed } = useSubscriptionStore();
  const { getStats } = useReviewStore();

  const stats = getStats();
  const isPaid = isSubscribed();

  const handleBack = () => {
    setPhase('home');
  };

  const handleLogout = async () => {
    await logout();
    setPhase('home');
  };

  const getTierName = () => {
    switch (tier) {
      case 'basic': return '基础版';
      case 'pro': return '进阶版';
      case 'ultimate': return '尊享版';
      default: return '免费版';
    }
  };

  // 计算学习进度
  const completedThemes = new Set(completedLevels.map(c => c.themeId)).size;

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>个人中心</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Profile</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* 用户信息 */}
      {isAuthenticated && user ? (
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="avatar" 
              style={{ width: 64, height: 64, borderRadius: '50%' }}
            />
          ) : (
            <div style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              background: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
            }}>
              {user.displayName?.[0] || 'U'}
            </div>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user.displayName || '用户'}</div>
            <div style={{ fontSize: 14, color: '#666' }}>{user.email}</div>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 20,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>未登录</div>
          <button 
            onClick={() => useAuthStore.getState().login()}
            style={{
              padding: '10px 24px',
              background: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            登录
          </button>
        </div>
      )}

      {/* 订阅状态 */}
      <div style={{ 
        background: isPaid ? 'linear-gradient(135deg, #4CAF50, #81C784)' : '#FF9800', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 20,
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>当前套餐</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{getTierName()}</div>
          </div>
          <div style={{ fontSize: 40 }}>{isPaid ? '⭐' : '🆓'}</div>
        </div>
        
        {!isPaid && (
          <button 
            onClick={() => setPhase('pricing')}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#FF9800',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            升级到付费版 →
          </button>
        )}
      </div>

      {/* 学习统计 */}
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📊 学习统计</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2196F3' }}>{completedThemes}</div>
            <div style={{ fontSize: 12, color: '#666' }}>已完成主题</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50' }}>{stats.mastered}</div>
            <div style={{ fontSize: 12, color: '#666' }}>掌握词汇</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#9C27B0' }}>{stats.learning}</div>
            <div style={{ fontSize: 12, color: '#666' }}>学习中</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FF9800' }}>{stats.toReview}</div>
            <div style={{ fontSize: 12, color: '#666' }}>待复习</div>
          </div>
        </div>
      </div>

      {/* 功能权限 */}
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🔐 功能权限</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>解锁全部主题</span>
            <span style={{ color: isPaid ? '#4CAF50' : '#F44336' }}>{isPaid ? '✓' : '✗'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>跟读评分功能</span>
            <span style={{ color: ['pro', 'ultimate'].includes(tier) ? '#4CAF50' : '#F44336' }}>
              {['pro', 'ultimate'].includes(tier) ? '✓' : '✗'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>AI对话陪练</span>
            <span style={{ color: tier === 'ultimate' ? '#4CAF50' : '#F44336' }}>
              {tier === 'ultimate' ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: 20,
      }}>
        <button 
          onClick={() => setPhase('pricing')}
          style={{
            width: '100%',
            padding: '14px',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            fontSize: 16,
            cursor: 'pointer',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          💰 定价方案
        </button>
        <button 
          onClick={() => setPhase('faq')}
          style={{
            width: '100%',
            padding: '14px',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            fontSize: 16,
            cursor: 'pointer',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          ❓ 常见问题
        </button>
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              fontSize: 16,
              color: '#F44336',
              cursor: 'pointer',
            }}
          >
            🚪 退出登录
          </button>
        )}
      </div>
    </div>
  );
}