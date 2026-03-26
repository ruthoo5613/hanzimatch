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
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // 停止所有 tracks
        stream.getTracks().forEach(track => track.stop());
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
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        try {
          const base64 = await audioBlobToBase64(blob);
          resolve(base64);
        } catch (error) {
          console.error('Failed to convert audio:', error);
          resolve(null);
        }

        // 停止所有 tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.stop();
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