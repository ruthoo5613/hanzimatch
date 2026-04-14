import type { Theme } from '../types';

export const restaurantThemeV2: Theme = {
  id: 'restaurant_v2',
  name: '餐厅吃饭',
  nameEn: 'Restaurant',
  icon: '🍜',
  category: 'food',
  description: '学习在餐厅吃饭时常用的词汇和句子',
  words: [
    { id: 'r_1', char: '桌子', pinyin: ['zhuō', 'zi'], english: 'table' },
    { id: 'r_2', char: '椅子', pinyin: ['yǐ', 'zi'], english: 'chair' },
    { id: 'r_3', char: '碗', pinyin: ['wǎn'], english: 'bowl' },
    { id: 'r_4', char: '筷子', pinyin: ['kuài', 'zi'], english: 'chopsticks' },
    { id: 'r_5', char: '杯子', pinyin: ['bēi', 'zi'], english: 'cup' },
    { id: 'r_6', char: '茶', pinyin: ['chá'], english: 'tea' },
    { id: 'r_7', char: '鱼', pinyin: ['yú'], english: 'fish' },
    { id: 'r_8', char: '虾', pinyin: ['xiā'], english: 'shrimp' },
    { id: 'r_9', char: '青菜', pinyin: ['qīng', 'cài'], english: 'vegetables' },
    { id: 'r_10', char: '米饭', pinyin: ['mǐ', 'fàn'], english: 'rice' },
    { id: 'r_11', char: '包子', pinyin: ['bāo', 'zi'], english: 'bun' },
    { id: 'r_12', char: '厕所', pinyin: ['cè', 'suǒ'], english: 'toilet' },
  ],
  levels: [
    // 第1关：词汇学习
    {
      id: 1,
      type: 'words',
      words: [
        { id: 'r_1', char: '桌子', pinyin: ['zhuō', 'zi'], english: 'table' },
        { id: 'r_2', char: '椅子', pinyin: ['yǐ', 'zi'], english: 'chair' },
        { id: 'r_3', char: '碗', pinyin: ['wǎn'], english: 'bowl' },
        { id: 'r_4', char: '筷子', pinyin: ['kuài', 'zi'], english: 'chopsticks' },
        { id: 'r_5', char: '杯子', pinyin: ['bēi', 'zi'], english: 'cup' },
        { id: 'r_6', char: '茶', pinyin: ['chá'], english: 'tea' },
        { id: 'r_7', char: '鱼', pinyin: ['yú'], english: 'fish' },
        { id: 'r_8', char: '虾', pinyin: ['xiā'], english: 'shrimp' },
        { id: 'r_9', char: '青菜', pinyin: ['qīng', 'cài'], english: 'vegetables' },
        { id: 'r_10', char: '米饭', pinyin: ['mǐ', 'fàn'], english: 'rice' },
        { id: 'r_11', char: '包子', pinyin: ['bāo', 'zi'], english: 'bun' },
        { id: 'r_12', char: '厕所', pinyin: ['cè', 'suǒ'], english: 'toilet' },
      ],
    },
    // 第2关：句型练习
    {
      id: 2,
      type: 'sentences',
      sentences: [
        { id: 's_1', text: '这道菜好吃吗？', pinyin: 'zhè dào cài hǎo chī ma?', english: 'Is this dish delicious?' },
        { id: 's_2', text: '你喝水吗？', pinyin: 'nǐ hē shuǐ ma?', english: 'Do you want water?' },
        { id: 's_3', text: '把你的杯子递给我', pinyin: 'bǎ nǐ de bēi zi dì gěi wǒ', english: 'Pass me your cup' },
        { id: 's_4', text: '我吃饱了', pinyin: 'wǒ chī bǎo le', english: "I'm full" },
        { id: 's_5', text: '我要去下厕所', pinyin: 'wǒ yào qù xià cè suǒ', english: 'I need to use the toilet' },
      ],
    },
    // 第3关：情境视频
    {
      id: 3,
      type: 'video',
      video: {
        id: 'v_1',
        videoUrl: 'https://www.youtube.com/embed/5F-JGrDkgpQ',
        transcript: '',
        prompts: [],
      },
    },
  ],
};
