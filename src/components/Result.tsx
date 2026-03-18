import { useGameStore } from '../hooks/useGame';

export function Result() {
  const { 
    currentTheme, 
    currentLevel, 
    learnedWords,
    setPhase,
    isLevelCompleted,
    isThemeCompleted,
    themes,
  } = useGameStore();

  if (!currentTheme) return null;

  const levelWords = currentTheme.levels[currentLevel - 1].wordIds;
  const levelWordObjects = currentTheme.words.filter(w => levelWords.includes(w.id));
  const completed = isLevelCompleted(currentTheme.id, currentLevel);
  const themeComplete = isThemeCompleted(currentTheme.id);

  const handleNextLevel = () => {
    // 进入下一关
    if (currentLevel < 3) {
      useGameStore.getState().setLevel(currentLevel + 1);
      setPhase('phase1');
    } else {
      // 本主题已完成
      setPhase('home');
    }
  };

  const handleBackHome = () => {
    setPhase('home');
  };

  return (
    <div className="result-page">
      <div className="result-icon">🎉</div>
      <h1 className="result-title">
        {themeComplete ? 'Theme Completed!' : `Level ${currentLevel} Complete!`}
      </h1>
      <p className="result-subtitle">
        {themeComplete 
          ? `You finished all levels in ${currentTheme.name}!`
          : `Great job learning ${levelWordObjects.length} new words!`
        }
      </p>

      <div className="result-words">
        <p className="result-words-title">Words Learned</p>
        <div className="result-words-list">
          {levelWordObjects.map(word => (
            <div key={word.id} className="result-word">
              {word.char} <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {word.english}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="result-actions">
        {currentLevel < 3 && themeComplete && (
          <button className="btn btn-primary" onClick={handleNextLevel}>
            Next Level →
          </button>
        )}
        
        {themeComplete && (
          <button className="btn btn-secondary" onClick={handleBackHome}>
            Back to Home
          </button>
        )}

        {!themeComplete && (
          <button className="btn btn-primary" onClick={handleNextLevel}>
            {currentLevel < 3 ? 'Next Level →' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}
