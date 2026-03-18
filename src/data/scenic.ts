import type { Theme } from '../types';

export const scenicTheme: Theme = {
  id: 'scenic',
  name: '景区游玩',
  nameEn: 'Scenic Spot',
  icon: '🏞️',
  words: [
    { id: 'scenic_1', char: '门票', pinyin: 'ménpiào', english: 'ticket' },
    { id: 'scenic_2', char: '景点', pinyin: 'jǐngdiǎn', english: 'attraction' },
    { id: 'scenic_3', char: '拍照', pinyin: 'pāizhào', english: 'take photo' },
    { id: 'scenic_4', char: '爬山', pinyin: 'páshān', english: 'hike' },
    { id: 'scenic_5', char: '风景', pinyin: 'fēngjǐng', english: 'scenery' },
    { id: 'scenic_6', char: '排队', pinyin: 'páiduì', english: 'line up' },
    { id: 'scenic_7', char: '索道', pinyin: 'suǒdào', english: 'cable car' },
    { id: 'scenic_8', char: '出口', pinyin: 'chūkǒu', english: 'exit' },
    { id: 'scenic_9', char: '入口', pinyin: 'rùkǒu', english: 'entrance' },
  ],
  levels: [
    { id: 1, wordIds: ['scenic_1', 'scenic_2', 'scenic_3'] },
    { id: 2, wordIds: ['scenic_4', 'scenic_5', 'scenic_6'] },
    { id: 3, wordIds: ['scenic_7', 'scenic_8', 'scenic_9'] },
  ],
};
