import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useRecorder } from '../hooks/useRecorder';
import type { Word } from '../types';

export function Level1() {
  const { currentWords, setPhase } = useGameStore();
  const { speak } = useSpeech();
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording } = useRecorder();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const currentWord = currentWords[currentIndex];
  
  // 自动播放当前词发音
  useEffect(() => {
    if (currentWord) {
      setTimeout(() => speak(currentWord.char), 500);
    }
  }, [currentIndex]);

  if (!currentWord || currentWords.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>No words to learn</p>
        <button onClick={() => setPhase('home')}>Back</button>
      </div>
    );
  }

  const handleSpeak = (word: Word) => {
    speak(word.char);
  };

  const handleRecord = async (_word: Word) => {
    if (isRecording) {
      // 停止录音并评分
      stopRecording();
      // 模拟评分（实际可以用Web Speech API）
      const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100分
      setScore(mockScore);
      setShowResult(true);
    } else {
      // 开始录音
      clearRecording();
      setScore(null);
      setShowResult(false);
      await startRecording();
    }
  };

  const handleNext = () => {
    if (currentIndex < currentWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScore(null);
      setShowResult(false);
      clearRecording();
    } else {
      // 完成第1关，进入第2关
      setPhase('level2');
    }
  };

  const handleBack = () => {
    setPhase('home');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff' }}>
      {/* 左侧：词汇列表 */}
      <div style={{ 
        width: 200, 
        borderRight: '1px solid #E0E0E0', 
        overflowY: 'auto',
        background: '#F5F5F5',
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid #E0E0E0' }}>
          <div style={{ fontSize: 14, color: '#757575' }}>第1关</div>
          <div style={{ fontWeight: 600 }}>词汇学习</div>
        </div>
        
        {currentWords.map((word, index) => (
          <div
            key={word.id}
            onClick={() => {
              setCurrentIndex(index);
              setScore(null);
              setShowResult(false);
              clearRecording();
            }}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E0E0E0',
              cursor: 'pointer',
              background: index === currentIndex ? '#fff' : 'transparent',
              borderLeft: index === currentIndex ? '3px solid #4CAF50' : '3px solid transparent',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
              {word.char}
            </div>
            <div style={{ fontSize: 12, color: '#757575' }}>
              {word.pinyin}
            </div>
          </div>
        ))}
      </div>

      {/* 右侧：当前词汇详情 */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#757575' }}>
              {currentIndex + 1} / {currentWords.length}
            </div>
          </div>
          <div style={{ width: 40 }}></div>
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            {/* 听语音 */}
            <button
              onClick={() => handleSpeak(currentWord)}
              style={{
                padding: '12px 24px',
                fontSize: 16,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              🔊 听语音
            </button>

            {/* 录音/停止 */}
            <button
              onClick={() => handleRecord(currentWord)}
              style={{
                padding: '12px 24px',
                fontSize: 16,
                background: isRecording ? '#F44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              {isRecording ? '⏹ 停止录音' : '🎤 录音朗读'}
            </button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div style={{ 
              marginTop: 16, 
              padding: 16, 
              borderRadius: 12,
              background: '#FFEBEE',
            }}>
              <div style={{ fontSize: 16, color: '#F44336', marginBottom: 8 }}>
                🔴 录音中... 请朗读" {currentWord.char} "
              </div>
            </div>
          )}

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

          {/* Audio Playback */}
          {audioUrl && !isRecording && !showResult && (
            <div style={{ marginTop: 16 }}>
              <audio src={audioUrl} controls style={{ width: '100%' }} />
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div style={{ position: 'fixed', bottom: 40, left: 220, right: 20 }}>
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
    </div>
  );
}
