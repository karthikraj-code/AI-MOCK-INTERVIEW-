
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, PhoneOff, Video, VideoOff, Copy, Check, AlertTriangle, MicOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type VideoCallProps = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onHangUp: () => void;
  isConnected: boolean;
  roomId: string;
  userId: string;
  error?: string | null;
  toggleMediaTrack: (kind: 'audio' | 'video', enabled?: boolean) => void;
};

const VideoPlayer = ({ stream, muted = false, error }: { stream: MediaStream | null; muted?: boolean; error?: string | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-muted rounded-lg aspect-video flex items-center justify-center relative border overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover scale-x-[-1]" />
      {!stream && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
       {error && (
         <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 p-4 text-center">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                   Camera/Mic access is required. Please check your browser site settings to allow access and refresh the page.
                </AlertDescription>
            </Alert>
        </div>
      )}
    </div>
  );
};


export default function VideoCall({
  localStream,
  remoteStream,
  onHangUp,
  isConnected,
  roomId,
  userId,
  error,
  toggleMediaTrack,
}: VideoCallProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const baseUrl = `${url.protocol}//${url.host}`;
        // The invite link should contain the creator's ID as the peerId for the friend to join.
        setInviteLink(`${baseUrl}/peer-practice/${roomId}?userId=${crypto.randomUUID().slice(0,8)}&peerId=${userId}`);
    }
  }, [roomId, userId]);


  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleToggleAudio = () => {
      setIsAudioMuted(prev => {
          const newState = !prev;
          toggleMediaTrack('audio', !newState);
          return newState;
      });
  };

  const handleToggleVideo = () => {
      setIsVideoOff(prev => {
          const newState = !prev;
          toggleMediaTrack('video', !newState);
          return newState;
      });
  };


  return (
    <div className="w-full max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Live Interview Session</CardTitle>
          <div className="flex items-center justify-between flex-wrap gap-2">
            {isConnected ? (
                <CardDescription className="text-green-600 font-semibold animate-pulse">Peer Connected</CardDescription>
            ) : (
                <CardDescription>{error ? 'Connection Failed' : 'Waiting for peer to join...'}</CardDescription>
            )}
            
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} disabled={!inviteLink || !!error || isConnected}>
                    {isCopied ? <Check className="mr-2 h-4 w-4"/> : <Copy className="mr-2 h-4 w-4"/>}
                    {isCopied ? 'Copied!' : 'Copy Invite Link'}
                </Button>
            </div>

          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <VideoPlayer stream={remoteStream} />
            <p className="text-sm text-center mt-2 font-medium">Peer's Camera</p>
          </div>
          <div>
            <VideoPlayer stream={localStream} muted error={error} />
            <p className="text-sm text-center mt-2 font-medium">Your Camera</p>
          </div>
        </CardContent>
        <CardContent className="flex justify-center gap-4 mt-4">
           <Button variant={isAudioMuted ? "secondary" : "outline"} size="lg" onClick={handleToggleAudio} disabled={!!error}>
              {isAudioMuted ? <MicOff /> : <Mic />}
              <span className="sr-only">{isAudioMuted ? 'Unmute' : 'Mute'}</span>
           </Button>
            <Button variant={isVideoOff ? "secondary" : "outline"} size="lg" onClick={handleToggleVideo} disabled={!!error}>
              {isVideoOff ? <VideoOff /> : <Video />}
               <span className="sr-only">{isVideoOff ? 'Turn on camera' : 'Turn off camera'}</span>
           </Button>
          <Button variant="destructive" size="lg" onClick={onHangUp}>
            <PhoneOff className="mr-2 h-4 w-4" /> End Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
