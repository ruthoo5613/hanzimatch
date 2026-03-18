import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { Word } from '../types';

export function Phase1() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 获取当前关卡的字
  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const targetWord = currentTheme?.words.find(w => w.id === levelWords[currentWordIndex]);

  // 生成选项（正确答案 + 3个随机干扰项）
  useEffect(() => {
    if (!currentTheme || !targetWord) return;

    const others = currentTheme.words
      .filter(w => w.id !== targetWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const shuffled = [targetWord, ...others].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    
    // 自动播放发音
    setTimeout(() => speak(targetWord.char), 500);
  }, [currentTheme, targetWord, currentWordIndex]);

  const handleSelect = (word: Word) => {
    if (selectedOption !== null) return; // 已选择

    setSelectedOption(word.id);
    
    if (word.id === targetWord?.id) {
      setIsCorrect(true);
      addLearnedWord(targetWord);
      
      // 正确后延迟进入下一个
      setTimeout(() => {
        if (currentWordIndex < levelWords.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setSelectedOption(null);
          setIsCorrect(null);
        } else {
          // 本关所有词学完了，进入三消阶段
          setPhase('phase2');
        }
      }, 1000);
    } else {
      setIsCorrect(false);
      // 错误后重置
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        speak(targetWord?.char || '');
      }, 1000);
    }
  };

  if (!currentTheme || !targetWord) return null;

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
        <div className="game-progress">{currentWordIndex + 1} / {levelWords.length}</div>
      </div>

      <div className="phase-indicator">
        {[1, 2, 3].map(phase => (
          <div key={phase} className={`phase-dot ${phase === 1 ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Listen and choose the correct character
        </p>

        <button
          className="btn btn-primary"
          onClick={() => speak(targetWord.char)}
          style={{ marginBottom: 40, fontSize: 20, padding: '16px 32px' }}
        >
          🔊 Listen
        </button>

        <div className="options-grid">
          {options.map((word) => {
            let className = 'option-btn';
            if (selectedOption === word.id) {
              className += word.id === targetWord.id ? ' correct' : ' wrong';
            }
            
            return (
              <button
                key={word.id}
                className={className}
                onClick={() => handleSelect(word)}
                disabled={selectedOption !== null}
              >
                {word.char}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
