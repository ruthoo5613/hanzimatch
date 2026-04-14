import { useState } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useAuthStore } from '../hooks/useAuth';
import { useSubscriptionStore } from '../hooks/useSubscription';
import type { Theme, ThemeCategory } from '../types';

const CATEGORIES: { id: ThemeCategory | 'my'; name: string; icon: string }[] = [
  { id: 'my', name: '我的主题', icon: '⭐' },
  { id: 'daily', name: '日常生活', icon: '🏠' },
  { id: 'transport', name: '出行交通', icon: '🚗' },
  { id: 'food', name: '餐饮美食', icon: '🍜' },
  { id: 'sport', name: '运动健身', icon: '💪' },
];

const THEMES_PER_PAGE = 6;

export function Home() {
  const { themes, completedLevels, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();
  const { isAuthenticated, user, login, logout, isLoading } = useAuthStore();
  const { tier } = useSubscriptionStore();
  
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'my'>('my');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSelectTheme = (theme: Theme) => {
    if (!isThemeUnlocked(theme.id)) {
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

  const checkThemeLocked = (themeId: string) => {
    if (themeId === 'restaurant_v2') return false;
    if (tier) return false;
    return true;
  };

  // 过滤主题
  const filteredThemes = themes.filter(t => {
    if (t.id === 'coming_soon') return false;
    if (activeCategory === 'my') {
      // 我的主题：显示学过的或已完成的
      return completedLevels.some(c => c.themeId === t.id);
    }
    return t.category === activeCategory;
  });

  // 分页
  const totalPages = Math.ceil(filteredThemes.length / THEMES_PER_PAGE);
  const paginatedThemes = filteredThemes.slice(
    (currentPage - 1) * THEMES_PER_PAGE,
    currentPage * THEMES_PER_PAGE
  );

  // 切换分类时重置页码
  const handleCategoryChange = (category: ThemeCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
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

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 className="home-title" style={{ fontSize: 36, marginBottom: 8 }}>Easy Chinese</h1>
        <p className="home-subtitle">Learn Chinese the easy way!</p>
      </div>

      {/* 分类标签 */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        justifyContent: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        padding: '0 16px'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 20,
              background: activeCategory === cat.id ? '#2196F3' : '#f5f5f5',
              color: activeCategory === cat.id ? 'white' : '#666',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 学习模式入口 */}
      <div className="themes-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="themes-title" style={{ margin: 0 }}>
            {CATEGORIES.find(c => c.id === activeCategory)?.name || '主题列表'} 
            <span style={{ fontSize: 14, fontWeight: 400, color: '#999', marginLeft: 8 }}>
              ({filteredThemes.length}个)
            </span>
          </h2>
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

        {paginatedThemes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#999',
            fontSize: 16 
          }}>
            该分类暂无主题
          </div>
        ) : (
          <>
            <div className="themes-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {paginatedThemes.map((theme) => {
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

            {/* 分页 */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 8, 
                marginTop: 24 
              }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 8,
                    background: currentPage === 1 ? '#f5f5f5' : '#2196F3',
                    color: currentPage === 1 ? '#999' : 'white',
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    fontSize: 14,
                  }}
                >
                  上一页
                </button>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 16px',
                  fontSize: 14,
                  color: '#666'
                }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 8,
                    background: currentPage === totalPages ? '#f5f5f5' : '#2196F3',
                    color: currentPage === totalPages ? '#999' : 'white',
                    cursor: currentPage === totalPages ? 'default' : 'pointer',
                    fontSize: 14,
                  }}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}

        {/* 更多主题敬请期待 */}
        {themes.some(t => t.id === 'coming_soon') && activeCategory === 'my' && (
          <div style={{ marginTop: 24 }}>
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
          <p style={{ marginBottom: 12 }}>🎯 <strong>可理解输入</strong> - 在真实场景中学习，理解比记忆更重要</p>
          <p style={{ marginBottom: 12 }}>🏠 <strong>场景化学习</strong> - 餐厅、酒店、开车...覆盖日常生活场景</p>
          <p style={{ marginBottom: 12 }}>📚 <strong>高频词汇</strong> - 精选日常生活最高频词汇</p>
          <p style={{ marginBottom: 12 }}>👂 听发音 → 👄 跟读练习 → 📖 情景视频，三步掌握实用表达</p>
        </div>
      </div>
    </div>
  );
}