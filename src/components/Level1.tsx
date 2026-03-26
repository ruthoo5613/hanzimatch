import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { callTencentASR, checkASRServer } from '../hooks/useTencentASR';
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

export function Level1() {
  const { currentWords, setPhase } = useGameStore();
  const { speak } = useSpeech();
  const { isSupported: recorderSupported, isRecording, startRecording, stopRecording } = useAudioRecorder();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  // 检查 ASR 服务器是否可用
  useEffect(() => {
    checkASRServer().then(setServerAvailable);
  }, []);

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
    if (!recorderSupported) {
      alert('您的浏览器不支持录音，请使用 Chrome 浏览器');
      return;
    }

    if (isRecording) {
      return;
    }

    try {
      // 开始录音
      await startRecording();
      setIsRecognizing(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    try {
      const audioBase64 = await stopRecording();
      setIsRecognizing(false);

      if (!audioBase64) {
        alert('录音失败，请重试');
        return;
      }

      // 发送到腾讯云 ASR 服务
      setIsRecognizing(true);
      const result = await callTencentASR(audioBase64);
      setIsRecognizing(false);

      const recognized = result.text;
      setRecognizedText(recognized);

      // 计算分数
      const targetText = currentWord.char;
      const scoreResult = calculateSimilarity(recognized, targetText);
      setScore(scoreResult);
      setShowResult(true);
    } catch (err: any) {
      console.error('ASR error:', err);
      setIsRecognizing(false);
      // ASR 失败时降级到浏览器语音识别
      fallbackToBrowserASR();
    }
  };

  // 简单的相似度计算
  const calculateSimilarity = (recognized: string, target: string): number => {
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
  };

  // 降级到浏览器语音识别
  const fallbackToBrowserASR = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音识别');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecognizing(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setRecognizedText(text);
      const scoreResult = calculateSimilarity(text, currentWord.char);
      setScore(scoreResult);
      setShowResult(true);
    };
    recognition.onerror = () => {
      setIsRecognizing(false);
      setScore(60);
      setShowResult(true);
    };
    recognition.onend = () => setIsRecognizing(false);

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
          <div style={{ fontSize: 14, color: '#757575' }}>第1关</div>
          <div style={{ fontWeight: 600 }}>词汇学习</div>
        </div>
        
        {currentWords.map((word, index) => {
          const pinyinArr = getPinyinArray(word);
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
                background: index === currentIndex ? '#fff' : 'transparent',
                borderLeft: index === currentIndex ? '3px solid #4CAF50' : '3px solid transparent',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                {word.char}
              </div>
              <div style={{ fontSize: 12, color: '#757575' }}>
                {pinyinArr.join(' ')}
              </div>
            </div>
          );
        })}
      </div>

      {/* 右侧：当前词汇详情 */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#757575' }}>
              {currentIndex + 1} / {currentWords.length}
            </div>
          </div>
          <div style={{ width: 40 }}></div>
        </div>

        {/* Word Card */}
        <div style={{ textAlign: 'center', padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* 拼音和汉字 - 逐字对齐 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginBottom: 16 }}>
            {chars.map((char, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                marginLeft: i > 0 ? 16 : 0,
              }}>
                <div style={{ 
                  fontSize: 18, 
                  color: '#4CAF50',
                  fontWeight: 500,
                  height: 22,
                  lineHeight: '22px',
                  marginBottom: 2,
                }}>
                  {pinyins[i] || ''}
                </div>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 700,
                  lineHeight: 1.1,
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
              onClick={isRecording ? handleStopRecording : handleRecord}
              disabled={isRecognizing}
              style={{
                padding: '12px 16px',
                fontSize: 14,
                background: isRecording ? '#F44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: isRecognizing ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>{isRecording ? '⏹️' : isRecognizing ? '🔴' : '🎤'}</span>
              <span>{isRecording ? '停止并识别' : isRecognizing ? '请说话...' : '跟读'}</span>
            </button>
          </div>

          {/* Recognition Status */}
          {isRecognizing && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#FFF3E0' }}>
              <div style={{ fontSize: 14, color: '#E65100' }}>
                🎤 正在识别... 请朗读" {currentWord.char} "
              </div>
            </div>
          )}

          {/* Server Status */}
          {serverAvailable === false && (
            <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: '#FFF3E0', fontSize: 12, color: '#E65100' }}>
              ⚠️ 腾讯云ASR服务未启动（本地开发模式）
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}