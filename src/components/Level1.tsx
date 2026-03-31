import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useSubscriptionStore } from '../hooks/useSubscription';
import type { Word } from '../types';

const wordImages: Record<string, string> = {
  '桌子': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop&q=80',
  '椅子': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop&q=80',
  '碗': 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop&q=80',
  '筷子': 'https://images.unsplash.com/photo-1580442151529-343f2f6e0e27?w=400&h=300&fit=crop&q=80',
  '杯子': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop&q=80',
  '茶': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop&q=80',
  '鱼': 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop&q=80',
  '虾': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop&q=80',
  '青菜': 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=300&fit=crop&q=80',
  '米饭': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&q=80',
  '包子': 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&h=300&fit=crop&q=80',
  '厕所': 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&h=300&fit=crop&q=80',
};

const placeholderImage = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="160" viewBox="0 0 220 160">
  <rect fill="#E8F5E9" width="220" height="160" rx="12"/>
  <text x="110" y="85" text-anchor="middle" fill="#4CAF50" font-size="48" font-family="sans-serif">🖼️</text>
</svg>
`);

function getPinyinArray(word: Word): string[] {
  if (Array.isArray(word.pinyin)) {
    return word.pinyin;
  }
  return word.pinyin.split(' ');
}

// 简单的相似度计算
function calculateSimilarity(recognized: string, target: string): number {
  if (!recognized || !target) return 50;
  
  const r = recognized.toLowerCase().replace(/\s/g, '');
  const t = target.toLowerCase().replace(/\s/g, '');
  
  // 完全匹配
  if (r === t) return 95;
  
  // 包含关系
  if (r.includes(t) || t.includes(r)) return 85;
  
  // 逐字匹配
  let matches = 0;
  for (const char of t) {
    if (r.includes(char)) matches++;
  }
  
  const ratio = matches / Math.max(r.length, t.length);
  return Math.min(90, Math.max(50, Math.round(ratio * 100)));
}

export function Level1() {
  const { currentWords, setPhase, completeLevel, setLevel, currentTheme } = useGameStore();
  const { speak } = useSpeech();
  const { canUseRecording } = useSubscriptionStore();
  
  // 确保关卡数正确
  useEffect(() => {
    setLevel(1);
  }, []);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // 跟踪每个词的学习状态和分数
  const [wordScores, setWordScores] = useState<Record<string, number>>({});
  
  // MediaRecorder ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);
  
  const currentWord = currentWords[currentIndex];
  
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

  const handleRecord = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 选择支持的 MIME 类型
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      recorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;
    
    if (!recorder || recorder.state === 'inactive') {
      return;
    }

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        // 停止流
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // 检查是否有音频数据
        if (chunksRef.current.length === 0) {
          setIsRecording(false);
          resolve();
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setIsRecording(false);
        setIsProcessing(true);
        
        // 转换为 base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          try {
            // 发送到腾讯云 ASR
            const response = await fetch('https://hanzimatch-asr-prod.ruthoo5613.workers.dev/asr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 }),
            });
            
            const data = await response.json();
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            const recognized = data.text || '';
            setRecognizedText(recognized);
            
            const scoreResult = calculateSimilarity(recognized, currentWord.char);
            setScore(scoreResult);
            setShowResult(true);
            setWordScores(prev => ({
              ...prev,
              [currentWord.id]: scoreResult
            }));
          } catch (err: any) {
            console.error('ASR error:', err);
            // 降级到浏览器语音识别
            fallbackToBrowserASR();
          }
          
          setIsProcessing(false);
          resolve();
        };
        reader.onerror = () => {
          setIsProcessing(false);
          resolve();
        };
        reader.readAsDataURL(blob);
      };
      
      recorder.stop();
    });
  };

  // 降级到浏览器语音识别
  const fallbackToBrowserASR = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsProcessing(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setRecognizedText(text);
      const scoreResult = calculateSimilarity(text, currentWord.char);
      setScore(scoreResult);
      setShowResult(true);
      setWordScores(prev => ({
        ...prev,
        [currentWord.id]: scoreResult
      }));
      setIsProcessing(false);
    };
    recognition.onerror = () => {
      setScore(60);
      setShowResult(true);
      setWordScores(prev => ({
        ...prev,
        [currentWord.id]: 60
      }));
      setIsProcessing(false);
    };

    recognition.start();
  };

  const handleBack = () => {
    setPhase('home');
  };

  const chars = currentWord.char.split('');
  const pinyins = getPinyinArray(currentWord);
  const imageUrl = wordImages[currentWord.char];

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
          <div style={{ fontSize: 13, color: '#757575' }}>第1关</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>词汇学习</div>
        </div>
        
        {currentWords.map((word, index) => {
          const pinyinArr = getPinyinArray(word);
          const wordScore = wordScores[word.id];
          const isLearned = wordScore !== undefined;
          
          return (
            <div
              key={word.id}
              onClick={() => {
                setCurrentIndex(index);
                setScore(null);
                setShowResult(false);
                setRecognizedText('');
              }}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #E0E0E0',
                cursor: 'pointer',
                background: index === currentIndex ? '#fff' : isLearned ? '#E8F5E9' : 'transparent',
                borderLeft: index === currentIndex ? '3px solid #4CAF50' : '3px solid transparent',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{word.char}</span>
                {isLearned && <span style={{ fontSize: 12, color: '#4CAF50' }}>{wordScore}分</span>}
              </div>
              <div style={{ fontSize: 11, color: '#9E9E9E' }}>
                {pinyinArr.join(' ')}
              </div>
            </div>
          );
        })}
      </div>

      {/* 右侧：当前词汇详情 */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>←</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#757575' }}>
              {currentIndex + 1} / {currentWords.length}
            </div>
            <div style={{ fontSize: 11, color: '#4CAF50', marginTop: 2 }}>
              已学习: {Object.keys(wordScores).length} / {currentWords.length}
            </div>
          </div>
          <div style={{ width: 40 }}></div>
        </div>

        {/* Word Card */}
        <div style={{ textAlign: 'center', padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* 拼音和汉字 - 逐字对齐 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginBottom: 20 }}>
            {chars.map((char, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                marginLeft: i > 0 ? 20 : 0,
              }}>
                <div style={{ 
                  fontSize: 16, 
                  color: '#4CAF50',
                  fontWeight: 500,
                  height: 20,
                  lineHeight: '20px',
                  marginBottom: 4,
                }}>
                  {pinyins[i] || ''}
                </div>
                <div style={{ 
                  fontSize: 44, 
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}>
                  {char}
                </div>
              </div>
            ))}
          </div>

          {/* 图片 */}
          {imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <img 
                src={imageError ? placeholderImage : imageUrl} 
                alt={currentWord.char}
                style={{ 
                  width: 220, 
                  height: 160, 
                  objectFit: 'contain',
                  borderRadius: 12,
                  background: '#f5f5f5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onError={() => {
                  setImageError(true);
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
            <button
              onClick={() => handleSpeak(currentWord)}
              style={{
                padding: '12px 16px',
                fontSize: 14,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>🔊</span>
              <span>听发音</span>
            </button>

            <button
              onClick={() => {
                // 检查订阅权限
                if (!canUseRecording) {
                  useGameStore.getState().setPhase('pricing');
                  return;
                }
                if (isProcessing) return;
                if (isRecording) {
                  handleStopRecording();
                } else {
                  handleRecord();
                }
              }}
              disabled={isProcessing}
              style={{
                padding: '12px 16px',
                fontSize: 14,
                background: isRecording ? '#F44336' : (isProcessing ? '#BDBDBD' : '#2196F3'),
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>{isProcessing ? '⏳' : (isRecording ? '⏹️' : '🎤')}</span>
              <span>{isProcessing ? '处理中' : (isRecording ? '停止' : '跟读')}</span>
            </button>
          </div>

          {/* Result Feedback */}
          {showResult && score !== null && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: score >= 60 ? '#E8F5E9' : '#FFEBEE' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>
                {score >= 60 ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                评分: {score}
              </div>
              {recognizedText && (
                <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                  你说的是: "{recognizedText}"
                </div>
              )}
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                目标: "{currentWord.char}"
              </div>
            </div>
          )}

          {/* 下一关按钮 - 默认显示 */}
          {currentWords.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                onClick={() => {
                  if (currentTheme) {
                    completeLevel(currentTheme.id, 1);
                    // 进入第2关 - 句子练习（设置level=2表示当前在第2关）
                    setLevel(2);
                    setPhase('level2');
                  }
                }}
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                下一关 📖
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}