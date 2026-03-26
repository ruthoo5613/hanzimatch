/** 腾讯云 ASR 客户端 - 已完成
 * 连接到本地后端服务 http://localhost:3001
 * 
 * 使用方式：
 * 1. 启动后端：cd server && node server.js
 * 2. 设置环境变量 TENCENTCLOUD_SECRET_ID 和 TENCENTCLOUD_SECRET_KEY
 * 3. 需要修改 Level1 使用 MediaRecorder 录音发送到此服务
 */

const ASR_SERVER_URL = 'http://localhost:3001/asr';

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

    if (!response.ok) {
      throw new Error(`ASR server error: ${response.status}`);
    }

    const data = await response.json();
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
      // 直接返回 base64 数据（去除 data:audio/webm;base64, 前缀）
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(ASR_SERVER_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
