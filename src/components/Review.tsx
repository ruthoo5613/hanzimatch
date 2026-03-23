import { useState, useEffect } from 'react';
import { useReviewStore } from '../hooks/useReview';

export function Review() {
  const { getWordsToReview, answerWord } = useReviewStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  
  const words = getWordsToReview().slice(0, 10);
  const currentWord = words[currentIndex];
  
  useEffect(() => {
    useReviewStore.getState().resetDailyCount();
  }, []);

  if (words.length === 0) {
    return (
      <div className="review-empty" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ marginBottom: 12 }}>All Done!</h2>
        <p style={{ color: '#757575' }}>No words to review right now.</p>
        <p style={{ color: '#757575', marginTop: 8 }}>Learn some new words first!</p>
      </div>
    );
  }

  if (isComplete) {
    const total = results.correct + results.wrong;
    const accuracy = total > 0 ? Math.round((results.correct / total) * 100) : 0;
    return (
      <div className="review-complete" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
        <h2 style={{ marginBottom: 24 }}>Review Complete!</h2>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 32, 
          marginBottom: 32 
        }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#4CAF50' }}>
              {results.correct}
            </div>
            <div style={{ fontSize: 14, color: '#757575' }}>Correct</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#F44336' }}>
              {results.wrong}
            </div>
            <div style={{ fontSize: 14, color: '#757575' }}>Wrong</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#2196F3' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: 14, color: '#757575' }}>Accuracy</div>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
          style={{ padding: '14px 32px' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!currentWord) return null;

  const handleAnswer = (correct: boolean) => {
    answerWord(currentWord.wordId, correct);
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setIsComplete(true);
    }
  };

  return (
    <div className="review-page" style={{ padding: 20 }}>
      {/* Progress */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 24,
        fontSize: 14,
        color: '#757575'
      }}>
        <span>Review Progress</span>
        <span>{currentIndex + 1} / {words.length}</span>
      </div>
      
      <div style={{ 
        height: 4, 
        background: '#E0E0E0', 
        borderRadius: 2, 
        marginBottom: 40 
      }}>
        <div style={{ 
          height: '100%', 
          background: '#4CAF50', 
          borderRadius: 2,
          width: `${((currentIndex + 1) / words.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Word Card */}
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ 
          fontSize: 72, 
          fontWeight: 700, 
          marginBottom: 16,
          color: '#212121'
        }}>
          {currentWord.char}
        </div>
        
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="btn btn-secondary"
            style={{ marginTop: 16 }}
          >
            Show Answer
          </button>
        ) : (
          <>
            <div style={{ 
              fontSize: 24, 
              color: '#4CAF50', 
              marginBottom: 8 
            }}>
              {currentWord.pinyin}
            </div>
            <div style={{ 
              fontSize: 18, 
              color: '#757575', 
              marginBottom: 32 
            }}>
              {currentWord.english}
            </div>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={() => handleAnswer(false)}
                style={{
                  padding: '16px 32px',
                  fontSize: 18,
                  background: '#FFEBEE',
                  color: '#F44336',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                ❌ Don't Know
              </button>
              <button
                onClick={() => handleAnswer(true)}
                style={{
                  padding: '16px 32px',
                  fontSize: 18,
                  background: '#E8F5E9',
                  color: '#4CAF50',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                ✅ Know It
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hint */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: 24, 
        color: '#9E9E9E',
        fontSize: 14 
      }}>
        Spaced repetition for better retention
      </div>
    </div>
  );
}