import { useState } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useRecorder } from '../hooks/useRecorder';

export function Phase3() {
  const { currentTheme, currentLevel, completeLevel, unlockTheme, setPhase } = useGameStore();
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
    
    // 解锁下一个主题
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
      // 返回首页
      setPhase('home');
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
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
      </div>

      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>
          🎤 Practice speaking
        </p>

        <div style={{ 
          background: 'white',
          borderRadius: 20,
          padding: '28px 20px',
          marginBottom: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ 
            fontSize: 56, 
            fontWeight: 700, 
            marginBottom: 6,
            color: 'var(--text-primary)',
            letterSpacing: '6px',
          }}>
            {currentWord.char}
          </div>
          <div style={{ fontSize: 18, color: 'var(--primary)', marginBottom: 4 }}>
            {currentWord.pinyin}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {currentWord.english}
          </div>
        </div>

        <button
          onClick={() => speak(currentWord.char)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 50,
            width: 56,
            height: 56,
            fontSize: 24,
            cursor: 'pointer',
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          }}
        >
          🔊
        </button>

        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleRecord}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: 'none',
              background: isRecording ? 'var(--error)' : 'linear-gradient(135deg, #FF9800, #F57C00)',
              color: 'white',
              fontSize: 32,
              cursor: 'pointer',
              boxShadow: isRecording 
                ? '0 4px 20px rgba(244, 67, 54, 0.4)' 
                : '0 4px 20px rgba(255, 152, 0, 0.4)',
              animation: isRecording ? 'pulse 1s infinite' : 'none',
            }}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>
            {isRecording ? 'Tap to stop' : 'Tap to speak'}
          </p>
        </div>

        {showSuccess && !isRecording && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '10px 20px',
            borderRadius: 10,
            marginBottom: 16,
            fontWeight: 600,
            fontSize: 14,
          }}>
            ✓ Recorded!
          </div>
        )}

        {audioUrl && !isRecording && (
          <div style={{ marginBottom: 16 }}>
            <audio src={audioUrl} controls style={{ width: '100%', height: 36 }} />
          </div>
        )}

        {audioUrl && !isRecording && (
          <button
            onClick={handleNext}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 40px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
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
