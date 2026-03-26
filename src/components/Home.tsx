import { useGameStore } from '../hooks/useGame';
import { useReviewStore } from '../hooks/useReview';
import { useAuthStore } from '../hooks/useAuth';
import type { Theme } from '../types';

export function Home() {
  const { themes, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();
  const { getStats } = useReviewStore();
  const { isAuthenticated, user, login, logout, isLoading } = useAuthStore();
  const stats = getStats();

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
        <h1 className="home-title" style={{ fontSize: 36, marginBottom: 8 }}>HanziMatch 🀄</h1>
        <p className="home-subtitle">Learn Chinese while playing!</p>
      </div>

      {/* 学习模式入口 */}
      <div className="themes-section">
        <h2 className="themes-title">🎮 学习模式</h2>
        <div className="themes-list">
          {themes.map((theme) => {
            const unlocked = isThemeUnlocked(theme.id);
            const completed = isThemeCompleted(theme.id);

            return (
              <div
                key={theme.id}
                className={`theme-card ${!unlocked ? 'locked' : ''}`}
                onClick={() => handleSelectTheme(theme)}
                style={{
                  padding: 20,
                  background: completed ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : 'white',
                }}
              >
                <span className="theme-icon" style={{ fontSize: 48 }}>{theme.icon}</span>
                <div className="theme-info">
                  <div className="theme-name" style={{ fontSize: 20 }}>{theme.name}</div>
                </div>
                {completed && <span className="theme-status">✓</span>}
                {!unlocked && <span className="theme-status locked">🔒</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 复习和统计入口 */}
      <div className="themes-section" style={{ marginTop: 24 }}>
        <h2 className="themes-title">📖 复习与统计</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <div 
            className="card"
            onClick={() => setPhase('review')}
            style={{ 
              flex: 1, 
              textAlign: 'center', 
              cursor: 'pointer',
              background: stats.toReview > 0 ? 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' : 'white',
              border: stats.toReview > 0 ? '2px solid #FF9800' : '2px solid #E0E0E0',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📖</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>复习</div>
            <div style={{ fontSize: 14, color: stats.toReview > 0 ? '#FF9800' : '#757575' }}>
              {stats.toReview > 0 ? `${stats.toReview} 词待复习` : '暂无复习'}
            </div>
          </div>

          <div 
            className="card"
            onClick={() => setPhase('stats')}
            style={{ 
              flex: 1, 
              textAlign: 'center', 
              cursor: 'pointer',
              background: 'white',
              border: '2px solid #E0E0E0',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>统计</div>
            <div style={{ fontSize: 14, color: '#757575' }}>
              已掌握 {stats.mastered} 词
            </div>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="themes-section" style={{ marginTop: 32 }}>
        <div className="card" style={{ textAlign: 'left', lineHeight: 1.8, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>How to Play</div>
          <p style={{ marginBottom: 12 }}>🎧 <strong>Listen</strong> - Hear the pronunciation</p>
          <p style={{ marginBottom: 12 }}>👆 <strong>Choose</strong> - Pick the right character</p>
          <p style={{ marginBottom: 12 }}>🎮 <strong>Match</strong> - Find matching words</p>
          <p>🗣️ <strong>Speak</strong> - Practice pronunciation</p>
        </div>
      </div>
    </div>
  );
}