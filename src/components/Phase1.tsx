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
  }, [currentTheme, targetWord, currentWordIndex, speak]);

  const handleSelect = (word: Word) => {
    if (selectedOption !== null) return;

    setSelectedOption(word.id);
    
    if (word.id === targetWord?.id) {
      setIsCorrect(true);
      addLearnedWord(targetWord);
      
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
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
      </div>

      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>
          🎧 Listen and choose
        </p>

        <button
          onClick={() => speak(targetWord.char)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 50,
            width: 80,
            height: 80,
            fontSize: 32,
            cursor: 'pointer',
            marginBottom: 24,
            boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
            transition: 'transform 0.2s ease',
          }}
        >
          🔊
        </button>

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
                style={{
                  padding: '24px 16px',
                  fontSize: 28,
                  fontWeight: 600,
                }}
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
