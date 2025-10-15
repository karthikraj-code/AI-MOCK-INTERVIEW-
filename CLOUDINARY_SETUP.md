# Cloudinary Setup for Video Analysis

The video analyzer requires Cloudinary for uploading and processing video files. Here's how to set it up:

## Option 1: Quick Setup (Recommended)

### 1. Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. You'll get 25GB of storage and 25GB of bandwidth per month

### 2. Get Your Credentials
1. In your Cloudinary dashboard, go to "Settings" → "Upload"
2. Note down your **Cloud Name**
3. Create an **Upload Preset**:
   - Go to "Settings" → "Upload" → "Upload presets"
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Set "Folder" to "interview-analysis"
   - Save and note down the **Preset Name**

### 3. Add Environment Variables
Create a `.env.local` file in your project root with:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name_here

# Other required variables
GEMINI_API_KEY=your_gemini_api_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Option 2: Without Cloudinary (Fallback)

The application will automatically fall back to using compressed data URIs if Cloudinary is not configured. However, this has limitations:

- **File size limit**: Videos must be under 5MB
- **Performance**: Slower processing for large videos
- **Reliability**: May fail with very large files

## Testing the Setup

1. Start your development server: `npm run dev`
2. Go to the Interview Analysis page
3. Record a short video (under 30 seconds)
4. The system should either:
   - Upload to Cloudinary successfully, OR
   - Use compressed data URI as fallback

## Troubleshooting

### "Cloudinary not configured" Error
- Make sure your `.env.local` file exists
- Check that the environment variable names are exactly as shown
- Restart your development server after adding environment variables

### Upload Failures
- Check your Cloudinary credentials
- Ensure your upload preset is set to "Unsigned"
- Verify your Cloudinary account has available bandwidth

### Video Too Large
- The system automatically compresses videos over 5MB
- For best results, keep recordings under 2-3 minutes
- Use good lighting to reduce file size

## Benefits of Using Cloudinary

✅ **Reliable**: Professional cloud storage  
✅ **Fast**: Global CDN for quick access  
✅ **Scalable**: Handles large files easily  
✅ **Optimized**: Automatic video compression  
✅ **Free Tier**: 25GB storage + 25GB bandwidth/month  

Without Cloudinary, you're limited to small, compressed videos that may not provide the best analysis quality.
