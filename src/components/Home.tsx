import { useGameStore } from '../hooks/useGame';
import { Theme } from '../types';

export function Home() {
  const { themes, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();

  const handleSelectTheme = (theme: Theme) => {
    if (!isThemeUnlocked(theme.id)) return;
    setTheme(theme);
    setPhase('phase1');
  };

  return (
    <div className="home-page">
      <h1 className="home-title">Chinese Match 🀄</h1>
      <p className="home-subtitle">Learn Chinese while playing!</p>

      <div className="themes-section">
        <h2 className="themes-title">Choose a Topic</h2>
        <div className="themes-list">
          {themes.map((theme) => {
            const unlocked = isThemeUnlocked(theme.id);
            const completed = isThemeCompleted(theme.id);

            return (
              <div
                key={theme.id}
                className={`theme-card ${!unlocked ? 'locked' : ''}`}
                onClick={() => handleSelectTheme(theme)}
              >
                <span className="theme-icon">{theme.icon}</span>
                <div className="theme-info">
                  <div className="theme-name">{theme.name}</div>
                  <div className="theme-name-en">{theme.nameEn}</div>
                </div>
                {completed && <span className="theme-status">✓ Completed</span>}
                {!unlocked && <span className="theme-status locked">🔒 Locked</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="themes-section">
        <h2 className="themes-title">How to Play</h2>
        <div className="card" style={{ textAlign: 'left', lineHeight: 1.8 }}>
          <p>🎧 <strong>Listen & Choose</strong> - Listen to the pronunciation and pick the right character</p>
          <p>🎮 <strong>Match & Learn</strong> - Match 3 same characters to learn new words</p>
          <p>🗣️ <strong>Practice Speaking</strong> - Record your pronunciation and compare</p>
        </div>
      </div>
    </div>
  );
}
