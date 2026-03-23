import { useReviewStore } from '../hooks/useReview';
import { useGameStore } from '../hooks/useGame';

export function Stats() {
  const { getStats, todayReviewCount, todayCorrectCount } = useReviewStore();
  const { setPhase } = useGameStore();
  const stats = getStats();
  
  const accuracy = todayReviewCount > 0 
    ? Math.round((todayCorrectCount / todayReviewCount) * 100) 
    : 0;

  const total = stats.new + stats.learning + stats.review + stats.mastered;

  return (
    <div className="stats-page" style={{ padding: 20, position: 'relative' }}>
      {/* Back button */}
      <button
        onClick={() => setPhase('home')}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'none',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          padding: 8,
        }}
      >
        ←
      </button>

      <h2 style={{ marginBottom: 24, textAlign: 'center' }}>📊 学习统计</h2>
      
      {/* 总览卡片 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 16 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#2196F3' }}>
              {total}
            </div>
            <div style={{ fontSize: 14, color: '#757575' }}>学习词汇</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#4CAF50' }}>
              {stats.mastered}
            </div>
            <div style={{ fontSize: 14, color: '#757575' }}>已掌握</div>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: 8 
          }}>
            <span style={{ fontSize: 14, color: '#757575' }}>学习进度</span>
            <span style={{ fontSize: 14, color: '#757575' }}>
              {total > 0 ? Math.round((stats.mastered / total) * 100) : 0}%
            </span>
          </div>
          <div style={{ 
            height: 8, 
            background: '#E0E0E0', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #4CAF50, #81C784)',
              width: `${total > 0 ? (stats.mastered / total) * 100 : 0}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: 12 
        }}>
          <span style={{ color: '#2196F3' }}>🆕 {stats.new}</span>
          <span style={{ color: '#FF9800' }}>📚 {stats.learning}</span>
          <span style={{ color: '#9C27B0' }}>🔄 {stats.review}</span>
          <span style={{ color: '#4CAF50' }}>✅ {stats.mastered}</span>
        </div>
      </div>

      {/* 今日数据 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ 
          fontSize: 16, 
          fontWeight: 600, 
          marginBottom: 16 
        }}>
          📅 今日数据
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 16 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{todayReviewCount}</div>
            <div style={{ fontSize: 12, color: '#757575' }}>复习次数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50' }}>
              {todayCorrectCount}
            </div>
            <div style={{ fontSize: 12, color: '#757575' }}>正确</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2196F3' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: 12, color: '#757575' }}>正确率</div>
          </div>
        </div>
      </div>

      {/* 待复习提醒 */}
      {stats.toReview > 0 && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            ⏰ 有 <strong style={{ color: '#FF9800' }}>{stats.toReview}</strong> 个词需要复习
          </div>
          <button 
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => setPhase('review')}
          >
            开始复习
          </button>
        </div>
      )}

      {/* 等级说明 */}
      <div style={{ 
        marginTop: 24, 
        padding: 16, 
        background: '#F5F5F5', 
        borderRadius: 12,
        fontSize: 12,
        color: '#757575'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>词汇等级说明</div>
        <div>🆕 新词：刚学习的词</div>
        <div>📚 学习中：复习 1-2 次</div>
        <div>🔄 复习中：复习 3+ 次</div>
        <div>✅ 已掌握：连续答对 5 次且超过 7 天</div>
      </div>
    </div>
  );
}