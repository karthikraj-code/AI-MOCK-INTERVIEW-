// src/lib/cloudinary.ts
'use client';

/**
 * Client-side direct upload to Cloudinary unsigned preset.
 * Returns the secure URL of the uploaded asset.
 *
 * Requires env:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 * - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (unsigned)
 */
export async function uploadVideoToCloudinary(fileOrBlob: File | Blob, folder = 'interview-analysis') {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; // should be an unsigned preset

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  }

  const formData = new FormData();
  formData.append('file', fileOrBlob);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = await resp.json();
  return data.secure_url as string;
}

export function dataUriToFile(dataUri: string, defaultFileName = 'recording.webm'): File {
  const match = dataUri.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid data URI');
  }
  const mime = match[1] || 'video/webm';
  const b64Data = match[2];
  const byteChars = atob(b64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Choose filename by mime
  const extension = mime.includes('webm') ? 'webm' : mime.includes('mp4') ? 'mp4' : 'webm';
  const fileName = defaultFileName.endsWith(`.${extension}`)
    ? defaultFileName
    : `recording.${extension}`;

  return new File([byteArray], fileName, { type: mime });
}

/**
 * Compresses a video file to reduce its size for API uploads
 */
export async function compressVideo(file: File, maxSizeMB = 10): Promise<File> {
  // If file is already small enough, return as is
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // Calculate new dimensions (reduce by 50% if too large)
      const scale = Math.min(1, Math.sqrt((maxSizeMB * 1024 * 1024) / file.size));
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      // Create a new video element for recording
      const compressedVideo = document.createElement('video');
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 1000000 // 1 Mbps
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([compressedBlob], file.name, { type: 'video/webm' });
        resolve(compressedFile);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Play video to capture frames
      video.play();
      
      // Stop recording after video ends
      video.onended = () => {
        mediaRecorder.stop();
      };
      
      // Draw video frames to canvas
      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video for compression'));
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
}


