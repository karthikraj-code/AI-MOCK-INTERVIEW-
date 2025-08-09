
"use client";

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, CheckCircle } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'Ravi Kumar', aptitudeScore: 95, interviewsCompleted: 15, peerRating: 4.8, avatar: 'https://placehold.co/40x40.png' },
  { rank: 2, name: 'Priya Sharma', aptitudeScore: 92, interviewsCompleted: 12, peerRating: 4.9, avatar: 'https://placehold.co/40x40.png' },
  { rank: 3, name: 'Amit Singh', aptitudeScore: 90, interviewsCompleted: 18, peerRating: 4.5, avatar: 'https://placehold.co/40x40.png' },
  { rank: 4, name: 'Sneha Patel', aptitudeScore: 88, interviewsCompleted: 10, peerRating: 4.7, avatar: 'https://placehold.co/40x40.png' },
  { rank: 5, name: 'Vikas Reddy', aptitudeScore: 85, interviewsCompleted: 20, peerRating: 4.4, avatar: 'https://placehold.co/40x40.png' },
  { rank: 6, name: 'Anjali Gupta', aptitudeScore: 84, interviewsCompleted: 14, peerRating: 4.6, avatar: 'https://placehold.co/40x40.png' },
  { rank: 7, name: 'Manish Das', aptitudeScore: 82, interviewsCompleted: 16, peerRating: 4.3, avatar: 'https://placehold.co/40x40.png' },
  { rank: 8, name: 'Sunita Rao', aptitudeScore: 81, interviewsCompleted: 9, peerRating: 4.8, avatar: 'https://placehold.co/40x40.png' },
  { rank: 9, name: 'Deepak Iyer', aptitudeScore: 80, interviewsCompleted: 11, peerRating: 4.2, avatar: 'https://placehold.co/40x40.png' },
  { rank: 10, name: 'Pooja Nair', aptitudeScore: 78, interviewsCompleted: 13, peerRating: 4.7, avatar: 'https://placehold.co/40x40.png' },
];

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-600" />;
    return <span className="font-mono text-sm text-muted-foreground">{rank}</span>;
}

export default function LeaderboardPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-yellow-400/20 rounded-full mb-3">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Leaderboard</CardTitle>
                    <CardDescription>See how you rank among your peers. Keep practicing to climb up!</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center w-[50px]">Rank</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead className="text-center">Aptitude Score</TableHead>
                            <TableHead className="text-center">Interviews Done</TableHead>
                            <TableHead className="text-center">Peer Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map((user) => (
                            <TableRow key={user.rank} className="font-medium">
                                <TableCell className="text-center"><RankIcon rank={user.rank} /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="student avatar" />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-mono">{user.aptitudeScore}</TableCell>
                                <TableCell className="text-center font-mono">{user.interviewsCompleted}</TableCell>
                                <TableCell className="text-center font-mono">{user.peerRating.toFixed(1)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
