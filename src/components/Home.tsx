import { useGameStore } from '../hooks/useGame';
import type { Theme } from '../types';

export function Home() {
  const { themes, setTheme, setPhase, isThemeUnlocked, isThemeCompleted } = useGameStore();

  const handleSelectTheme = (theme: Theme) => {
    if (!isThemeUnlocked(theme.id)) return;
    setTheme(theme);
    setPhase('phase1');
  };

  return (
    <div className="home-page">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="home-title" style={{ fontSize: 36, marginBottom: 8 }}>HanziMatch 🀄</h1>
        <p className="home-subtitle">Learn Chinese while playing!</p>
      </div>

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
                style={{
                  padding: 20,
                  background: completed ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : 'white',
                }}
              >
                <span className="theme-icon" style={{ fontSize: 48 }}>{theme.icon}</span>
                <div className="theme-info">
                  <div className="theme-name" style={{ fontSize: 20 }}>{theme.name}</div>
                  <div className="theme-name-en">{theme.nameEn}</div>
                </div>
                {completed && <span className="theme-status">✓</span>}
                {!unlocked && <span className="theme-status locked">🔒</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="themes-section" style={{ marginTop: 32 }}>
        <div className="card" style={{ textAlign: 'left', lineHeight: 1.8, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>How to Play</div>
          <p style={{ marginBottom: 12 }}>🎧 <strong>Listen</strong> - Hear the pronunciation</p>
          <p style={{ marginBottom: 12 }}>👆 <strong>Choose</strong> - Pick the right character</p>
          <p style={{ marginBottom: 12 }}>🎮 <strong>Match</strong> - Find matching words</p>
          <p>🗣️ <strong>Speak</strong> - Practice pronunciation</p>
        </div>
      </div>
    </div>
  );
}
