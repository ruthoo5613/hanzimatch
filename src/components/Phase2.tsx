import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types';

const BOARD_SIZE = 4;

export function Phase2() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();

  const [board, setBoard] = useState<{ id: string; char: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showCard, setShowCard] = useState<Word | null>(null);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const levelWordObjects = currentTheme?.words.filter(w => levelWords.includes(w.id)) || [];

  // Initialize board
  useEffect(() => {
    if (levelWordObjects.length === 0) return;

    // Each target word appears twice
    const targetTiles: { id: string; char: string }[] = [];
    levelWordObjects.forEach(word => {
      targetTiles.push({ id: word.id, char: word.char });
      targetTiles.push({ id: word.id, char: word.char });
    });

    // Distractor words from other words in current theme
    const otherWords = currentTheme!.words.filter(w => !levelWords.includes(w.id));
    const distractorCount = 16 - targetTiles.length;
    const distractorTiles: { id: string; char: string }[] = [];
    
    for (let i = 0; i < distractorCount; i++) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      distractorTiles.push({ id: randomWord.id, char: randomWord.char });
    }

    const allTiles = [...targetTiles, ...distractorTiles].sort(() => Math.random() - 0.5);
    setBoard(allTiles);
  }, [levelWordObjects, levelWords, currentTheme]);

  const handleCellClick = (index: number) => {
    if (foundWords.includes(board[index].id)) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      setHintIndex(index);
      setTimeout(() => setHintIndex(null), 1000);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    if (board[selectedIndex].id === board[index].id) {
      const wordId = board[index].id;
      const word = levelWordObjects.find(w => w.id === wordId);
      
      if (word) {
        setFoundWords(prev => [...prev, wordId]);
        addLearnedWord(word);
        setShowCard(word);
        speak(word.char);
      }
      
      setSelectedIndex(null);
    } else {
      setSelectedIndex(index);
      setHintIndex(index);
      setTimeout(() => setHintIndex(null), 1000);
    }
  };

  useEffect(() => {
    if (foundWords.length === levelWordObjects.length && levelWordObjects.length > 0) {
      setTimeout(() => setPhase('phase3'), 1000);
    }
  }, [foundWords, levelWordObjects.length, setPhase]);

  const handleRestart = () => {
    setFoundWords([]);
    setSelectedIndex(null);
    
    if (levelWordObjects.length === 0) return;

    const targetTiles: { id: string; char: string }[] = [];
    levelWordObjects.forEach(word => {
      targetTiles.push({ id: word.id, char: word.char });
      targetTiles.push({ id: word.id, char: word.char });
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
        Find matching pairs of words!
      </p>

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

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={handleRestart}>
          🔄 Restart
        </button>
      </div>

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
