'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecorderStatus = 'idle' | 'permission-requested' | 'recording' | 'stopped' | 'error';

export function useMediaRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const isRecording = status === 'recording';
  const isReady = status !== 'idle' && status !== 'permission-requested' && !!stream && !error;

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping media recorder during cleanup", e);
      }
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    setStream(null);
    setStatus('idle');
    setError(null);
  }, [stream]);

  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && (status === 'recording' || mediaRecorderRef.current.state === 'recording')) {
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          
          if (blob.size === 0) {
            console.warn("Recorded blob is empty, returning null.");
            resolve(null);
            return;
          }

          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (readErr) => {
            console.error("FileReader error:", readErr);
            resolve(null);
          };
          // Do not cleanup here, let the calling component decide when to cleanup
        };
        
        mediaRecorderRef.current.stop();
        setStatus('stopped');

      } else {
        console.warn(`stopRecording called but recorder not active. Status: ${status}`);
        resolve(null);
      }
    });
  }, [status]);
  
  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      setError('Media stream is not available on this device.');
      setStatus('error');
      return;
    }
    
    if (isRecording) {
      return;
    }

    setStatus('permission-requested');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      
      const mimeTypes = [
        'video/webm; codecs=vp8,opus',
        'video/webm; codecs=vp9,opus',
        'video/webm',
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      const recorder = new MediaRecorder(mediaStream, { mimeType: supportedMimeType });
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recordedChunksRef.current = [];
      recorder.start(); 
      setStatus('recording');
      
    } catch (err) {
      console.error('Error accessing camera/mic:', err);
      setError('Permission denied. Please allow camera and microphone access.');
      setStatus('error');
    }
  }, [isRecording]);

  useEffect(() => {
    // This is a cleanup effect that will run when the component unmounts.
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return { status, isRecording, stream, error, startRecording, stopRecording, cleanup, isReady };
}
