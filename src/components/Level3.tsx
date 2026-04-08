import { useRef, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';

export function Level3() {
  const { currentTheme, setPhase, setLevel } = useGameStore();
  
  // 确保关卡数正确
  useEffect(() => {
    setLevel(3);
  }, []);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 获取视频URL
  const videoUrl = currentTheme?.levels[2]?.video?.videoUrl || '';

  const handleBack = () => {
    setPhase('level2');
  };

  const handleFinish = () => {
    // 标记第3关完成
    if (currentTheme) {
      useGameStore.getState().completeLevel(currentTheme.id, 3);
    }
    setPhase('result');
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>第3关</div>
          <div style={{ fontWeight: 600 }}>情景化学习</div>
          <div style={{ fontSize: 14, color: '#757575', marginBottom: 20 }}>快来试试你能听懂多少吧！</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Video Player */}
      <div style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', 
        height: 0, 
        marginBottom: 40,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#000'
      }}>
        <iframe
          ref={iframeRef}
          src={`${videoUrl}?cc=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1`}
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

      {/* 完成学习按钮 - 居中 */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleFinish}
          style={{
            padding: '16px 48px',
            fontSize: 16,
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          }}
        >
          完成学习 ✅
        </button>
      </div>
    </div>
  );
}
