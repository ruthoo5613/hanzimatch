import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types';

const CORRECT_MESSAGES = ['Great! 🎉', 'Awesome! ⭐', 'Excellent! 💪', 'Well done! 👏', 'Perfect! ✨'];

export function Phase1() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [_isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [激励消息, set激励消息] = useState<string>('');
  const [show激励, setShow激励] = useState(false);

  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const targetWord = currentTheme?.words.find(w => w.id === levelWords[currentWordIndex]);

  useEffect(() => {
    if (!currentTheme || !targetWord) return;

    const others = currentTheme.words
      .filter(w => w.id !== targetWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const shuffled = [targetWord, ...others].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    
    setTimeout(() => speak(targetWord.char), 500);
  }, [currentTheme, targetWord, currentWordIndex]);

  const handleSelect = (word: Word) => {
    if (selectedOption !== null) return;

    setSelectedOption(word.id);
    
    if (word.id === targetWord?.id) {
      setIsCorrect(true);
      addLearnedWord(targetWord);
      
      // 随机激励消息
      const msg = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
      set激励消息(msg);
      setShow激励(true);
      
      setTimeout(() => {
        setShow激励(false);
        if (currentWordIndex < levelWords.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setSelectedOption(null);
          setIsCorrect(null);
        } else {
          setPhase('phase2');
        }
      }, 1200);
    } else {
      setIsCorrect(false);
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

        {/* 激励消息 */}
        {show激励 && (
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: 20,
            animation: 'bounce 0.5s ease',
          }}>
            {激励消息}
          </div>
        )}

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

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
