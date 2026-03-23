import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, GamePhase, Theme, Word, Sentence } from '../types';
import { scenicTheme, restaurantTheme, taxiTheme } from '../data';
import { restaurantThemeV2 } from '../data/restaurantV2';

interface GameStore extends GameState {
  themes: Theme[];
  currentWords: Word[];       // 当前主题的词汇
  currentSentences: Sentence[]; // 当前主题的句子
  setTheme: (theme: Theme) => void;
  setLevel: (level: number) => void;
  setPhase: (phase: GamePhase) => void;
  addLearnedWord: (word: Word) => void;
  unlockTheme: (themeId: string) => void;
  completeLevel: (themeId: string, levelId: number) => void;
  resetProgress: () => void;
  isThemeUnlocked: (themeId: string) => boolean;
  isLevelCompleted: (themeId: string, levelId: number) => boolean;
  isThemeCompleted: (themeId: string) => boolean;
}

const initialState: GameState = {
  currentTheme: null,
  currentLevel: 1,
  phase: 'home',
  learnedWords: [],
  unlockedThemes: ['scenic', 'restaurant', 'taxi', 'restaurant_v2'], 
  completedLevels: [],
  currentWords: [],
  currentSentences: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      // 旧版主题 + 新版v2主题
      themes: [scenicTheme, restaurantTheme, taxiTheme, restaurantThemeV2],

      setTheme: (theme: Theme) => {
        // 获取第1关的词汇
        const level1 = theme.levels.find(l => l.id === 1);
        const words = level1?.words || [];
        
        // 获取第2关的句子
        const level2 = theme.levels.find(l => l.id === 2);
        const sentences = level2?.sentences || [];
        
        set({ 
          currentTheme: theme, 
          currentLevel: 1, 
          currentWords: words,
          currentSentences: sentences,
        });
        
        // 根据关卡类型进入对应阶段
        if (level1?.type === 'words') {
          set({ phase: 'level1' });
        } else {
          set({ phase: 'phase1' });
        }
      },
      
      setLevel: (level: number) => set({ currentLevel: level }),
      
      setPhase: (phase: GamePhase) => set({ phase }),
      
      addLearnedWord: (word: Word) => set((state) => ({
        learnedWords: state.learnedWords.some(w => w.id === word.id)
          ? state.learnedWords
          : [...state.learnedWords, word]
      })),
      
      unlockTheme: (themeId: string) => set((state) => ({
        unlockedThemes: state.unlockedThemes.includes(themeId)
          ? state.unlockedThemes
          : [...state.unlockedThemes, themeId]
      })),
      
      completeLevel: (themeId: string, levelId: number) => set((state) => {
        const already = state.completedLevels.some(
          c => c.themeId === themeId && c.levelId === levelId
        );
        return {
          completedLevels: already
            ? state.completedLevels
            : [...state.completedLevels, { themeId, levelId }]
        };
      }),
      
      resetProgress: () => set(initialState),
      
      isThemeUnlocked: (themeId: string) => {
        const state = get();
        // v2主题默认解锁测试
        if (themeId === 'restaurant_v2') return true;
        // 旧版主题逻辑
        if (themeId === 'scenic') return true;
        if (state.unlockedThemes.includes(themeId)) return true;
        if (themeId === 'restaurant') {
          return state.completedLevels.some(c => c.themeId === 'scenic' && c.levelId === 3);
        }
        if (themeId === 'taxi') {
          return state.completedLevels.some(c => c.themeId === 'restaurant' && c.levelId === 3);
        }
        return false;
      },
      
      isLevelCompleted: (themeId: string, levelId: number) => {
        return get().completedLevels.some(c => c.themeId === themeId && c.levelId === levelId);
      },
      
      isThemeCompleted: (themeId: string) => {
        return get().completedLevels.some(c => c.themeId === themeId && c.levelId === 3);
      },
    }),
    {
      name: 'chinese-match-storage',
    }
  )
);