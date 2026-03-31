import { useGameStore } from '../hooks/useGame';
import { useReviewStore } from '../hooks/useReview';

export function Result() {
  const { 
    currentTheme, 
    currentLevel, 
    setPhase,
    isThemeCompleted,
    currentWords,
    currentSentences,
  } = useGameStore();
  const { learnWord } = useReviewStore();

  if (!currentTheme) return null;

  const themeComplete = isThemeCompleted(currentTheme.id);
  
  // 根据关卡类型获取实际学习的词汇/句子
  const getLearnedItems = () => {
    if (!currentTheme) return [];
    
    if (currentLevel === 1) {
      // 第1关：词汇学习
      return currentWords.length > 0 ? currentWords : [];
    } else if (currentLevel === 2) {
      // 第2关：句子练习
      return currentSentences.length > 0 ? currentSentences : [];
    } else if (currentLevel === 3) {
      // 第3关：视频学习 - 显示第1关的词汇
      const level1 = currentTheme.levels.find(l => l.id === 1);
      return level1?.words || [];
    }
    return [];
  };
  
  const learnedItems = getLearnedItems();
  
  // 获取关卡名称
  const getLevelName = () => {
    if (currentLevel === 1) return '词汇学习';
    if (currentLevel === 2) return '句型练习';
    if (currentLevel === 3) return '情景化学习';
    return `第${currentLevel}关`;
  };

  // 学习新词时自动添加到复习系统
  const handleLearnWords = () => {
    learnedItems.forEach((item: any) => {
      const pinyinStr = Array.isArray(item.pinyin) ? item.pinyin.join(' ') : (typeof item.pinyin === 'string' ? item.pinyin : '');
      learnWord({
        id: item.id,
        char: item.char || item.text || '',
        pinyin: pinyinStr,
        english: item.english,
      });
    });
  };

  // 主题完成时学习所有词
  const handleThemeComplete = () => {
    if (currentTheme) {
      currentTheme.words.forEach(word => {
        const pinyinStr = Array.isArray(word.pinyin) ? word.pinyin.join(' ') : (typeof word.pinyin === 'string' ? word.pinyin : '');
        learnWord({
          id: word.id,
          char: word.char,
          pinyin: pinyinStr,
          english: word.english,
        });
      });
    }
  };

  const handleNextLevel = () => {
    handleLearnWords();
    if (currentLevel < 3) {
      useGameStore.getState().setLevel(currentLevel + 1);
      if (currentLevel === 1) {
        setPhase('level2');
      } else if (currentLevel === 2) {
        setPhase('level3');
      }
    } else {
      handleThemeComplete();
      setPhase('home');
    }
  };

  const handleBackHome = () => {
    // 主题完成后直接返回首页
    setPhase('home');
  };

  return (
    <div className="result-page" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
        {themeComplete ? '🎊 主题完成！' : `✅ 第${currentLevel}关完成！`}
      </h1>
      <p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        {themeComplete 
          ? `你完成了「${currentTheme.name}」主题的所有学习！`
          : `完成${getLevelName()}，学习了 ${learnedItems.length} 个内容`
        }
      </p>

      {/* 学习内容展示 */}
      <div style={{ 
        margin: '24px 0', 
        textAlign: 'left',
        maxWidth: 400,
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#757575' }}>
          {currentLevel === 2 ? '句子列表' : '词汇列表'}
        </div>
        <div style={{ 
          background: '#f5f5f5', 
          borderRadius: 12, 
          padding: 12,
          maxHeight: 200,
          overflow: 'auto'
        }}>
          {learnedItems.length > 0 ? (
            learnedItems.map((item: any) => (
              <div 
                key={item.id}
                style={{
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: 8,
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600 }}>{(item as any).char || (item as any).text}</span>
                <span style={{ fontSize: 12, color: '#9E9E9E' }}>{item.english}</span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
              暂无内容
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        {themeComplete ? (
          <button 
            onClick={handleBackHome}
            style={{
              padding: '14px 48px',
              fontSize: 16,
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              width: '100%',
              maxWidth: 300,
            }}
          >
            🏠 返回首页
          </button>
        ) : (
          <button 
            onClick={handleNextLevel}
            style={{
              padding: '14px 48px',
              fontSize: 16,
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              width: '100%',
              maxWidth: 300,
            }}
          >
            下一关 →
          </button>
        )}
      </div>
    </div>
  );
}