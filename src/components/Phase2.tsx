import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';

interface MatchPair {
  wordId: string;
  matched: boolean;
}

// 图片映射 - 写实风格
const IMAGE_MAP: Record<string, string> = {
  // 景区游玩
  '门票': 'https://images.unsplash.com/photo-1580666889329-5ebeb61dd3fe?w=200&h=200&fit=crop',
  '景点': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  '拍照': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop',
  '爬山': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&h=200&fit=crop',
  '风景': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&h=200&fit=crop',
  '排队': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
  '索道': 'https://images.unsplash.com/photo-1527809190084-9c3d0e1e91f0?w=200&h=200&fit=crop',
  '出口': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
  '入口': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop',
  
  // 餐厅吃饭
  '菜单': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
  '点菜': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
  '买单': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
  '好吃': 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop',
  '辣': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
  '不辣': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
  '水': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop',
  '筷子': 'https://images.unsplash.com/photo-1583301286816-f4f92d0ef201?w=200&h=200&fit=crop',
  '勺子': 'https://images.unsplash.com/photo-1600658495792-92f9529685c9?w=200&h=200&fit=crop',
  
  // 打车
  '司机': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=200&fit=crop',
  '目的地': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=200&fit=crop',
  '多少钱': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop',
  '便宜': 'https://images.unsplash.com/photo-1607501523781-6188bc29d3c4?w=200&h=200&fit=crop',
  '贵': 'https://images.unsplash.com/photo-1556484687-8ac334c89cf3?w=200&h=200&fit=crop',
  '绕路': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop',
  '停车': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&h=200&fit=crop',
  '机场': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=200&fit=crop',
  '火车站': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop',
};

export function Phase2() {
  const { currentTheme, currentLevel, setPhase, addLearnedWord } = useGameStore();
  const { speak } = useSpeech();

  const [matches, setMatches] = useState<MatchPair[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [allMatched, setAllMatched] = useState(false);

  const levelWords = currentTheme?.levels[currentLevel - 1].wordIds || [];
  const levelWordObjects = useMemo(() => 
    currentTheme?.words.filter(w => levelWords.includes(w.id)) || []
  , [currentTheme, levelWords]);

  // Initialize matches
  useEffect(() => {
    const initial = levelWordObjects.map(w => ({ wordId: w.id, matched: false }));
    setMatches(initial);
    setAllMatched(false);
  }, [levelWordObjects]);

  // Shuffle images
  const shuffledImages = useMemo(() => {
    const images = levelWordObjects.map(w => ({
      wordId: w.id,
      char: w.char,
      image: IMAGE_MAP[w.char] || 'https://via.placeholder.com/200',
    }));
    return images.sort(() => Math.random() - 0.5);
  }, [levelWordObjects]);

  const handleWordClick = (wordId: string) => {
    if (matches.find(m => m.wordId === wordId)?.matched) return;
    setSelectedWord(wordId);
    checkMatch(wordId, selectedImage);
  };

  const handleImageClick = (wordId: string) => {
    if (matches.find(m => m.wordId === wordId)?.matched) return;
    setSelectedImage(wordId);
    checkMatch(selectedWord, wordId);
  };

  const checkMatch = (wordId: string | null, imgWordId: string | null) => {
    if (!wordId || !imgWordId) return;

    if (wordId === imgWordId) {
      // Correct match!
      setFeedback('correct');
      const word = levelWordObjects.find(w => w.id === wordId);
      if (word) {
        addLearnedWord(word);
        speak(word.char);
      }

      setMatches(prev => prev.map(m => 
        m.wordId === wordId ? { ...m, matched: true } : m
      ));

      setTimeout(() => {
        setFeedback(null);
        setSelectedWord(null);
        setSelectedImage(null);
      }, 1000);
    } else {
      // Wrong match
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setSelectedWord(null);
        setSelectedImage(null);
      }, 800);
    }
  };

  // Check if all matched
  useEffect(() => {
    if (matches.length > 0 && matches.every(m => m.matched)) {
      setAllMatched(true);
      setTimeout(() => setPhase('phase3'), 1500);
    }
  }, [matches, setPhase]);

  const handleRestart = () => {
    const initial = levelWordObjects.map(w => ({ wordId: w.id, matched: false }));
    setMatches(initial);
    setAllMatched(false);
    setSelectedWord(null);
    setSelectedImage(null);
    setFeedback(null);
  };

  if (!currentTheme) return null;

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-title">{currentTheme.name} - Level {currentLevel}</div>
        <div className="game-progress">
          {matches.filter(m => m.matched).length} / {levelWordObjects.length}
        </div>
      </div>

      <div className="phase-indicator">
        {[1, 2, 3].map(phase => (
          <div key={phase} className={`phase-dot ${phase === 2 ? 'active' : ''}`} />
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 16 }}>
        🔗 Match words with pictures!
      </p>

      {/* Feedback */}
      {feedback === 'correct' && (
        <div style={{
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--success)',
          marginBottom: 10,
        }}>
          ✓ Correct!
        </div>
      )}
      {feedback === 'wrong' && (
        <div style={{
          textAlign: 'center',
          fontSize: 18,
          color: 'var(--error)',
          marginBottom: 10,
        }}>
          ✗ Try again!
        </div>
      )}

      {/* Matching Area */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '0 10px',
        gap: 20,
      }}>
        {/* Left: Words */}
        <div style={{ flex: 1 }}>
          {levelWordObjects.map(word => {
            const isMatched = matches.find(m => m.wordId === word.id)?.matched;
            const isSelected = selectedWord === word.id;
            
            return (
              <div
                key={word.id}
                onClick={() => handleWordClick(word.id)}
                style={{
                  padding: '16px 12px',
                  marginBottom: 12,
                  borderRadius: 12,
                  background: isMatched 
                    ? '#E8F5E9' 
                    : isSelected 
                      ? '#E3F2FD' 
                      : '#F5F5F5',
                  border: isMatched 
                    ? '2px solid #4CAF50' 
                    : isSelected 
                      ? '2px solid #2196F3' 
                      : '2px solid transparent',
                  cursor: isMatched ? 'default' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isMatched ? 0.6 : 1,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 600 }}>{word.char}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{word.pinyin}</div>
              </div>
            );
          })}
        </div>

        {/* Right: Images */}
        <div style={{ flex: 1 }}>
          {shuffledImages.map(item => {
            const isMatched = matches.find(m => m.wordId === item.wordId)?.matched;
            const isSelected = selectedImage === item.wordId;
            
            return (
              <div
                key={item.wordId}
                onClick={() => handleImageClick(item.wordId)}
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  background: isMatched 
                    ? '#E8F5E9' 
                    : isSelected 
                      ? '#E3F2FD' 
                      : 'white',
                  border: isMatched 
                    ? '3px solid #4CAF50' 
                    : isSelected 
                      ? '3px solid #2196F3' 
                      : '2px solid #E0E0E0',
                  cursor: isMatched ? 'default' : 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  opacity: isMatched ? 0.6 : 1,
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.char}
                  style={{
                    width: '100%',
                    height: 70,
                    objectFit: 'cover',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Success */}
      {allMatched && (
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          padding: 16,
          background: '#E8F5E9',
          borderRadius: 12,
          color: '#2E7D32',
          fontWeight: 600,
        }}>
          🎉 All matched! Great job!
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={handleRestart}>
          🔄 Restart
        </button>
      </div>
    </div>
  );
}
