import { useGameStore } from '../hooks/useGame';

export function Result() {
  const { 
    currentTheme, 
    currentLevel, 
    setPhase,
    isThemeCompleted,
  } = useGameStore();

  if (!currentTheme) return null;

  const levelWords = currentTheme.levels[currentLevel - 1].wordIds;
  const levelWordObjects = currentTheme.words.filter(w => levelWords.includes(w.id));
  const themeComplete = isThemeCompleted(currentTheme.id);

  const handleNextLevel = () => {
    if (currentLevel < 3) {
      useGameStore.getState().setLevel(currentLevel + 1);
      setPhase('phase1');
    } else {
      setPhase('home');
    }
  };

  const handleBackHome = () => {
    setPhase('home');
  };

  return (
    <div className="result-page">
      <div className="result-icon" style={{ fontSize: 100 }}>🎉</div>
      <h1 className="result-title" style={{ fontSize: 32 }}>
        {themeComplete ? 'Theme Complete!' : `Level ${currentLevel} Done!`}
      </h1>
      <p className="result-subtitle">
        {themeComplete 
          ? `You mastered ${currentTheme.name}!`
          : `You learned ${levelWordObjects.length} new words!`
        }
      </p>

      <div className="result-words" style={{ margin: '32px 0' }}>
        <p className="result-words-title" style={{ marginBottom: 16 }}>Words Learned</p>
        <div className="result-words-list">
          {levelWordObjects.map(word => (
            <div 
              key={word.id} 
              className="result-word"
              style={{
                padding: '12px 20px',
                fontSize: 18,
              }}
            >
              <div style={{ fontWeight: 600 }}>{word.char}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{word.english}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="result-actions" style={{ gap: 16 }}>
        <button 
          className="btn btn-primary" 
          onClick={handleNextLevel}
          style={{ padding: '16px 48px', fontSize: 18 }}
        >
          {currentLevel < 3 ? 'Next Level →' : 'Continue'}
        </button>
        
        {themeComplete && (
          <button 
            className="btn btn-secondary" 
            onClick={handleBackHome}
            style={{ padding: '14px 32px' }}
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
