import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered';

export interface WordMastery {
  wordId: string;
  char: string;
  pinyin: string;
  english: string;
  learnedAt: number;
  reviewCount: number;
  correctCount: number;
  lastReviewed: number;
  nextReview: number;
  level: MasteryLevel;
}

export interface ReviewState {
  wordMasteries: Record<string, WordMastery>;
  lastReviewDate: string;
  todayReviewCount: number;
  todayCorrectCount: number;
}

// 复习间隔（毫秒）- 简化版
const REVIEW_INTERVALS = {
  new: 1 * 24 * 60 * 60 * 1000,        // 1天
  learning: 1 * 24 * 60 * 60 * 1000,   // 1天
  review: 3 * 24 * 60 * 60 * 1000,      // 3天
  mastered: 7 * 24 * 60 * 60 * 1000,    // 7天
};

// 计算下次复习时间
function calculateNextReview(level: MasteryLevel): number {
  const now = Date.now();
  const interval = REVIEW_INTERVALS[level] || REVIEW_INTERVALS.new;
  return now + interval;
}

// 确定新的掌握等级
function determineLevel(reviewCount: number, correctCount: number, wasCorrect: boolean): MasteryLevel {
  if (!wasCorrect) return 'learning';
  if (correctCount >= 5) return 'mastered';
  if (reviewCount >= 3) return 'review';
  return 'learning';
}

interface ReviewStore extends ReviewState {
  // 学习新词
  learnWord: (word: { id: string; char: string; pinyin: string; english: string }) => void;
  // 复习答题
  answerWord: (wordId: string, correct: boolean) => void;
  // 获取待复习的词
  getWordsToReview: () => WordMastery[];
  // 获取统计
  getStats: () => { new: number; learning: number; review: number; mastered: number; toReview: number };
  // 重置今日学习数
  resetDailyCount: () => void;
}

const initialState: ReviewState = {
  wordMasteries: {},
  lastReviewDate: '',
  todayReviewCount: 0,
  todayCorrectCount: 0,
};

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      learnWord: (word) => set((state) => {
        if (state.wordMasteries[word.id]) return state;
        
        const mastery: WordMastery = {
          wordId: word.id,
          char: word.char,
          pinyin: word.pinyin,
          english: word.english,
          learnedAt: Date.now(),
          reviewCount: 0,
          correctCount: 0,
          lastReviewed: 0,
          nextReview: Date.now(),
          level: 'new',
        };
        
        return {
          wordMasteries: { ...state.wordMasteries, [word.id]: mastery },
        };
      }),

      answerWord: (wordId, correct) => set((state) => {
        const mastery = state.wordMasteries[wordId];
        if (!mastery) return state;

        const newCorrectCount = correct ? mastery.correctCount + 1 : 0;
        const newReviewCount = mastery.reviewCount + 1;
        const newLevel = determineLevel(newReviewCount, newCorrectCount, correct);
        
        const updatedMastery: WordMastery = {
          ...mastery,
          reviewCount: newReviewCount,
          correctCount: newCorrectCount,
          lastReviewed: Date.now(),
          nextReview: correct ? calculateNextReview(newLevel) : Date.now(),
          level: newLevel,
        };

        // 检查并重置每日计数
        const today = new Date().toDateString();
        let newTodayReviewCount = state.todayReviewCount;
        let newTodayCorrectCount = state.todayCorrectCount;
        
        if (state.lastReviewDate !== today) {
          newTodayReviewCount = 1;
          newTodayCorrectCount = correct ? 1 : 0;
        } else {
          newTodayReviewCount += 1;
          if (correct) newTodayCorrectCount += 1;
        }

        return {
          wordMasteries: { ...state.wordMasteries, [wordId]: updatedMastery },
          lastReviewDate: today,
          todayReviewCount: newTodayReviewCount,
          todayCorrectCount: newTodayCorrectCount,
        };
      }),

      getWordsToReview: () => {
        const state = get();
        const now = Date.now();
        
        return Object.values(state.wordMasteries)
          .filter(m => m.level !== 'mastered' && (m.nextReview <= now || m.level === 'new'))
          .sort((a, b) => {
            // new words first, then by next review time
            if (a.level === 'new' && b.level !== 'new') return -1;
            if (a.level !== 'new' && b.level === 'new') return 1;
            return a.nextReview - b.nextReview;
          });
      },

      getStats: () => {
        const state = get();
        const now = Date.now();
        
        const masteries = Object.values(state.wordMasteries);
        
        return {
          new: masteries.filter(m => m.level === 'new').length,
          learning: masteries.filter(m => m.level === 'learning').length,
          review: masteries.filter(m => m.level === 'review').length,
          mastered: masteries.filter(m => m.level === 'mastered').length,
          toReview: masteries.filter(m => m.level !== 'mastered' && m.nextReview <= now).length,
        };
      },

      resetDailyCount: () => {
        const today = new Date().toDateString();
        if (get().lastReviewDate !== today) {
          set({ todayReviewCount: 0, todayCorrectCount: 0, lastReviewDate: today });
        }
      },
    }),
    {
      name: 'hanzimatch-review-storage',
    }
  )
);