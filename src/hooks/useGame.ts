import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, GamePhase, Theme, Word } from '../types';
import { scenicTheme, restaurantTheme, taxiTheme } from '../data';

interface GameStore extends GameState {
  themes: Theme[];
  currentWords: Word[];  // 当前主题的3个词
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
  unlockedThemes: ['scenic'], // 第一个主题默认解锁
  completedLevels: [],
  currentWords: [], // 当前主题的3个词
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      themes: [scenicTheme, restaurantTheme, taxiTheme],

      setTheme: (theme: Theme) => {
        // 每次选择主题时随机3个词
        const shuffled = [...theme.words].sort(() => Math.random() - 0.5);
        const randomWords = shuffled.slice(0, 3);
        set({ currentTheme: theme, currentLevel: 1, currentWords: randomWords });
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
        // 景区默认解锁
        if (themeId === 'scenic') return true;
        // 检查是否已解锁
        if (state.unlockedThemes.includes(themeId)) return true;
        // 检查前置主题是否通关
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
