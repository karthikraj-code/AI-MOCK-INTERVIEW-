
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FullReport } from "@/lib/interview-analysis/types";
import { BarChart, Smile, Hand, Users, Mic, BookOpen, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ReportViewProps = {
  report: FullReport;
  onRetry: () => void;
};

const StatCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string | number, unit?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
                {value}
                {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
            </div>
        </CardContent>
    </Card>
)

export default function ReportView({ report, onRetry }: ReportViewProps) {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Interview Report</h1>
        <Button onClick={onRetry} variant="outline">
            <Repeat className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>A summary of your body language and speech analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<BarChart className="h-4 w-4"/>} title="Eye Contact" value={report.eyeContactScore} unit="/ 100" />
                <StatCard icon={<Smile className="h-4 w-4"/>} title="Smile Ratio" value={`${(report.smileRatio * 100).toFixed(0)}%`} />
                <StatCard icon={<Mic className="h-4 w-4"/>} title="Speech Clarity" value={report.clarityScore} unit="/ 100" />
                <StatCard icon={<Users className="h-4 w-4"/>} title="Filler Words" value={report.fillerWordCount} />
          </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hand /> Gesture & Posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Gesture Usage</h4>
              <p className="text-muted-foreground">{report.gestureUsage}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Posture Analysis</h4>
              <p className="text-muted-foreground">{report.postureAnalysis}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic /> Speech Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <h4 className="font-semibold mb-1">Pace</h4>
              <p className="text-muted-foreground">{report.pace.toFixed(0)} words per minute</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sentiment</h4>
              <Badge variant={report.sentiment === 'positive' ? 'default' : report.sentiment === 'negative' ? 'destructive' : 'secondary'} className="capitalize">{report.sentiment}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen /> Full Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap p-4 bg-muted rounded-md">{report.transcription}</p>
        </CardContent>
      </Card>
    </div>
  );
}
