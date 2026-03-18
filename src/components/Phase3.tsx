import { useState } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useRecorder } from '../hooks/useRecorder';

export function Phase3() {
  const { currentTheme, currentLevel, completeLevel, unlockTheme } = useGameStore();
  const { speak } = useSpeech();
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording } = useRecorder();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const wordsToPractice = currentTheme?.words.filter(w => levelWords.includes(w.id)) || [];
  const currentWord = wordsToPractice[currentIndex];

  const handleComplete = () => {
    if (!currentTheme) return;
    
    completeLevel(currentTheme.id, currentLevel);
    
    if (currentLevel === 3) {
      if (currentTheme.id === 'scenic') {
        unlockTheme('restaurant');
      } else if (currentTheme.id === 'restaurant') {
        unlockTheme('taxi');
      }
    }
  };

  const handleNext = () => {
    clearRecording();
    
    if (currentIndex < wordsToPractice.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowSuccess(false);
    } else {
      handleComplete();
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      setShowSuccess(true);
    } else {
      startRecording();
    }
  };

  if (!currentTheme || !currentWord) return null;

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
        <div className="game-progress">{currentIndex + 1} / {wordsToPractice.length}</div>
      </div>

      <div className="phase-indicator">
        {[1, 2, 3].map(phase => (
          <div key={phase} className={`phase-dot ${phase === 3 ? 'active' : 'completed'}`} />
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>
          🎤 Practice speaking
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {wordsToPractice.map((word, idx) => (
            <div
              key={word.id}
              style={{
                width: idx === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: idx < currentIndex ? 'var(--primary)' : idx === currentIndex ? 'var(--primary)' : '#E0E0E0',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Word Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '32px 24px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ 
            fontSize: 72, 
            fontWeight: 700, 
            marginBottom: 8,
            color: 'var(--text-primary)',
            letterSpacing: '8px',
          }}>
            {currentWord.char}
          </div>
          <div style={{ fontSize: 20, color: 'var(--primary)', marginBottom: 8 }}>
            {currentWord.pinyin}
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
            {currentWord.english}
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={() => speak(currentWord.char)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 50,
            width: 64,
            height: 64,
            fontSize: 28,
            cursor: 'pointer',
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            transition: 'transform 0.2s ease',
          }}
        >
          🔊
        </button>

        {/* Mic Button */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={handleRecord}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: 'none',
              background: isRecording ? 'var(--error)' : 'linear-gradient(135deg, #FF9800, #F57C00)',
              color: 'white',
              fontSize: 36,
              cursor: 'pointer',
              boxShadow: isRecording 
                ? '0 4px 20px rgba(244, 67, 54, 0.4)' 
                : '0 4px 20px rgba(255, 152, 0, 0.4)',
              animation: isRecording ? 'pulse 1s infinite' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12 }}>
            {isRecording ? 'Tap to stop' : 'Tap to speak'}
          </p>
        </div>

        {/* Success feedback */}
        {showSuccess && !isRecording && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '12px 24px',
            borderRadius: 12,
            marginBottom: 20,
            fontWeight: 600,
          }}>
            ✓ Recorded! Great job!
          </div>
        )}

        {/* Audio player */}
        {audioUrl && !isRecording && (
          <div style={{ marginBottom: 24 }}>
            <audio 
              src={audioUrl} 
              controls 
              style={{ width: '100%', height: 40 }} 
            />
          </div>
        )}

        {/* Continue Button */}
        {audioUrl && !isRecording && (
          <button
            onClick={handleNext}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '16px 48px',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {currentIndex < wordsToPractice.length - 1 ? 'Next →' : 'Finish ✓'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
