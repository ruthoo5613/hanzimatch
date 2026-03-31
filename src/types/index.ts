// 词汇（用于第1关）
export interface Word {
  id: string;
  char: string;        // 汉字
  pinyin: string | string[];      // 拼音：可以是字符串或字符串数组（每个字对应一个拼音）
  english: string;     // 英文翻译
}

// 句子（用于第2关）
export interface Sentence {
  id: string;
  text: string;        // 中文句子
  pinyin: string;      // 拼音
  english: string;     // 英文翻译
}

// 视频情境（用于第3关）
export interface VideoScene {
  id: string;
  videoUrl: string;    // 视频链接
  transcript: string;  // 听力原文（用于对比）
  prompts: string[];   // 视频中可能的句子列表
}

// 关卡配置
export interface Level {
  id: number;
  type?: 'words' | 'sentences' | 'video';  // 关卡类型 (新版)
  wordIds?: string[];    // 本关使用的字 IDs (旧版兼容)
  words?: Word[];        // 第1关词汇 (新版)
  sentences?: Sentence[]; // 第2关句子 (新版)
  video?: VideoScene;    // 第3关视频 (新版)
}

// 主题配置
export interface Theme {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description?: string;  // 主题描述 (新版)
  words: Word[];        // 主题所有词汇 (旧版兼容)
  levels: Level[];      // 关卡配置
}

// 游戏阶段
export type GamePhase = 
  | 'home' 
  | 'phase1' | 'phase2' | 'phase3'  // 旧版3关
  | 'level1' | 'level2' | 'level3' // 新版3关
  | 'result' | 'review' | 'stats' | 'guestbook'
  | 'pricing' | 'profile' | 'faq';

// 游戏状态
export interface GameState {
  currentTheme: Theme | null;
  currentLevel: number;
  phase: GamePhase;
  learnedWords: Word[];
  unlockedThemes: string[];
  completedLevels: { themeId: string; levelId: number }[];
  currentWords: Word[];       // 当前主题的词
  currentSentences: Sentence[]; // 当前主题的句子
}
