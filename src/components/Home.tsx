import { useGameStore } from '../hooks/useGame';
import { useAuthStore } from '../hooks/useAuth';
import { useSubscriptionStore } from '../hooks/useSubscription';
import type { Theme } from '../types';

export function Home() {
  const { themes, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();
  const { isAuthenticated, user, login, logout, isLoading } = useAuthStore();
  const { isSubscribed, canAccessAllThemes } = useSubscriptionStore();

  const handleSelectTheme = (theme: Theme) => {
    if (!isThemeUnlocked(theme.id)) {
      // 未解锁，提示升级
      setPhase('pricing');
      return;
    }
    setTheme(theme);
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAvatarClick = () => {
    setPhase('profile');
  };

  // 检查主题是否解锁
  const checkThemeLocked = (themeId: string) => {
    // 免费用户只有 restaurant_v2 解锁
    if (themeId === 'restaurant_v2') return false;
    if (canAccessAllThemes) return false;
    return true;
  };

  return (
    <div className="home-page">
      {/* 右上角：登录按钮 */}
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        zIndex: 10
      }}>
        
        {isLoading ? (
          <span style={{ fontSize: 14, color: '#757575' }}>加载中...</span>
        ) : isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div 
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer' }}
              title="个人中心"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'}
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                }}>
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
            </div>
            <button 
              onClick={handleLogout}
              style={{
                background: '#f5f5f5',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                color: '#666'
              }}
            >
              退出
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            style={{
              background: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
            登录
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="home-title" style={{ fontSize: 36, marginBottom: 8 }}>Easy Chinese</h1>
        <p className="home-subtitle">Learn Chinese the easy way!</p>
      </div>

      {/* 学习模式入口 */}
      <div className="themes-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="themes-title" style={{ margin: 0 }}>主题列表</h2>
          <button 
            onClick={() => setPhase('guestbook')}
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            📝 留言板
          </button>
        </div>
        <div className="themes-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 正常主题：一行两个 */}
          {themes.filter(t => t.id !== 'coming_soon').map((theme) => {
            const completed = isThemeCompleted(theme.id);
            const isLocked = checkThemeLocked(theme.id);

            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                style={{
                  padding: 20,
                  background: completed ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : (isLocked ? '#f5f5f5' : 'white'),
                  cursor: 'pointer',
                  minHeight: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  boxShadow: isLocked ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  opacity: isLocked ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 40 }}>{theme.icon}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{theme.name}</div>
                    {theme.nameEn && <div style={{ fontSize: 12, color: '#9E9E9E' }}>{theme.nameEn}</div>}
                  </div>
                </div>
                <div>
                  {completed && <span>✓</span>}
                  {isLocked && <span style={{ color: '#FF9800' }}>🔒</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* 更多主题敬请期待：独占一行 */}
        {themes.some(t => t.id === 'coming_soon') && (
          <div style={{ marginTop: 16 }}>
            {themes.filter(t => t.id === 'coming_soon').map((theme) => (
              <div
                key={theme.id}
                style={{
                  padding: '12px 20px',
                  background: '#f5f5f5',
                  borderRadius: 12,
                  cursor: 'default',
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 24 }}>{theme.icon}</span>
                <div style={{ fontSize: 18, color: '#666' }}>{theme.name}</div>
                {theme.nameEn && <div style={{ fontSize: 14, color: '#9E9E9E' }}>{theme.nameEn}</div>}
                <span style={{ color: '#9E9E9E' }}>🔜</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 产品说明 */}
      <div className="themes-section" style={{ marginTop: 32 }}>
        <div className="card" style={{ textAlign: 'left', lineHeight: 1.8, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>About This App</div>
          <p style={{ marginBottom: 12 }}>🎯 <strong>可理解输入</strong> - 在真实场景中学习，理解比记忆更重要 / Comprehensible input in real contexts</p>
          <p style={{ marginBottom: 12 }}>🏠 <strong>场景化学习</strong> - 餐厅、酒店、开车...覆盖日常生活场景 / Scenario-based learning for daily life</p>
          <p style={{ marginBottom: 12 }}>📚 <strong>高频词汇</strong> - 精选日常生活最高频词汇 / High-frequency words for everyday use</p>
          <p style={{ marginBottom: 12 }}>👂 听发音 → 👄 跟读练习 → 📖 情景视频，三步掌握实用表达 / Listen → Practice → Watch in context</p>
        </div>
      </div>
    </div>
  );
}