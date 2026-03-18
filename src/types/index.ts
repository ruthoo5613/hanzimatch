// 汉字数据结构
export interface Word {
  id: string;
  char: string;        // 汉字
  pinyin: string;      // 拼音
  english: string;     // 英文翻译
  example?: string;    // 例句（可选）
}

// 关卡配置
export interface Level {
  id: number;
  wordIds: string[];    // 本关使用的字 IDs
}

// 主题配置
export interface Theme {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  words: Word[];        // 9个字
  levels: Level[];     // 3关
}

// 游戏阶段
export type GamePhase = 'home' | 'phase1' | 'phase2' | 'phase3' | 'result';

// 游戏状态
export interface GameState {
  currentTheme: Theme | null;
  currentLevel: number;
  phase: GamePhase;
  learnedWords: Word[];
  unlockedThemes: string[];
  completedLevels: { themeId: string; levelId: number }[];
}
