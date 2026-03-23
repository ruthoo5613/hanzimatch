import { useState, useRef } from 'react';
import { useGameStore } from '../hooks/useGame';

export function Level3() {
  const { currentTheme, setPhase } = useGameStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [userText, setUserText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // 获取视频URL
  const videoUrl = currentTheme?.levels[2]?.video?.videoUrl || '';

  const handleBack = () => {
    setPhase('level2');
  };

  const handleFinish = () => {
    setPhase('result');
  };

  // 模拟语音识别（实际需要后端API）
  const simulateRecognition = () => {
    setIsRecording(true);
    
    // 模拟录音过程
    setTimeout(() => {
      setIsRecording(false);
      // 随机给一个模拟结果
      const mockResults = [
        '服务员买单',
        '请给我一杯水',
        '这个菜很好吃',
        '我想要米饭',
      ];
      const randomText = mockResults[Math.floor(Math.random() * mockResults.length)];
      setUserText(randomText);
    }, 2000);
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#757575' }}>第3关</div>
          <div style={{ fontWeight: 600 }}>情境视频</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Video Player */}
      <div style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', 
        height: 0, 
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#000'
      }}>
        <iframe
          ref={iframeRef}
          src={`${videoUrl}?controls=1&rel=0&modestbranding=1`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Instructions */}
      <div style={{ 
        padding: 16, 
        background: '#FFF3E0', 
        borderRadius: 12, 
        marginBottom: 24 
      }}>
        <div style={{ fontSize: 14, color: '#E65100', marginBottom: 8 }}>
          💡 练习提示
        </div>
        <div style={{ fontSize: 13, color: '#757575', lineHeight: 1.6 }}>
          1. 观看视频，注意人物的对话<br/>
          2. 听后尝试复述你听到的内容<br/>
          3. 点击下方按钮录音，系统会评估你的发音
        </div>
      </div>

      {/* Recording Section */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={simulateRecognition}
          disabled={isRecording}
          style={{
            padding: '20px 40px',
            fontSize: 20,
            background: isRecording ? '#BDBDBD' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: 50,
            cursor: isRecording ? 'not-allowed' : 'pointer',
            marginBottom: 16,
          }}
        >
          {isRecording ? '🎙️ 录音中...' : '🎙️ 开始录音'}
        </button>

        {/* User's Transcript */}
        {userText && (
          <div style={{ 
            padding: 16, 
            background: '#F5F5F5', 
            borderRadius: 12,
            marginTop: 16 
          }}>
            <div style={{ fontSize: 14, color: '#757575', marginBottom: 8 }}>
              你说的：
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {userText}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 40, left: 20, right: 20 }}>
        <button
          onClick={handleFinish}
          style={{
            width: '100%',
            padding: 16,
            fontSize: 18,
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          完成学习 ✅
        </button>
      </div>
    </div>
  );
}
