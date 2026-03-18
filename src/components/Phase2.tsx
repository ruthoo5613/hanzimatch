import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { Word } from '../types';

const BOARD_SIZE = 4; // 4x4 = 16 格

export function Phase2() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();

  const [board, setBoard] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [showCard, setShowCard] = useState<Word | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // 获取当前关卡的字
  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const levelWordObjects = currentTheme?.words.filter(w => levelWords.includes(w.id)) || [];

  // 初始化棋盘
  useEffect(() => {
    if (levelWordObjects.length === 0) return;

    // 每个字生成 4 个（4x4=16，3个字刚好）
    const tiles: string[] = [];
    levelWordObjects.forEach(word => {
      for (let i = 0; i < 4; i++) {
        tiles.push(word.id);
      }
    });

    // 随机打乱
    setBoard(tiles.sort(() => Math.random() - 0.5));
  }, [levelWordObjects]);

  // 检查是否有匹配
  const checkMatch = useCallback((newBoard: string[], index: number) => {
    const charId = newBoard[index];
    if (!charId) return null;

    // 检查水平方向
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;

    // 找同字符连着的
    const matched: number[] = [index];

    // 检查右边
    for (let i = col + 1; i < BOARD_SIZE; i++) {
      if (newBoard[row * BOARD_SIZE + i] === charId) {
        matched.push(row * BOARD_SIZE + i);
      } else {
        break;
      }
    }

    // 检查下边
    for (let i = row + 1; i < BOARD_SIZE; i++) {
      if (newBoard[i * BOARD_SIZE + col] === charId) {
        matched.push(i * BOARD_SIZE + col);
      } else {
        break;
      }
    }

    // 至少3个连在一起
    if (matched.length >= 3) {
      return matched;
    }

    return null;
  }, []);

  // 处理点击
  const handleCellClick = async (index: number) => {
    if (isAnimating || !board[index]) return;

    // 第一次点击
    if (selected === null) {
      setSelected(index);
      return;
    }

    // 第二次点击同一个 -> 取消
    if (selected === index) {
      setSelected(null);
      return;
    }

    // 检查是否是相同的字
    if (board[selected] === board[index]) {
      // 检查是否能形成3连
      const testBoard = [...board];
      testBoard[selected] = '';
      testBoard[index] = '';
      
      const match1 = checkMatch([...board], selected);
      const match2 = checkMatch([...board], index);
      
      if ((match1 && match1.length >= 3) || (match2 && match2.length >= 3)) {
        // 形成匹配！消除
        setIsAnimating(true);
        
        const matchedIndices = match1 && match1.length >= 3 ? match1 : match2;
        if (matchedIndices) {
          const newBoard = [...board];
          matchedIndices.forEach(i => {
            newBoard[i] = '';
          });
          
          // 延迟更新，让用户看到消除效果
          await new Promise(r => setTimeout(r, 300));
          setBoard(newBoard);
          
          // 显示学习卡片
          const word = levelWordObjects.find(w => w.id === board[index]);
          if (word) {
            addLearnedWord(word);
            setShowCard(word);
            speak(word.char);
          }
          
          setMatchedCount(prev => prev + matchedIndices.length);
          setSelected(null);
          setIsAnimating(false);
        }
      } else {
        // 不能形成3连，取消选择
        setSelected(index);
      }
    } else {
      // 不同字符，取消选择
      setSelected(index);
    }
  };

  // 检查是否通关（消除80%以上）
  useEffect(() => {
    const totalTiles = BOARD_SIZE * BOARD_SIZE;
    const emptyTiles = board.filter(t => t === '').length;
    const matchedPercent = (emptyTiles / totalTiles) * 100;
    
    if (matchedPercent >= 80 && board.length > 0) {
      setTimeout(() => setPhase('phase3'), 500);
    }
  }, [board, matchedCount, setPhase]);

  // 填充空位
  useEffect(() => {
    if (board.some(t => t === '')) {
      const timer = setTimeout(() => {
        setBoard(prev => {
          const newBoard = [...prev];
          // 从上方掉落
          for (let col = 0; col < BOARD_SIZE; col++) {
            let emptyRow = -1;
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
              const idx = row * BOARD_SIZE + col;
              if (newBoard[idx] === '' && emptyRow === -1) {
                emptyRow = row;
              } else if (emptyRow !== -1 && newBoard[idx] !== '') {
                // 掉落下来
                newBoard[emptyRow * BOARD_SIZE + col] = newBoard[idx];
                newBoard[idx] = '';
                emptyRow--;
              }
            }
            // 顶部生成新的
            for (let row = 0; row <= emptyRow; row++) {
              const randomWord = levelWordObjects[Math.floor(Math.random() * levelWordObjects.length)];
              newBoard[row * BOARD_SIZE + col] = randomWord.id;
            }
          }
          return newBoard;
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [board, levelWordObjects]);

  if (!currentTheme) return null;

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
        <div className="game-progress">Match: {matchedCount} / 13</div>
      </div>

      <div className="phase-indicator">
        {[1, 2, 3].map(phase => (
          <div key={phase} className={`phase-dot ${phase === 2 ? 'active' : 'completed'}`} />
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 10 }}>
        Match 3 same characters!
      </p>

      <div className="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {board.map((charId, index) => {
          const word = levelWordObjects.find(w => w.id === charId);
          return (
            <div
              key={index}
              className={`board-cell ${selected === index ? 'selected' : ''}`}
              onClick={() => handleCellClick(index)}
            >
              {word?.char || ''}
            </div>
          );
        })}
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
