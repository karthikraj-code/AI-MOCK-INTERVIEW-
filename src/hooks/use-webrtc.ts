
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { firestore } from '@/lib/firebase';
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  writeBatch,
  getDocs,
} from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Main hook refactored for clarity and robustness
export function useWebRTC(roomId: string, userId: string, peerId?: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  // The user with a peerId in the URL is the "callee", otherwise they are the "caller".
  const isCaller = useRef(!peerId);

  const hangUp = useCallback(async () => {
    if (pc.current) {
        pc.current.onicecandidate = null;
        pc.current.ontrack = null;
        pc.current.onconnectionstatechange = null;
        if(typeof pc.current.close === 'function') {
            pc.current.close();
        }
        pc.current = null;
    }
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    
    // Clean up firebase room data
    try {
        const roomRef = doc(firestore, 'rooms', roomId);
        const roomSnapshot = await getDoc(roomRef);
        if(roomSnapshot.exists()) {
            const batch = writeBatch(firestore);
            
            const callerCandidatesQuery = query(collection(roomRef, 'callerCandidates'));
            const calleeCandidatesQuery = query(collection(roomRef, 'calleeCandidates'));
            
            const callerDocs = await getDocs(callerCandidatesQuery);
            callerDocs.forEach(d => batch.delete(d.ref));

            const calleeDocs = await getDocs(calleeCandidatesQuery);
            calleeDocs.forEach(d => batch.delete(d.ref));

            batch.delete(roomRef);
            await batch.commit();
        }
    } catch (e) {
        console.error("Error during firebase cleanup: ", e);
    }
  }, [roomId, localStream, remoteStream]);


  const toggleMediaTrack = (kind: 'audio' | 'video', enabled?: boolean) => {
    if (localStream) {
        const track = kind === 'video' ? localStream.getVideoTracks()[0] : localStream.getAudioTracks()[0];
        if (track) {
            track.enabled = enabled !== undefined ? enabled : !track.enabled;
        }
    }
  };

  useEffect(() => {
    const unsubs: (()=>void)[] = [];
    let isMounted = true;

    const setupPeerConnection = (stream: MediaStream) => {
        if (!isMounted) return;
        pc.current = new RTCPeerConnection(servers);

        stream.getTracks().forEach((track) => {
            pc.current?.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
            if (isMounted) setRemoteStream(event.streams[0]);
        };

        pc.current.onconnectionstatechange = () => {
            if (!pc.current || !isMounted) return;
            const state = pc.current.connectionState;
            if(state === 'connected') {
                setIsConnected(true);
            } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                setIsConnected(false);
            }
        }
    };
    
    const startSignaling = async () => {
        if (!pc.current || !isMounted) return;
        
        const roomRef = doc(firestore, 'rooms', roomId);
        const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
        const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');

        pc.current.onicecandidate = (event) => {
            if (event.candidate) {
                const targetCollection = isCaller.current ? callerCandidatesCollection : calleeCandidatesCollection;
                addDoc(targetCollection, event.candidate.toJSON());
            }
        };

        if (isCaller.current) {
            // Caller: Create offer and listen for answer
            const offerDescription = await pc.current.createOffer();
            await pc.current.setLocalDescription(offerDescription);
            await setDoc(roomRef, { offer: { type: offerDescription.type, sdp: offerDescription.sdp }, callerId: userId });
            
            const unsubAnswer = onSnapshot(roomRef, (snapshot) => {
                const data = snapshot.data();
                if (pc.current && !pc.current.currentRemoteDescription && data?.answer) {
                    pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });
            unsubs.push(unsubAnswer);

            // Listen for ICE candidates from callee
            const unsubCalleeCandidates = onSnapshot(calleeCandidatesCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
            unsubs.push(unsubCalleeCandidates);

        } else {
            // Callee: Wait for offer, create answer
            const unsubOffer = onSnapshot(roomRef, async (docSnap) => {
                if (docSnap.exists() && docSnap.data().offer && pc.current && !pc.current.currentRemoteDescription) {
                    unsubOffer(); // Stop listening once we have the offer.
                    const offerDescription = docSnap.data().offer;
                    await pc.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

                    const answerDescription = await pc.current.createAnswer();
                    await pc.current.setLocalDescription(answerDescription);

                    await updateDoc(roomRef, { answer: { type: answerDescription.type, sdp: answerDescription.sdp } });
                }
            });
            unsubs.push(unsubOffer);

            // Listen for ICE candidates from caller
            const unsubCallerCandidates = onSnapshot(callerCandidatesCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
            unsubs.push(unsubCallerCandidates);
        }
    };
    
    const initialize = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!isMounted) {
                stream.getTracks().forEach(track => track.stop());
                return;
            };
            setLocalStream(stream);
            setupPeerConnection(stream);
            await startSignaling();
        } catch (e: any) {
            console.error("Error initializing WebRTC", e);
            const message = (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')
                ? "Permission to access camera and microphone was denied."
                : "Could not access camera and microphone.";
            if (isMounted) setError(message);
        }
    };

    initialize();

    return () => {
      isMounted = false;
      unsubs.forEach(unsub => unsub());
      hangUp();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, peerId]); // Dependencies are correct now

  return { localStream, remoteStream, isConnected, error, hangUp, toggleMediaTrack };
}
