import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, GamePhase, Theme, Word, Sentence } from '../types';
import { 
  restaurantThemeV2, 
  hotelTheme, 
  comingSoonTheme, 
  supermarketTheme, 
  parkTheme, 
  subwayTheme, 
  homeTheme, 
  citywalkTheme, 
  cookingTheme, 
  actionsTheme, 
  gymTheme 
} from '../data';

const DEFAULT_THEMES = [
  restaurantThemeV2, 
  hotelTheme, 
  supermarketTheme, 
  parkTheme, 
  subwayTheme, 
  homeTheme, 
  citywalkTheme, 
  cookingTheme, 
  actionsTheme, 
  gymTheme, 
  comingSoonTheme
];

interface GameStore extends GameState {
  themes: Theme[];
  customThemes: Theme[];
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
  addCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
}

const initialState: GameState & { themes: Theme[] } = {
  currentTheme: null,
  currentLevel: 1,
  phase: 'home',
  learnedWords: [],
  // 只开放第一个主题给所有用户
  unlockedThemes: ['restaurant_v2'], 
  completedLevels: [],
  currentWords: [],
  currentSentences: [],
  customThemes: [],
  themes: DEFAULT_THEMES,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getAllThemes: () => {
        const { themes: defaultThemes, customThemes } = get();
        return [...defaultThemes.filter(t => t.id !== 'coming_soon'), ...customThemes];
      },

      setTheme: (theme: Theme) => {
        // 获取第1关的词汇（兼容新旧两种数据结构）
        const level1 = theme.levels.find(l => l.id === 1);
        // 新版：level1.words[]，旧版：level1.wordIds[] 需要从 theme.words 映射
        let words = level1?.words || [];
        if (words.length === 0 && level1 && Array.isArray(level1.wordIds) && level1.wordIds.length > 0) {
          // 旧主题：用 wordIds 从 theme.words 中获取实际词汇
          words = level1.wordIds
            .map(id => theme.words?.find(w => w.id === id))
            .filter((w): w is Word => w !== undefined);
        }
        
        // 获取第2关的句子
        const level2 = theme.levels.find(l => l.id === 2);
        const sentences = level2?.sentences || [];
        
        set({ 
          currentTheme: theme, 
          currentLevel: 1, 
          currentWords: words,
          currentSentences: sentences,
        });
        
        // 使用新版 level1 界面的主题
        const newThemeIds = ['restaurant_v2', 'hotel', 'driving', 'supermarket', 'park', 'subway', 'home', 'citywalk', 'cooking', 'actions', 'gym'];
        if (newThemeIds.includes(theme.id) && level1?.type === 'words') {
          set({ phase: 'level1' });
        } else {
          // 旧主题默认进入 phase1
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
        // 新主题默认解锁
        const newThemes = ['restaurant_v2', 'hotel', 'driving', 'supermarket', 'park', 'subway', 'home', 'citywalk', 'cooking', 'actions', 'gym'];
        if (newThemes.includes(themeId)) return true;
        // 自定义主题默认解锁
        if (state.customThemes.some(t => t.id === themeId)) return true;
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

      addCustomTheme: (theme: Theme) => set((state) => ({
        customThemes: [...state.customThemes, theme]
      })),

      deleteCustomTheme: (themeId: string) => set((state) => ({
        customThemes: state.customThemes.filter(t => t.id !== themeId)
      })),
    }),
    {
      name: 'chinese-match-storage',
      // 只保存学习进度，不保存页面状态（每次进入都从首页开始）
      partialize: (state) => ({
        learnedWords: state.learnedWords,
        unlockedThemes: state.unlockedThemes,
        completedLevels: state.completedLevels,
        customThemes: state.customThemes,
        themes: state.themes,
      }),
    }
  )
);

// 获取所有主题的辅助函数
export const useAllThemes = () => {
  const defaultThemes = useGameStore(state => state.themes);
  const customThemes = useGameStore(state => state.customThemes);
  return [...defaultThemes.filter(t => t.id !== 'coming_soon'), ...customThemes];
};