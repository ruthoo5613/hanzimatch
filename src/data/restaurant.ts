import { Theme } from '../types';

export const restaurantTheme: Theme = {
  id: 'restaurant',
  name: '餐厅吃饭',
  nameEn: 'Restaurant',
  icon: '🍜',
  words: [
    { id: 'rest_1', char: '菜单', pinyin: 'càidān', english: 'menu' },
    { id: 'rest_2', char: '点菜', pinyin: 'diǎncài', english: 'order food' },
    { id: 'rest_3', char: '买单', pinyin: 'mǎidān', english: 'pay the bill' },
    { id: 'rest_4', char: '好吃', pinyin: 'hǎochī', english: 'delicious' },
    { id: 'rest_5', char: '辣', pinyin: 'là', english: 'spicy' },
    { id: 'rest_6', char: '不辣', pinyin: 'bù là', english: 'not spicy' },
    { id: 'rest_7', char: '水', pinyin: 'shuǐ', english: 'water' },
    { id: 'rest_8', char: '筷子', pinyin: 'kuàizi', english: 'chopsticks' },
    { id: 'rest_9', char: '勺子', pinyin: 'sháozi', english: 'spoon' },
  ],
  levels: [
    { id: 1, wordIds: ['rest_1', 'rest_2', 'rest_3'] },
    { id: 2, wordIds: ['rest_4', 'rest_5', 'rest_6'] },
    { id: 3, wordIds: ['rest_7', 'rest_8', 'rest_9'] },
  ],
};
