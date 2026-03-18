import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types';

const BOARD_SIZE = 4;

export function Phase2() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();

  const [board, setBoard] = useState<{ id: string; char: string }[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showCard, setShowCard] = useState<Word | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const levelWordObjects = currentTheme?.words.filter(w => levelWords.includes(w.id)) || [];

  // Initialize board - random words covering target words
  useEffect(() => {
    if (levelWordObjects.length === 0) return;

    // Each target word appears at least once, randomly 1-3 times
    const targetTiles: { id: string; char: string }[] = [];
    levelWordObjects.forEach(word => {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 times
      for (let i = 0; i < count; i++) {
        targetTiles.push({ id: word.id, char: word.char });
      }
    });

    // Fill remaining spots with random words from current theme
    const otherWords = currentTheme!.words.filter(w => !levelWords.includes(w.id));
    const filledCount = targetTiles.length;
    const distractorCount = 16 - filledCount;
    const distractorTiles: { id: string; char: string }[] = [];
    
    for (let i = 0; i < distractorCount; i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      distractorTiles.push({ id: randomWord.id, char: randomWord.char });
    }

    const allTiles = [...targetTiles, ...distractorTiles].sort(() => Math.random() - 0.5);
    setBoard(allTiles);
  }, [levelWordObjects, levelWords, currentTheme]);

  const handleCellClick = (wordId: string) => {
    if (foundWords.includes(wordId)) return; // Already found

    setSelectedWordId(wordId);

    // Check if this word is one of the target words
    const isTargetWord = levelWordObjects.some(w => w.id === wordId);

    if (isTargetWord) {
      // Correct!
      setFeedback('correct');
      const word = levelWordObjects.find(w => w.id === wordId);
      
      if (word) {
        addLearnedWord(word);
        setShowCard(word);
        speak(word.char);
      }

      setFoundWords(prev => [...prev, wordId]);
      
      setTimeout(() => {
        setFeedback(null);
        setSelectedWordId(null);
      }, 1500);
    } else {
      // Wrong - show feedback
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setSelectedWordId(null);
      }, 800);
    }
  };

  // Check if passed
  useEffect(() => {
    if (foundWords.length === levelWordObjects.length && levelWordObjects.length > 0) {
      setTimeout(() => setPhase('phase3'), 1000);
    }
  }, [foundWords, levelWordObjects.length, setPhase]);

  // Restart
  const handleRestart = () => {
    setFoundWords([]);
    setSelectedWordId(null);
    setFeedback(null);
    
    if (levelWordObjects.length === 0) return;

    const targetTiles: { id: string; char: string }[] = [];
    levelWordObjects.forEach(word => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        targetTiles.push({ id: word.id, char: word.char });
      }
    });

    const otherWords = currentTheme!.words.filter(w => !levelWords.includes(w.id));
    const distractorCount = 16 - targetTiles.length;
    const distractorTiles: { id: string; char: string }[] = [];
    
    for (let i = 0; i < distractorCount; i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      distractorTiles.push({ id: randomWord.id, char: randomWord.char });
    }

    const allTiles = [...targetTiles, ...distractorTiles].sort(() => Math.random() - 0.5);
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
        Tap on a word to select it!
      </p>

      {/* Feedback */}
      {feedback === 'correct' && (
        <div style={{
          textAlign: 'center',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--success)',
          marginBottom: 10,
          animation: 'bounce 0.5s ease',
        }}>
          Correct! ✅
        </div>
      )}
      {feedback === 'wrong' && (
        <div style={{
          textAlign: 'center',
          fontSize: 18,
          color: 'var(--error)',
          marginBottom: 10,
        }}>
          Try again! ❌
        </div>
      )}

      {/* Progress */}
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

      {/* Board */}
      <div className="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {board.map((cell, index) => {
          const isFound = foundWords.includes(cell.id);
          const isSelected = selectedWordId === cell.id;
          
          return (
            <div
              key={index}
              className="board-cell"
              onClick={() => handleCellClick(cell.id)}
              style={{
                opacity: isFound ? 0.3 : 1,
                background: isSelected 
                  ? (feedback === 'correct' ? '#81C784' : feedback === 'wrong' ? '#E57373' : 'var(--primary-light)')
                  : '#F5F5F5',
              }}
            >
              {cell.char}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={handleRestart}>
          🔄 Restart
        </button>
      </div>

      {/* Learning Card */}
      {showCard && (
        <div className="word-card" onClick={() => setShowCard(null)}>
          <div className="word-card-content" onClick={e => e.stopPropagation()}>
            <div className="word-char">{showCard.char}</div>
            <div className="word-pinyin">{showCard.pinyin}</div>
            <div className="word-english">{showCard.english}</div>
            <div className="word-actions">
              <button className="word-btn speak" onClick={(e) => { e.stopPropagation(); speak(showCard.char); }}>
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

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
