import { useGameStore } from './hooks/useGame';
import { Home } from './components/Home';
import { Phase1 } from './components/Phase1';
import { Phase2 } from './components/Phase2';
import { Phase3 } from './components/Phase3';
import { Result } from './components/Result';
import { Review } from './components/Review';
import { Stats } from './components/Stats';
import './styles/index.css';

function App() {
  const { phase } = useGameStore();

  const renderPage = () => {
    switch (phase) {
      case 'home':
        return <Home />;
      case 'phase1':
        return <Phase1 />;
      case 'phase2':
        return <Phase2 />;
      case 'phase3':
        return <Phase3 />;
      case 'result':
        return <Result />;
      case 'review':
        return <Review />;
      case 'stats':
        return <Stats />;
      default:
        return <Home />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
