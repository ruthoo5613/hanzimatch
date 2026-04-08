import { useCallback, useState, useRef } from 'react';

// 预生成的音频 URL（腾讯云 TTS 生成）
const AUDIO_BASE = '/audio';

const CHARS_AUDIO: Record<string, string> = {
  '不辣': `${AUDIO_BASE}/不辣.mp3`,
  '买单': `${AUDIO_BASE}/买单.mp3`,
  '仪表盘': `${AUDIO_BASE}/仪表盘.mp3`,
  '便宜': `${AUDIO_BASE}/便宜.mp3`,
  '倒车档': `${AUDIO_BASE}/倒车档.mp3`,
  '停车': `${AUDIO_BASE}/停车.mp3`,
  '停车档': `${AUDIO_BASE}/停车档.mp3`,
  '充电器': `${AUDIO_BASE}/充电器.mp3`,
  '入口': `${AUDIO_BASE}/入口.mp3`,
  '出口': `${AUDIO_BASE}/出口.mp3`,
  '刹车': `${AUDIO_BASE}/刹车.mp3`,
  '前台': `${AUDIO_BASE}/前台.mp3`,
  '前进档': `${AUDIO_BASE}/前进档.mp3`,
  '勺子': `${AUDIO_BASE}/勺子.mp3`,
  '司机': `${AUDIO_BASE}/司机.mp3`,
  '后备箱': `${AUDIO_BASE}/后备箱.mp3`,
  '后视镜': `${AUDIO_BASE}/后视镜.mp3`,
  '启动按钮': `${AUDIO_BASE}/启动按钮.mp3`,
  '吹风机': `${AUDIO_BASE}/吹风机.mp3`,
  '喇叭': `${AUDIO_BASE}/喇叭.mp3`,
  '坐在驾驶座上': `${AUDIO_BASE}/坐在驾驶座上.mp3`,
  '多少钱': `${AUDIO_BASE}/多少钱.mp3`,
  '天窗': `${AUDIO_BASE}/天窗.mp3`,
  '好吃': `${AUDIO_BASE}/好吃.mp3`,
  '安全带': `${AUDIO_BASE}/安全带.mp3`,
  '床': `${AUDIO_BASE}/床.mp3`,
  '床头柜': `${AUDIO_BASE}/床头柜.mp3`,
  '座位': `${AUDIO_BASE}/座位.mp3`,
  '我在美团上预订了酒店': `${AUDIO_BASE}/我在美团上预订了酒店.mp3`,
  '我的房间在哪里？': `${AUDIO_BASE}/我的房间在哪里?.mp3`,
  '我要退房': `${AUDIO_BASE}/我要退房.mp3`,
  '我需要办入住': `${AUDIO_BASE}/我需要办入住.mp3`,
  '房卡': `${AUDIO_BASE}/房卡.mp3`,
  '房间': `${AUDIO_BASE}/房间.mp3`,
  '房间里有牙刷吗？': `${AUDIO_BASE}/房间里有牙刷吗?.mp3`,
  '打开车窗': `${AUDIO_BASE}/打开车窗.mp3`,
  '把手': `${AUDIO_BASE}/把手.mp3`,
  '投影仪': `${AUDIO_BASE}/投影仪.mp3`,
  '拍照': `${AUDIO_BASE}/拍照.mp3`,
  '拖鞋': `${AUDIO_BASE}/拖鞋.mp3`,
  '按喇叭': `${AUDIO_BASE}/按喇叭.mp3`,
  '排队': `${AUDIO_BASE}/排队.mp3`,
  '插座': `${AUDIO_BASE}/插座.mp3`,
  '握着方向盘': `${AUDIO_BASE}/握着方向盘.mp3`,
  '方向盘': `${AUDIO_BASE}/方向盘.mp3`,
  '景点': `${AUDIO_BASE}/景点.mp3`,
  '机场': `${AUDIO_BASE}/机场.mp3`,
  '桌子': `${AUDIO_BASE}/桌子.mp3`,
  '椅子': `${AUDIO_BASE}/椅子.mp3`,
  '楼梯': `${AUDIO_BASE}/楼梯.mp3`,
  '毛巾': `${AUDIO_BASE}/毛巾.mp3`,
  '水': `${AUDIO_BASE}/水.mp3`,
  '水槽': `${AUDIO_BASE}/水槽.mp3`,
  '水龙头': `${AUDIO_BASE}/水龙头.mp3`,
  '汽车': `${AUDIO_BASE}/汽车.mp3`,
  '汽车有四个轮子': `${AUDIO_BASE}/汽车有四个轮子.mp3`,
  '沐浴露': `${AUDIO_BASE}/沐浴露.mp3`,
  '油箱': `${AUDIO_BASE}/油箱.mp3`,
  '油门': `${AUDIO_BASE}/油门.mp3`,
  '洗发水': `${AUDIO_BASE}/洗发水.mp3`,
  '洗手液': `${AUDIO_BASE}/洗手液.mp3`,
  '浴室': `${AUDIO_BASE}/浴室.mp3`,
  '淋浴间': `${AUDIO_BASE}/淋浴间.mp3`,
  '火车站': `${AUDIO_BASE}/火车站.mp3`,
  '点菜': `${AUDIO_BASE}/点菜.mp3`,
  '爬山': `${AUDIO_BASE}/爬山.mp3`,
  '电梯': `${AUDIO_BASE}/电梯.mp3`,
  '目的地': `${AUDIO_BASE}/目的地.mp3`,
  '空档': `${AUDIO_BASE}/空档.mp3`,
  '空调': `${AUDIO_BASE}/空调.mp3`,
  '窗帘': `${AUDIO_BASE}/窗帘.mp3`,
  '窗户': `${AUDIO_BASE}/窗户.mp3`,
  '筷子': `${AUDIO_BASE}/筷子.mp3`,
  '系好安全带': `${AUDIO_BASE}/系好安全带.mp3`,
  '索道': `${AUDIO_BASE}/索道.mp3`,
  '绕路': `${AUDIO_BASE}/绕路.mp3`,
  '菜单': `${AUDIO_BASE}/菜单.mp3`,
  '请告诉我您的手机号': `${AUDIO_BASE}/请告诉我您的手机号.mp3`,
  '请帮我开一下空调': `${AUDIO_BASE}/请帮我开一下空调.mp3`,
  '请问wifi密码是多少？': `${AUDIO_BASE}/请问wifi密码是多少?.mp3`,
  '请问有房吗？': `${AUDIO_BASE}/请问有房吗?.mp3`,
  '贵': `${AUDIO_BASE}/贵.mp3`,
  '踩刹车': `${AUDIO_BASE}/踩刹车.mp3`,
  '踩油门加速': `${AUDIO_BASE}/踩油门加速.mp3`,
  '车灯': `${AUDIO_BASE}/车灯.mp3`,
  '车钥匙': `${AUDIO_BASE}/车钥匙.mp3`,
  '车门': `${AUDIO_BASE}/车门.mp3`,
  '轮胎': `${AUDIO_BASE}/轮胎.mp3`,
  '辣': `${AUDIO_BASE}/辣.mp3`,
  '这是我的房卡': `${AUDIO_BASE}/这是我的房卡.mp3`,
  '这是我的汽车': `${AUDIO_BASE}/这是我的汽车.mp3`,
  '通风口': `${AUDIO_BASE}/通风口.mp3`,
  '遥控器': `${AUDIO_BASE}/遥控器.mp3`,
  '酒店': `${AUDIO_BASE}/酒店.mp3`,
  '锁车门': `${AUDIO_BASE}/锁车门.mp3`,
  '镜子': `${AUDIO_BASE}/镜子.mp3`,
  '门票': `${AUDIO_BASE}/门票.mp3`,
  '雨刷': `${AUDIO_BASE}/雨刷.mp3`,
  '风景': `${AUDIO_BASE}/风景.mp3`,
  '马桶': `${AUDIO_BASE}/马桶.mp3`,
  '驾驶座': `${AUDIO_BASE}/驾驶座.mp3`,
};

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSupported = typeof window !== 'undefined' && 'Audio' in window;

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);

    const audioUrl = CHARS_AUDIO[text];
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        fallbackToWebSpeech(text);
      };
      
      audio.play().catch(() => fallbackToWebSpeech(text));
    } else {
      fallbackToWebSpeech(text);
    }
  }, [isSupported]);

  const fallbackToWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.6;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}

// 使用 Web Speech API 进行语音识别
export function useSpeechRecognition() {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startRecognition = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // 停止之前的识别
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecognizing(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setRecognizedText(result);
        resolve(result);
      };

      recognition.onerror = (event: any) => {
        setError(event.error);
        setIsRecognizing(false);
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    });
  }, [isSupported]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecognizing(false);
    }
  }, []);

  // 计算相似度评分
  const calculateScore = useCallback((recognized: string, target: string): number => {
    if (!recognized || !target) return 50;
    
    const r = recognized.toLowerCase().replace(/\s/g, '');
    const t = target.toLowerCase().replace(/\s/g, '');
    
    // 完全匹配
    if (r === t) return 95;
    
    // 包含关系
    if (r.includes(t) || t.includes(r)) return 85;
    
    // 逐字匹配
    let matches = 0;
    for (const char of t) {
      if (r.includes(char)) matches++;
    }
    
    const ratio = matches / Math.max(r.length, t.length);
    return Math.min(90, Math.max(50, Math.round(ratio * 100)));
  }, []);

  return {
    isSupported,
    isRecognizing,
    recognizedText,
    error,
    startRecognition,
    stopRecognition,
    calculateScore,
  };
}