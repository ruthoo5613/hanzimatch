import type { Theme } from '../types';

export const taxiTheme: Theme = {
  id: 'taxi',
  name: '打车',
  nameEn: '打车',
  icon: '🚕',
  words: [
    { id: 'taxi_1', char: '司机', pinyin: 'sījī', english: 'driver' },
    { id: 'taxi_2', char: '目的地', pinyin: 'mùdìdì', english: 'destination' },
    { id: 'taxi_3', char: '多少钱', pinyin: 'duōshao qián', english: 'how much' },
    { id: 'taxi_4', char: '便宜', pinyin: 'piányi', english: 'cheap' },
    { id: 'taxi_5', char: '贵', pinyin: 'guì', english: 'expensive' },
    { id: 'taxi_6', char: '绕路', pinyin: 'rào lù', english: 'detour' },
    { id: 'taxi_7', char: '停车', pinyin: 'tíng chē', english: 'stop' },
    { id: 'taxi_8', char: '机场', pinyin: 'jīchǎng', english: 'airport' },
    { id: 'taxi_9', char: '火车站', pinyin: 'huǒchē zhàn', english: 'train station' },
  ],
  levels: [
    { id: 1, wordIds: ['taxi_1', 'taxi_2', 'taxi_3'] },
    { id: 2, wordIds: ['taxi_4', 'taxi_5', 'taxi_6'] },
    { id: 3, wordIds: ['taxi_7', 'taxi_8', 'taxi_9'] },
  ],
};
