import { useState } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useRecorder } from '../hooks/useRecorder';

export function Phase3() {
  const { currentTheme, currentLevel, completeLevel, unlockTheme } = useGameStore();
  const { speak } = useSpeech();
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording } = useRecorder();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [_recorded, setRecorded] = useState(false);

  // 获取当前关卡的字
  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const wordsToPractice = currentTheme?.words.filter(w => levelWords.includes(w.id)) || [];
  const currentWord = wordsToPractice[currentIndex];

  // 完成后解锁下一主题
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
    setRecorded(false);
    
    if (currentIndex < wordsToPractice.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 完成了
      handleComplete();
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

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40 }}>
          Practice speaking!
        </p>

        {/* 当前要读的词 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 8 }}>
            {currentWord.char}
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {currentWord.pinyin}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => speak(currentWord.char)}
            style={{ fontSize: 18, padding: '12px 24px' }}
          >
            🔊 Play
          </button>
        </div>

        {/* 录音按钮 */}
        <div style={{ marginBottom: 40 }}>
          <button
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              background: isRecording ? 'var(--error)' : 'var(--secondary)',
              color: 'white'
            }}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12 }}>
            {isRecording ? 'Recording... Click to stop' : 'Click to record'}
          </p>
        </div>

        {/* 播放录音 */}
        {audioUrl && !isRecording && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Your recording:
            </p>
            <audio src={audioUrl} controls style={{ width: '100%' }} />
          </div>
        )}

        {/* 继续按钮 */}
        {audioUrl && !isRecording && (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ fontSize: 18, padding: '14px 32px' }}
          >
            {currentIndex < wordsToPractice.length - 1 ? 'Next Word →' : 'Finish ✓'}
          </button>
        )}
      </div>
    </div>
  );
}
