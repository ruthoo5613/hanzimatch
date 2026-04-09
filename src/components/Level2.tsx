import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useRecorder } from '../hooks/useRecorder';
import { useSubscriptionStore } from '../hooks/useSubscription';
import { callTencentASR, audioBlobToBase64 } from '../hooks/useTencentASR';

// 计算编辑距离
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

export function Level2() {
  const { currentSentences, currentTheme, setPhase, setLevel } = useGameStore();
  const { tier } = useSubscriptionStore(); const isPro = tier === "pro";
  
  // 确保关卡数正确
  useEffect(() => {
    setLevel(2);
  }, []);
  
  const { speak } = useSpeech();
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useRecorder();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
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

  const handleStartRecord = () => {
    startRecording();
  };

  const handleStopRecord = async () => {
    stopRecording();
    // 等待音频blob生成
    setTimeout(async () => {
      if (audioBlob) {
        setIsEvaluating(true);
        
        // 浏览器语音识别降级方案
        const useBrowserASR = () => {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (!SpeechRecognition) {
            setScore(70);
            setShowResult(true);
            setIsEvaluating(false);
            return true;
          }

          const recognition = new SpeechRecognition();
          recognition.lang = 'zh-CN';
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            const recognized = text.replace(/\s/g, '').toLowerCase();
            const original = currentSentence.text.replace(/\s/g, '').toLowerCase();
            
            let matchScore = 0;
            if (recognized === original) {
              matchScore = 100;
            } else if (original.includes(recognized)) {
              matchScore = 90;
            } else if (recognized.includes(original)) {
              matchScore = 85;
            } else {
              const distance = levenshteinDistance(recognized, original);
              const maxLen = Math.max(original.length, recognized.length);
              matchScore = Math.round((1 - distance / maxLen) * 100);
            }
            matchScore = Math.max(50, Math.min(95, matchScore));
            
            setScore(matchScore);
            setShowResult(true);
            setIsEvaluating(false);
          };
          recognition.onerror = () => {
            setScore(70);
            setShowResult(true);
            setIsEvaluating(false);
          };

          recognition.start();
          return true;
        };
        
        try {
          const base64 = await audioBlobToBase64(audioBlob);
          const result = await callTencentASR(base64);
          
          // 检查 ASR 返回是否有效
          if (!result.text || result.error) {
            useBrowserASR();
            return;
          }
          
          // 改进的评分：比较识别结果与原句
          const recognized = result.text.replace(/\s/g, '').toLowerCase();
          const original = currentSentence.text.replace(/\s/g, '').toLowerCase();
          
          // 计算相似度
          let matchScore = 0;
          if (recognized === original) {
            matchScore = 100;
          } else if (original.includes(recognized)) {
            matchScore = 90;
          } else if (recognized.includes(original)) {
            matchScore = 85;
          } else {
            // 使用编辑距离计算相似度
            const distance = levenshteinDistance(recognized, original);
            const maxLen = Math.max(original.length, recognized.length);
            matchScore = Math.round((1 - distance / maxLen) * 100);
          }
          
          // 确保最低分 50 分
          matchScore = Math.max(50, Math.min(95, matchScore));
          
          setScore(matchScore);
          setShowResult(true);
        } catch (err) {
          console.error('Evaluation error:', err);
          // 降级到浏览器语音识别
          useBrowserASR();
        } finally {
          setIsEvaluating(false);
        }
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentIndex < currentSentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScore(null);
      setShowResult(false);
      clearRecording();
      setTimeout(() => speak(currentSentences[currentIndex + 1].text), 500);
    } else {
      // 完成第2关，主题完成
      if (currentTheme) {
        useGameStore.getState().completeLevel(currentTheme.id, 2);
      }
      // 进入第3关
      setLevel(3); setPhase('level3');
    }
  };

  const handleBack = () => {
    setPhase('level1');
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>第2关</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>句型练习</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
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
      <div style={{ textAlign: 'center', padding: '32px 20px' }}>
        {/* 汉字和拼音 - 每个字对应一个拼音 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: 12,
          marginBottom: 20,
        }}>
          {currentSentence.text.split('').map((char, i) => {
            // 按空格分割拼音，每个音节对应一个汉字
            const syllables = currentSentence.pinyin.split(' ').filter(s => s);
            // 处理字符数多于拼音数的情况（如wifi整体作为一个词）
            const pinyin = i < syllables.length ? syllables[i] : (syllables[syllables.length - 1] || '');
            
            return (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
              }}>
                <div style={{ 
                  fontSize: 13, 
                  color: '#4CAF50',
                  fontWeight: 500,
                  height: 18,
                  lineHeight: '18px',
                  marginBottom: 4,
                }}>
                  {pinyin}
                </div>
                <div style={{ 
                  fontSize: 32, 
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}>
                  {char}
                </div>
              </div>
            );
          })}
        </div>

        {/* 英文翻译 */}
        <div style={{ fontSize: 15, color: '#757575', marginBottom: 28 }}>
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
            marginBottom: 16,
          }}
        >
          🔊 播放句子
        </button>

        {/* Follow Read Section */}
        <div style={{ marginBottom: 16 }}>
          {isEvaluating ? (
            <button
              disabled={true}
              style={{
                padding: '16px 32px',
                fontSize: 18,
                background: '#BDBDBD',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                cursor: 'not-allowed',
              }}
            >
              ⏳ 处理中...
            </button>
          ) : !isRecording ? (
            <button
              onClick={() => {
                if (!isPro) {
                  alert('跟读评分功能仅对付费版开放，请先升级到付费版');
                  return;
                }
                handleStartRecord();
              }}
              disabled={!isPro}
              style={{
                padding: '16px 32px',
                fontSize: 18,
                background: isPro ? '#4CAF50' : '#BDBDBD',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                cursor: isPro ? 'pointer' : 'not-allowed',
                opacity: isPro ? 1 : 0.6,
              }}
            >
              🎤 跟读句子
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '12px 20px',
                background: '#FFEBEE',
                borderRadius: 10,
              }}>
                <span style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  background: '#F44336',
                  animation: 'pulse 1s infinite',
                }}></span>
                <span style={{ fontSize: 16, color: '#D32F2F' }}>录音中...</span>
              </div>
              <button
                onClick={handleStopRecord}
                style={{
                  padding: '12px 32px',
                  fontSize: 16,
                  background: '#F44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                ⏹ 停止录音
              </button>
            </div>
          )}
        </div>

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

      {/* Next Button - fixed at bottom */}
      <div style={{ position: 'fixed', bottom: 40, left: 20, right: 20, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleNext}
          style={{
            fontSize: 14,
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            padding: '12px 24px',
          }}
        >
          {currentIndex < currentSentences.length - 1 ? '下一句 →' : '进入第3关 →'}
        </button>
      </div>
    </div>
  );
}
