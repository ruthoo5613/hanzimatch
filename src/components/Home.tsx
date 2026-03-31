import { useGameStore } from '../hooks/useGame';
import { useAuthStore } from '../hooks/useAuth';
import type { Theme } from '../types';

export function Home() {
  const { themes, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();
  const { isAuthenticated, user, login, logout, isLoading } = useAuthStore();

  const handleSelectTheme = (theme: Theme) => {
    if (!isThemeUnlocked(theme.id)) return;
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

  return (
    <div className="home-page">
      {/* 登录状态 */}
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        {isLoading ? (
          <span style={{ fontSize: 14, color: '#757575' }}>加载中...</span>
        ) : isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user.photoURL && (
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
            )}
            <span style={{ fontSize: 14, color: '#333' }}>
              {user.displayName || user.email}
            </span>
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
        <h1 className="home-title" style={{ fontSize: 36, marginBottom: 8 }}>Chinese Language Learning</h1>
        <p className="home-subtitle">Master Chinese through immersive games!</p>
      </div>

      {/* 学习模式入口 */}
      <div className="themes-section">
        <h2 className="themes-title">🎮 学习模式</h2>
        <div className="themes-list">
          {themes.map((theme) => {
            const unlocked = isThemeUnlocked(theme.id);
            const completed = isThemeCompleted(theme.id);
            const isComingSoon = theme.id === 'coming_soon';

            return (
              <div
                key={theme.id}
                className={`theme-card ${!unlocked && !isComingSoon ? 'locked' : ''}`}
                onClick={() => !isComingSoon && handleSelectTheme(theme)}
                style={{
                  padding: 20,
                  background: completed ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : isComingSoon ? '#f5f5f5' : 'white',
                  cursor: isComingSoon ? 'default' : unlocked ? 'pointer' : 'not-allowed',
                  opacity: isComingSoon ? 0.7 : 1,
                }}
              >
                <span className="theme-icon" style={{ fontSize: 48 }}>{theme.icon}</span>
                <div className="theme-info">
                  <div className="theme-name" style={{ fontSize: 20 }}>{theme.name}</div>
                  {theme.nameEn && <div style={{ fontSize: 12, color: '#9E9E9E' }}>{theme.nameEn}</div>}
                </div>
                {completed && <span className="theme-status">✓</span>}
                {!unlocked && !isComingSoon && <span className="theme-status locked">🔒</span>}
                {isComingSoon && <span className="theme-status" style={{ color: '#9E9E9E' }}>🔜</span>}
              </div>
            );
          })}
        </div>
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

      {/* 用户留言板块 */}
      <div className="themes-section" style={{ marginTop: 32 }}>
        <div className="card" style={{ textAlign: 'left', lineHeight: 1.8, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>反馈建议 / Feedback</div>
          <p style={{ marginBottom: 16, color: '#757575' }}>欢迎提交您的使用建议和问题 / Your feedback helps us improve</p>
          <button 
            onClick={() => setPhase('guestbook')}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            📝 留言板 / Guestbook
          </button>
        </div>
      </div>
    </div>
  );
}