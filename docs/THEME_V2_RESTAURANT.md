# HanziMatch 2.0 - 餐厅吃饭主题设计

## 主题信息
- **主题**：餐厅吃饭
- **场景**：外出就餐
- **视频**：（用户提供）

---

## 第1关：词汇学习 🎧

### 学习内容
| 词汇 | 拼音 | 英文 |
|------|------|------|
| 桌子 | zhuōzi | table |
| 椅子 | yǐzi | chair |
| 碗 | wǎn | bowl |
| 筷子 | kuàizi | chopsticks |
| 杯子 | bēizi | cup |
| 茶 | chá | tea |
| 鱼 | yú | fish |
| 虾 | xiā | shrimp |
| 青菜 | qīngcài | vegetables |
| 米饭 | mǐfàn | rice |
| 包子 | bāozi | bun |
| 厕所 | cèsuǒ | toilet |

### 交互流程
1. 显示汉字 + 播放发音
2. 用户跟读
3. 系统评分（语音识别）
4. 正确进入下一个，错误提示后重试

---

## 第2关：句型练习 📝

### 学习内容
| 句子 | 拼音 | 英文 |
|------|------|------|
| 这道菜好吃吗？ | zhè dào cài hǎo chī ma? | Is this dish delicious? |
| 你喝水吗？ | nǐ hē shuǐ ma? | Do you want water? |
| 把你的杯子递给我 | bǎ nǐ de bēizi dì gěi wǒ | Pass me your cup |
| 我吃饱了 | wǒ chī bǎo le | I'm full |
| 我要去下厕所 | wǒ yào qù xià cèsuǒ | I need to use the toilet |

### 交互流程
1. 显示句子 + 播放中文发音
2. 用户跟读
3. 系统评分
4. 给出反馈

---

## 第3关：情境视频 🎬

### 视频内容
用户观看无字幕视频，练习听力

### 交互流程
1. 播放视频（无字幕）
2. 用户复述听到的内容
3. 语音转文字显示
4. 系统对比纠正
5. 评分反馈

---

## 技术实现要点

### 1. 语音识别
- 使用 Web Speech API (`SpeechRecognition`)
- 支持中文识别
- 评分算法：对比原文计算相似度

### 2. 语音合成
- 使用 Web Speech API (`speechSynthesis`)
- 中文发音

### 3. 视频处理
- 直接嵌入 YouTube/视频链接
- 不显示字幕层
- 支持暂停/重播

### 4. 存储
- 复习系统继续沿用
- 新增：用户发音录音存储（可选）