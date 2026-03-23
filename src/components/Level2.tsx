import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';

export function Level2() {
  const { currentSentences, setPhase } = useGameStore();
  const { speak } = useSpeech();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const currentSentence = currentSentences[currentIndex];

  useEffect(() => {
    if (currentSentence && currentIndex === 0) {
      setTimeout(() => speak(currentSentence.text), 500);
    }
  }, [currentSentence]);

  if (!currentSentence || currentSentences.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>No sentences to practice</p>
        <button onClick={() => setPhase('home')}>Back</button>
      </div>
    );
  }

  const handleSpeak = () => {
    speak(currentSentence.text);
  };

  const handleNext = () => {
    if (currentIndex < currentSentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScore(null);
      setShowResult(false);
      setTimeout(() => speak(currentSentences[currentIndex + 1].text), 500);
    } else {
      // 完成第2关，进入第3关
      setPhase('level3');
    }
  };

  const handleBack = () => {
    setPhase('level1');
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#757575' }}>第2关</div>
          <div style={{ fontWeight: 600 }}>句型练习</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
        {currentSentences.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i <= currentIndex ? '#2196F3' : '#E0E0E0',
            }}
          />
        ))}
      </div>

      {/* Sentence Card */}
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, lineHeight: 1.5 }}>
          {currentSentence.text}
        </div>
        <div style={{ fontSize: 18, color: '#2196F3', marginBottom: 8 }}>
          {currentSentence.pinyin}
        </div>
        <div style={{ fontSize: 16, color: '#757575', marginBottom: 32 }}>
          {currentSentence.english}
        </div>

        {/* Speak Button */}
        <button
          onClick={handleSpeak}
          style={{
            padding: '16px 32px',
            fontSize: 18,
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          🔊 播放句子
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
              {score >= 60 ? '说得好！' : '再练习一下吧'}
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
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          {currentIndex < currentSentences.length - 1 ? '下一句 →' : '进入第3关 →'}
        </button>
      </div>
    </div>
  );
}
