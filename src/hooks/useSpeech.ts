import { useCallback, useState, useRef } from 'react';

// 预生成的音频 URL（腾讯云 TTS 生成）
const AUDIO_BASE = '/audio';

const CHARS_AUDIO: Record<string, string> = {
  '门票': `${AUDIO_BASE}/门票.mp3`,
  '景点': `${AUDIO_BASE}/景点.mp3`,
  '拍照': `${AUDIO_BASE}/拍照.mp3`,
  '爬山': `${AUDIO_BASE}/爬山.mp3`,
  '风景': `${AUDIO_BASE}/风景.mp3`,
  '排队': `${AUDIO_BASE}/排队.mp3`,
  '索道': `${AUDIO_BASE}/索道.mp3`,
  '出口': `${AUDIO_BASE}/出口.mp3`,
  '入口': `${AUDIO_BASE}/入口.mp3`,
  '菜单': `${AUDIO_BASE}/菜单.mp3`,
  '点菜': `${AUDIO_BASE}/点菜.mp3`,
  '买单': `${AUDIO_BASE}/买单.mp3`,
  '好吃': `${AUDIO_BASE}/好吃.mp3`,
  '辣': `${AUDIO_BASE}/辣.mp3`,
  '不辣': `${AUDIO_BASE}/不辣.mp3`,
  '水': `${AUDIO_BASE}/水.mp3`,
  '筷子': `${AUDIO_BASE}/筷子.mp3`,
  '勺子': `${AUDIO_BASE}/勺子.mp3`,
  '司机': `${AUDIO_BASE}/司机.mp3`,
  '目的地': `${AUDIO_BASE}/目的地.mp3`,
  '多少钱': `${AUDIO_BASE}/多少钱.mp3`,
  '便宜': `${AUDIO_BASE}/便宜.mp3`,
  '贵': `${AUDIO_BASE}/贵.mp3`,
  '绕路': `${AUDIO_BASE}/绕路.mp3`,
  '停车': `${AUDIO_BASE}/停车.mp3`,
  '机场': `${AUDIO_BASE}/机场.mp3`,
  '火车站': `${AUDIO_BASE}/火车站.mp3`,
  '桌子': `${AUDIO_BASE}/桌子.mp3`,
  '椅子': `${AUDIO_BASE}/椅子.mp3`,
  '碗': `${AUDIO_BASE}/碗.mp3`,
  '杯子': `${AUDIO_BASE}/杯子.mp3`,
  '茶': `${AUDIO_BASE}/茶.mp3`,
  '鱼': `${AUDIO_BASE}/鱼.mp3`,
  '虾': `${AUDIO_BASE}/虾.mp3`,
  '青菜': `${AUDIO_BASE}/青菜.mp3`,
  '米饭': `${AUDIO_BASE}/米饭.mp3`,
  '包子': `${AUDIO_BASE}/包子.mp3`,
  '厕所': `${AUDIO_BASE}/厕所.mp3`,
  '这道菜好吃吗？': `${AUDIO_BASE}/这道菜好吃吗?.mp3`,
  '你喝水吗？': `${AUDIO_BASE}/你喝水吗?.mp3`,
  '把你的杯子递给我': `${AUDIO_BASE}/把你的杯子递给我.mp3`,
  '我吃饱了': `${AUDIO_BASE}/我吃饱了.mp3`,
  '我要去下厕所': `${AUDIO_BASE}/我要去下厕所.mp3`,
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