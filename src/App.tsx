import { useState, useEffect } from 'react';
import { useGameStore } from './hooks/useGame';
import { Home } from './components/Home';
import { Guestbook } from './components/Guestbook';
import { Phase1 } from './components/Phase1';
import { Phase2 } from './components/Phase2';
import { Phase3 } from './components/Phase3';
import { Result } from './components/Result';
import { Review } from './components/Review';
import { Stats } from './components/Stats';
import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Profile } from './components/Profile';

function App() {
  const { phase } = useGameStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 延迟检查渲染状态
    const timer = setTimeout(() => {
      setLoading(false);
      // 检查 root 是否为空
      const root = document.getElementById('root');
      if (root && root.children.length === 0) {
        setError('页面未渲染，请检查控制台');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 监听全局错误
    const handleError = (e: ErrorEvent) => {
      console.error('Global error:', e.error);
      setError(e.message || String(e.error));
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', e.reason);
      setError(String(e.reason));
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>出错了</h2>
        <p>{error}</p>
        <p style={{ fontSize: 12, color: '#999' }}>
          请按 F12 打开开发者工具查看 Console 中的详细信息
        </p>
        <button onClick={() => window.location.reload()}>刷新页面</button>
      </div>
    );
  }

  const renderPage = () => {
    console.log('Rendering phase:', phase);
    switch (phase) {
      case 'home':
        return <Home />;
      // 旧版3关
      case 'phase1':
        return <Phase1 />;
      case 'phase2':
        return <Phase2 />;
      case 'phase3':
        return <Phase3 />;
      // 新版3关
      case 'level1':
        return <Level1 />;
      case 'level2':
        return <Level2 />;
      case 'level3':
        return <Level3 />;
      // 其他
      case 'guestbook':
        return <Guestbook />;
      case 'result':
        return <Result />;
      case 'review':
        return <Review />;
      case 'stats':
        return <Stats />;
      case 'pricing':
        return <Pricing />;
      case 'profile':
        return <Profile />;
      case 'faq':
        return <FAQ />;
      default:
        return <Home />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;