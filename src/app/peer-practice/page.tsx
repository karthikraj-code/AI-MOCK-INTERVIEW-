
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, UserPlus, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, onSnapshot, query, limit, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export default function PeerPracticePage() {
    const router = useRouter();
    const [isSearching, setIsSearching] = useState(false);
    const { toast } = useToast();

    const handleStartSearch = async () => {
        setIsSearching(true);
        const userId = `user_${crypto.randomUUID()}`;

        try {
            const q = query(collection(firestore, 'queue'), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Match found
                const peerDoc = querySnapshot.docs[0];
                const peerId = peerDoc.id;
                const roomId = peerDoc.data().roomId || crypto.randomUUID();

                const batch = writeBatch(firestore);
                // Signal to the waiting user that they have been matched
                batch.update(peerDoc.ref, { matchedWith: userId, roomId });
                // We don't delete immediately, the waiting user will delete it.
                
                toast({ title: "Peer Found!", description: "Redirecting to your practice room." });
                router.push(`/peer-practice/${roomId}?userId=${userId}&peerId=${peerId}`);

            } else {
                // No peer found, add to queue
                const roomId = crypto.randomUUID();
                const userDocRef = doc(firestore, 'queue', userId);
                // Use a batch to ensure the set operation completes before we listen
                const batch = writeBatch(firestore);
                batch.set(userDocRef, { waiting: true, timestamp: new Date(), roomId });
                await batch.commit();
                
                const unsubscribe = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists() && doc.data().matchedWith) {
                        unsubscribe();
                        const peerId = doc.data().matchedWith;
                        
                        // The matched user (callee) is responsible for deleting the queue document.
                        // This user just navigates away.
                        toast({ title: "Peer Found!", description: "Redirecting to your practice room." });
                        // This user becomes the "caller" as they have the peerId to connect to.
                        router.push(`/peer-practice/${roomId}?userId=${userId}&peerId=${peerId}`);
                    }
                });

                // Implement a timeout to prevent users from waiting forever
                setTimeout(async () => {
                    unsubscribe();
                    // Check if the document still exists and hasn't been matched
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists() && !docSnap.data().matchedWith) {
                         // Clean up the queue if no match was found
                         const deleteBatch = writeBatch(firestore);
                         deleteBatch.delete(userDocRef);
                         await deleteBatch.commit();
                         setIsSearching(false);
                         toast({ variant: 'destructive', title: 'No peer found', description: 'Please try searching again later.' });
                    }
                }, 30000); // 30 second timeout
            }
        } catch (error) {
            console.error("Error matching peer:", error);
            setIsSearching(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the matching service.' });
        }
    };

    const handleInviteFriend = () => {
        const roomId = crypto.randomUUID();
        const userId = `user_${crypto.randomUUID()}`;
        // The user who creates the room is the "caller" and doesn't have a peerId initially.
        router.push(`/peer-practice/${roomId}?userId=${userId}`);
    };

    return (
        <AppLayout>
            <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
                 <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl">Peer Interview Practice</CardTitle>
                        <CardDescription>Practice live with another student to sharpen your skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6 flex flex-col items-center justify-center gap-4">
                            <User className="h-10 w-10 text-primary" />
                            <h3 className="text-xl font-semibold">Random Match</h3>
                            <p className="text-muted-foreground text-sm">Get paired with another student who is also looking to practice.</p>
                            <Button onClick={handleStartSearch} className="w-full" disabled={isSearching}>
                                {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSearching ? 'Searching...' : 'Find a Peer'}
                            </Button>
                        </Card>
                        <Card className="p-6 flex flex-col items-center justify-center gap-4">
                            <UserPlus className="h-10 w-10 text-primary" />
                            <h3 className="text-xl font-semibold">Invite a Friend</h3>
                            <p className="text-muted-foreground text-sm">Generate an invitation link to practice with a specific friend.</p>
                            <Button variant="outline" className="w-full" onClick={handleInviteFriend}>
                                <LinkIcon className="mr-2 h-4 w-4"/>
                                Create Private Room
                            </Button>
                        </Card>
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
