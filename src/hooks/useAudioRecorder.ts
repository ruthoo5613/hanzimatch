/**
 * MediaRecorder 录音 Hook
 * 用于录制音频并转换为 base64
 */
import { useState, useRef, useCallback } from 'react';
import { audioBlobToBase64 } from './useTencentASR';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 检查浏览器支持的 MIME 类型
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // 每 100ms 收集一次数据
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      const stream = streamRef.current;
      
      if (!recorder || recorder.state === 'inactive') {
        console.log('Recorder not active');
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        // 停止流
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // 检查是否有音频数据
        if (chunksRef.current.length === 0) {
          console.log('No audio chunks');
          resolve(null);
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        
        try {
          const base64 = await audioBlobToBase64(blob);
          resolve(base64);
        } catch (error) {
          console.error('Failed to convert audio:', error);
          resolve(null);
        }
      };

      recorder.stop();
      setIsRecording(false);
    });
  }, []);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  const isSupported = typeof window !== 'undefined' && 'MediaRecorder' in window;

  return {
    isSupported,
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
  };
}