import { useState } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useAuthStore } from '../hooks/useAuth';
import { useSubscriptionStore } from '../hooks/useSubscription';
import type { Theme, ThemeCategory } from '../types';

const CATEGORIES: { id: ThemeCategory | 'my'; name: string; icon: string }[] = [
  { id: 'daily', name: 'Daily Life', icon: '🏠' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'food', name: 'Food & Dining', icon: '🍜' },
  { id: 'sport', name: 'Sports', icon: '💪' },
  { id: 'my', name: 'My Themes', icon: '⭐' },
];

const THEMES_PER_PAGE = 6;

export function Home() {
  const { themes, customThemes, addCustomTheme, deleteCustomTheme, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();
  const { isAuthenticated, user, login, logout, isLoading } = useAuthStore();
  const { tier } = useSubscriptionStore();
  
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'my'>('daily');
  const [currentPage, setCurrentPage] = useState(1);
  
  // 自定义主题表单状态
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeVideo, setNewThemeVideo] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  // 从YouTube URL提取视频ID
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // 生成通用学习词汇和句子
  const generateThemeContent = (themeId: string) => {
    // 默认学习词汇（通用）- 30个
    const defaultWords = [
      { id: `${themeId}_w1`, char: '学习', pinyin: ['xué', 'xí'], english: 'study/learn' },
      { id: `${themeId}_w2`, char: '练习', pinyin: ['liàn', 'xí'], english: 'practice' },
      { id: `${themeId}_w3`, char: '听', pinyin: ['tīng'], english: 'listen' },
      { id: `${themeId}_w4`, char: '说', pinyin: ['shuō'], english: 'speak' },
      { id: `${themeId}_w5`, char: '读', pinyin: ['dú'], english: 'read' },
      { id: `${themeId}_w6`, char: '写', pinyin: ['xiě'], english: 'write' },
      { id: `${themeId}_w7`, char: '看', pinyin: ['kàn'], english: 'look/watch' },
      { id: `${themeId}_w8`, char: '理解', pinyin: ['lǐ', 'jiě'], english: 'understand' },
      { id: `${themeId}_w9`, char: '记住', pinyin: ['jì', 'zhù'], english: 'remember' },
      { id: `${themeId}_w10`, char: '说话', pinyin: ['shuō', 'huà'], english: 'talk/speak' },
      { id: `${themeId}_w11`, char: '中文', pinyin: ['zhōng', 'wén'], english: 'Chinese' },
      { id: `${themeId}_w12`, char: '汉字', pinyin: ['hàn', 'zì'], english: 'Chinese character' },
      { id: `${themeId}_w13`, char: '拼音', pinyin: ['pīn', 'yīn'], english: 'pinyin' },
      { id: `${themeId}_w14`, char: '意思', pinyin: ['yì', 'si'], english: 'meaning' },
      { id: `${themeId}_w15`, char: '发音', pinyin: ['fā', 'yīn'], english: 'pronunciation' },
      { id: `${themeId}_w16`, char: '句子', pinyin: ['jù', 'zi'], english: 'sentence' },
      { id: `${themeId}_w17`, char: '单词', pinyin: ['dān', 'cí'], english: 'word' },
      { id: `${themeId}_w18`, char: '对话', pinyin: ['duì', 'huà'], english: 'dialogue' },
      { id: `${themeId}_w19`, char: '问题', pinyin: ['wèn', 'tí'], english: 'question' },
      { id: `${themeId}_w20`, char: '回答', pinyin: ['huí', 'dá'], english: 'answer' },
      { id: `${themeId}_w21`, char: '朋友', pinyin: ['péng', 'you'], english: 'friend' },
      { id: `${themeId}_w22`, char: '老师', pinyin: ['lǎo', 'shī'], english: 'teacher' },
      { id: `${themeId}_w23`, char: '学生', pinyin: ['xué', 'sheng'], english: 'student' },
      { id: `${themeId}_w24`, char: '时间', pinyin: ['shí', 'jiān'], english: 'time' },
      { id: `${themeId}_w25`, char: '今天', pinyin: ['jīn', 'tiān'], english: 'today' },
      { id: `${themeId}_w26`, char: '明天', pinyin: ['míng', 'tiān'], english: 'tomorrow' },
      { id: `${themeId}_w27`, char: '现在', pinyin: ['xiàn', 'zài'], english: 'now' },
      { id: `${themeId}_w28`, char: '开始', pinyin: ['kāi', 'shǐ'], english: 'start' },
      { id: `${themeId}_w29`, char: '结束', pinyin: ['jié', 'shù'], english: 'end' },
      { id: `${themeId}_w30`, char: '重要', pinyin: ['zhòng', 'yào'], english: 'important' },
    ];

    // 默认句子
    const defaultSentences = [
      { id: `${themeId}_s1`, text: '我在学习中文', pinyin: 'wǒ zài xué xí zhōng wén', english: 'I am learning Chinese' },
      { id: `${themeId}_s2`, text: '请跟我读', pinyin: 'qǐng gēn wǒ dú', english: 'Please read after me' },
      { id: `${themeId}_s3`, text: '这个怎么说？', pinyin: 'zhè ge zěn me shuō?', english: 'How do you say this?' },
      { id: `${themeId}_s4`, text: '我不太懂', pinyin: 'wǒ bù tài dǒng', english: 'I do not quite understand' },
      { id: `${themeId}_s5`, text: '请再说一遍', pinyin: 'qǐng zài shuō yí biàn', english: 'Please say it again' },
      { id: `${themeId}_s6`, text: '我记住了', pinyin: 'wǒ jì zhù le', english: 'I remember it' },
      { id: `${themeId}_s7`, text: '我们要多练习', pinyin: 'wǒ men yào duō liàn xí', english: 'We need to practice more' },
      { id: `${themeId}_s8`, text: '看视频学习', pinyin: 'kàn shì pín xué xí', english: 'Learn by watching videos' },
      { id: `${themeId}_s9`, text: '你明白了吗？', pinyin: 'nǐ míng bai le ma?', english: 'Do you understand?' },
      { id: `${themeId}_s10`, text: '一起加油吧', pinyin: 'yì qǐ jiā yóu ba', english: 'Let us work hard together' },
    ];

    return { words: defaultWords, sentences: defaultSentences };
  };

  // 创建自定义主题
  const handleCreateTheme = () => {
    if (!newThemeName.trim() || !newThemeVideo.trim()) {
      alert('Please enter theme name and video link');
      return;
    }

    const videoId = extractYouTubeId(newThemeVideo.trim());
    if (!videoId) {
      alert('Please enter a valid YouTube video link');
      return;
    }

    // 生成唯一ID
    const themeId = `custom_${Date.now()}`;
    
    // 根据主题名称生成内容
    const { words, sentences } = generateThemeContent(themeId);
    
    // 创建自定义主题
    const customTheme: Theme = {
      id: themeId,
      name: newThemeName.trim(),
      nameEn: newThemeName.trim(),
      icon: '📖',
      category: 'my',
      description: 'Custom theme',
      words: words,
      levels: [
        {
          id: 1,
          type: 'words',
          words: words,
        },
        {
          id: 2,
          type: 'sentences',
          sentences: sentences,
        },
        {
          id: 3,
          type: 'video',
          video: {
            id: `v_${themeId}`,
            videoUrl: `https://www.youtube.com/embed/${videoId}`,
            transcript: '',
            prompts: [],
          },
        },
      ],
    };

    addCustomTheme(customTheme);
    setNewThemeName('');
    setNewThemeVideo('');
    setIsCreating(false);
    alert('Theme created with vocabulary and sentences!');
  };

  // 合并所有主题（预设 + 自定义）
  const allThemes = [...themes.filter(t => t.id !== 'coming_soon'), ...customThemes];

  // 过滤主题
  const filteredThemes = allThemes.filter(t => {
    if (activeCategory === 'my') {
      // 我的主题：只显示自定义主题
      return customThemes.some(ct => ct.id === t.id);
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
  const handleCategoryChange = (category: ThemeCategory | 'my') => {
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
            📝 Guestbook
          </button>
        </div>

        {/* 我的主题 - 创建表单 */}
        {activeCategory === 'my' && (
          <div style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 12 }}>
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                ➕ Create New Theme
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Theme name (e.g., Mountain Climbing)"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <input
                  type="text"
                  placeholder="Paste YouTube video link"
                  value={newThemeVideo}
                  onChange={(e) => setNewThemeVideo(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCreateTheme}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewThemeName('');
                      setNewThemeVideo('');
                    }}
                    style={{
                      padding: '12px 20px',
                      background: '#f5f5f5',
                      color: '#666',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {paginatedThemes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#999',
            fontSize: 16 
          }}>
            {activeCategory === 'my' ? 'Click above to create your first theme' : 'No themes in this category'}
          </div>
        ) : (
          <>
            <div className="themes-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {paginatedThemes.map((theme) => {
                const completed = isThemeCompleted(theme.id);
                const isLocked = checkThemeLocked(theme.id);
                const isCustom = customThemes.some(ct => ct.id === theme.id);

                return (
                  <div
                    key={theme.id}
                    style={{
                      padding: 20,
                      background: completed ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : (isLocked ? '#f5f5f5' : 'white'),
                      cursor: isLocked ? 'default' : 'pointer',
                      minHeight: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 16,
                      boxShadow: isLocked ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                      opacity: isLocked ? 0.6 : 1,
                      position: 'relative',
                    }}
                  >
                    {/* 删除按钮（仅自定义主题显示） */}
                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定删除这个主题吗？')) {
                            deleteCustomTheme(theme.id);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'transparent',
                          border: 'none',
                          fontSize: 16,
                          cursor: 'pointer',
                          opacity: 0.5,
                        }}
                        title="删除主题"
                      >
                        🗑️
                      </button>
                    )}
                    
                    <div 
                      onClick={() => !isLocked && handleSelectTheme(theme)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}
                    >
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
      </div>

      {/* 产品说明 */}
      <div className="themes-section" style={{ marginTop: 32 }}>
        <div className="card" style={{ textAlign: 'left', lineHeight: 1.8, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>About This App</div>
          <p style={{ marginBottom: 12 }}>🎯 <strong>Comprehensible Input</strong> - Learn in real contexts, understanding matters more than memorization</p>
          <p style={{ marginBottom: 12 }}>🏠 <strong>Scenario-based Learning</strong> - Restaurants, hotels, driving... covering daily life scenarios</p>
          <p style={{ marginBottom: 12 }}>📚 <strong>High-frequency Words</strong> - Curated most common everyday vocabulary</p>
          <p style={{ marginBottom: 12 }}>👂 Listen → 👄 Practice → 📖 Watch in context, master practical expressions in 3 steps</p>
        </div>
      </div>
    </div>
  );
}