import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';

export function Level1() {
  const { currentWords, setPhase } = useGameStore();
  const { speak } = useSpeech();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const currentWord = currentWords[currentIndex];
  
  useEffect(() => {
    // 自动播放第一个词的发音
    if (currentWord && currentIndex === 0) {
      setTimeout(() => speak(currentWord.char), 500);
    }
  }, [currentWord]);

  if (!currentWord) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>No words to learn</p>
        <button onClick={() => setPhase('home')}>Back</button>
      </div>
    );
  }

  const handleSpeak = () => {
    speak(currentWord.char);
  };

  const handleNext = () => {
    if (currentIndex < currentWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScore(null);
      setShowResult(false);
      setTimeout(() => speak(currentWords[currentIndex + 1].char), 500);
    } else {
      // 完成第1关，进入第2关
      setPhase('level2');
    }
  };

  const handleBack = () => {
    setPhase('home');
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#757575' }}>第1关</div>
          <div style={{ fontWeight: 600 }}>词汇学习</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
        {currentWords.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i <= currentIndex ? '#4CAF50' : '#E0E0E0',
            }}
          />
        ))}
      </div>

      {/* Word Card */}
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 80, fontWeight: 700, marginBottom: 16 }}>
          {currentWord.char}
        </div>
        <div style={{ fontSize: 24, color: '#4CAF50', marginBottom: 8 }}>
          {currentWord.pinyin}
        </div>
        <div style={{ fontSize: 18, color: '#757575', marginBottom: 32 }}>
          {currentWord.english}
        </div>

        {/* Speak Button */}
        <button
          onClick={handleSpeak}
          style={{
            padding: '16px 32px',
            fontSize: 18,
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          🔊 播放发音
        </button>

        {/* Result Feedback */}
        {showResult && score !== null && (
          <div style={{ 
            marginTop: 20, 
            padding: 16, 
            borderRadius: 12,
            background: score >= 60 ? '#E8F5E9' : '#FFEBEE',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              {score >= 60 ? '✅' : '❌'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              评分: {score}
            </div>
            <div style={{ fontSize: 14, color: '#757575', marginTop: 4 }}>
              {score >= 60 ? '发音不错！' : '再试一次吧'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 40, left: 20, right: 20 }}>
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: 16,
            fontSize: 18,
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          {currentIndex < currentWords.length - 1 ? '下一个 →' : '进入第2关 →'}
        </button>
      </div>
    </div>
  );
}
