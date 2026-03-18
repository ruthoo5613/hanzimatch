import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { Word } from '../types';

const BOARD_SIZE = 4; // 4x4 = 16 格

export function Phase2() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();

  const [board, setBoard] = useState<{ id: string; char: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showCard, setShowCard] = useState<Word | null>(null);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  // 获取当前关卡的字
  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const levelWordObjects = currentTheme?.words.filter(w => levelWords.includes(w.id)) || [];

  // 初始化棋盘
  useEffect(() => {
    if (levelWordObjects.length === 0) return;

    // 每个目标词显示 2 次
    const targetTiles: { id: string; char: string }[] = [];
    levelWordObjects.forEach(word => {
      targetTiles.push({ id: word.id, char: word.char });
      targetTiles.push({ id: word.id, char: word.char });
    });

    // 干扰词：从当前主题的其他字中随机选
    const otherWords = currentTheme!.words.filter(w => !levelWords.includes(w.id));
    const干扰词数量 = 16 - targetTiles.length; // 16 - 6 = 10
    const干扰Tiles: { id: string; char: string }[] = [];
    
    for (let i = 0; i < 干扰词数量; i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      干扰Tiles.push({ id: randomWord.id, char: randomWord.char });
    }

    // 混合并随机打乱
    const allTiles = [...targetTiles, ...干扰Tiles].sort(() => Math.random() - 0.5);
    setBoard(allTiles);
  }, [levelWordObjects, levelWords, currentTheme]);

  // 处理点击
  const handleCellClick = (index: number) => {
    if (foundWords.includes(board[index].id)) return; // 已经找到的词

    // 第一次点击
    if (selectedIndex === null) {
      setSelectedIndex(index);
      // 高亮显示提示
      setHintIndex(index);
      setTimeout(() => setHintIndex(null), 1000);
      return;
    }

    // 第二次点击同一个 -> 取消
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    // 检查是否是相同的词（id相同）
    if (board[selectedIndex].id === board[index].id) {
      // 找到了一对！
      const wordId = board[index].id;
      const word = levelWordObjects.find(w => w.id === wordId);
      
      if (word) {
        // 标记为已找到
        setFoundWords(prev => [...prev, wordId]);
        
        // 显示学习卡片
        addLearnedWord(word);
        setShowCard(word);
        speak(word.char);
      }
      
      setSelectedIndex(null);
    } else {
      // 不同词，取消选择
      setSelectedIndex(index);
      setHintIndex(index);
      setTimeout(() => setHintIndex(null), 1000);
    }
  };

  // 检查是否通关（3个词都找到）
  useEffect(() => {
    if (foundWords.length === levelWordObjects.length && levelWordObjects.length > 0) {
      setTimeout(() => setPhase('phase3'), 1000);
    }
  }, [foundWords, levelWordObjects.length, setPhase]);

  // 重新开始本关
  const handleRestart = () => {
    setFoundWords([]);
    setSelectedIndex(null);
    // 重新初始化棋盘
    if (levelWordObjects.length === 0) return;

    const targetTiles: { id: string; char: string }[] = [];
    levelWordObjects.forEach(word => {
      targetTiles.push({ id: word.id, char: word.char });
      targetTiles.push({ id: word.id, char: word.char });
    });

    const otherWords = currentTheme!.words.filter(w => !levelWords.includes(w.id));
    const干扰词数量 = 16 - targetTiles.length;
    const干扰Tiles: { id: string; char: string }[] = [];
    
    for (let i = 0; i < 干扰词数量; i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      干扰Tiles.push({ id: randomWord.id, char: randomWord.char });
    }

    const allTiles = [...targetTiles, ...干扰Tiles].sort(() => Math.random() - 0.5);
    setBoard(allTiles);
  };

  if (!currentTheme) return null;

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
        <div className="game-progress">Found: {foundWords.length} / {levelWordObjects.length}</div>
      </div>

      <div className="phase-indicator">
        {[1, 2, 3].map(phase => (
          <div key={phase} className={`phase-dot ${phase === 2 ? 'active' : ''}`} />
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 10 }}>
        Find matching pairs of words!
      </p>

      {/* 进度指示 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        {levelWordObjects.map(word => (
          <div
            key={word.id}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: foundWords.includes(word.id) ? 'var(--success)' : '#E0E0E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: foundWords.includes(word.id) ? 'white' : '#999',
            }}
          >
            {foundWords.includes(word.id) ? '✓' : word.char[0]}
          </div>
        ))}
      </div>

      <div className="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {board.map((cell, index) => {
          const isFound = foundWords.includes(cell.id);
          const isSelected = selectedIndex === index;
          const isHint = hintIndex === index;
          
          return (
            <div
              key={index}
              className={`board-cell ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCellClick(index)}
              style={{
                opacity: isFound ? 0.3 : 1,
                background: isHint ? '#FFE082' : isSelected ? 'var(--primary-light)' : '#F5F5F5',
              }}
            >
              {cell.char}
            </div>
          );
        })}
      </div>

      {/* 重新开始按钮 */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={handleRestart}>
          🔄 Restart
        </button>
      </div>

      {/* 学习卡片弹窗 */}
      {showCard && (
        <div className="word-card" onClick={() => setShowCard(null)}>
          <div className="word-card-content" onClick={e => e.stopPropagation()}>
            <div className="word-char">{showCard.char}</div>
            <div className="word-pinyin">{showCard.pinyin}</div>
            <div className="word-english">{showCard.english}</div>
            <div className="word-actions">
              <button className="word-btn speak" onClick={() => speak(showCard.char)}>
                <span className="word-btn-icon">🔊</span>
                <span className="word-btn-text">Listen</span>
              </button>
              <button className="word-btn close" onClick={() => setShowCard(null)}>
                <span className="word-btn-icon">✓</span>
                <span className="word-btn-text">Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
