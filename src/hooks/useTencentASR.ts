/**
 * 腾讯云 ASR 客户端
 * 
 * 开发环境: http://localhost:3001/asr
 * 生产环境: https://hanzimatch-asr.ruthoo5613.workers.dev/asr
 * 
 * 使用方式：
 * 1. 开发：启动 local server (node server/server.js)
 * 2. 生产：部署 Workers 并设置环境变量
 */

const ASR_DEV_URL = 'http://localhost:3001/asr';
// TODO: 部署 Workers 后替换为实际 URL
const ASR_PROD_URL = 'https://hanzimatch-asr-prod.ruthoo5613.workers.dev/asr';

// 判断是否在生产环境
const ASR_SERVER_URL = typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')
  ? ASR_PROD_URL 
  : ASR_DEV_URL;

export interface ASRResult {
  text: string;
  confidence?: number;
}

export async function callTencentASR(audioBase64: string): Promise<ASRResult> {
  try {
    const response = await fetch(ASR_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio: audioBase64 }),
    });

    const data = await response.json();
    
    // 检查是否返回错误
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      text: data.text || data.Result || '',
    };
  } catch (error) {
    console.error('Tencent ASR error:', error);
    throw error;
  }
}

/**
 * 将 AudioRecorder 录制的音频转换为 base64
 */
export function audioBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 检查 ASR 服务是否可用
 */
export async function checkASRServer(): Promise<boolean> {
  try {
    // 使用 POST 而不是 HEAD，因为 Workers 对 HEAD 请求处理可能有问题
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(ASR_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ health: true }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    return response.ok || response.status === 400; // 400 也说明服务在线
  } catch {
    return false;
  }
}
