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


