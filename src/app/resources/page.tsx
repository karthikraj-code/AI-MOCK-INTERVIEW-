
"use client";

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Library, Map, Book, Download, Search, Video, FileText, Link as LinkIcon, Star, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// SIMULATED DATABASE - In a real app, this data would live in Firebase Firestore.

type Roadmap = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

type Resource = {
  id: string;
  subjectId: string;
  title: string;
  type: 'Video' | 'PDF' | 'Link';
  icon: React.ElementType;
  tags: string[];
  link: string;
};

type Subject = {
    id: string;
    name: string;
};

const MOCK_ROADMAPS: Roadmap[] = [
  {
    id: "sde-product",
    title: "Software Engineer (Product-Based)",
    description: "A 6-month roadmap to crack top product-based companies like Google, Amazon, etc.",
    tags: ["6 Months", "Advanced", "SDE"],
  },
  {
    id: "full-stack",
    title: "Full Stack Developer",
    description: "Learn MERN stack and build real-world projects from scratch.",
    tags: ["4 Months", "Intermediate", "Web Dev"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    description: "Master SQL, Python, and Tableau to become a job-ready data analyst.",
    tags: ["3 Months", "Beginner", "Data"],
  },
  {
    id: "internship-seeker",
    title: "Internship Seeker (1st/2nd Year)",
    description: "A foundational roadmap to build skills and your profile for internships.",
    tags: ["Ongoing", "Beginner", "College"],
  },
];

const MOCK_SUBJECTS: Subject[] = [
    { id: "dsa", name: "DSA" },
    { id: "dbms", name: "DBMS" },
    { id: "os", name: "OS" },
    { id: "cn", name: "Computer Networks" },
    { id: "oops", name: "OOPs" },
    { id: "aptitude", name: "Aptitude" },
    { id: "hr", name: "HR Interview" },
];

const MOCK_RESOURCES: Resource[] = [
  { id: "1", subjectId: "dsa", title: "Complete C++ DSA Course", type: "Video", icon: Video, tags: ["Beginner", "Video"], link: "#" },
  { id: "2", subjectId: "dsa", title: "Top 50 Array Interview Questions", type: "PDF", icon: FileText, tags: ["Practice", "PDF"], link: "#" },
  { id: "3", subjectId: "dsa", title: "Striver's SDE Sheet", type: "Link", icon: LinkIcon, tags: ["Advanced", "Practice"], link: "#" },
  { id: "4", subjectId: "dbms", title: "Normalization Explained Simply", type: "Video", icon: Video, tags: ["Concepts", "Video"], link: "#" },
  { id: "5", subjectId: "dbms", title: "SQL Practice Set (HackerRank)", type: "Link", icon: LinkIcon, tags: ["Practice", "SQL"], link: "#" },
  { id: "6", subjectId: "hr", title: "Top 50 HR Interview Questions & Answers", type: "PDF", icon: FileText, tags: ["Top 50", "PDF"], link: "#" },
  { id: "7", subjectId: "hr", title: "How to Answer 'Tell Me About Yourself'", type: "Video", icon: Video, tags: ["Behavioral", "Video"], link: "#" },
];


// --- UI Components ---

const ResourceCard = ({ title, description, tags }: Omit<Roadmap, 'id'>) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
        </CardContent>
    </Card>
);

const ResourceItem = ({ title, icon: Icon, tags, link }: Omit<Resource, 'id' | 'subjectId'>) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted">
        <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 text-primary"/>
            <div>
                <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{title}</a>
                <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>
            </div>
        </div>
        <Button variant="ghost" size="icon">
            <CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-500"/>
        </Button>
    </div>
);

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-12 w-full mt-8" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
    </div>
);


// --- Main Page Component ---

export default function ResourcesPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from Firebase
    const fetchData = async () => {
        setIsLoading(true);
        // In a real app, you would use the Firebase SDK here.
        // e.g., const roadmapsData = await getDocs(collection(db, 'roadmaps'));
        await new Promise(resolve => setTimeout(resolve, 1000)); // simulate network delay
        
        setRoadmaps(MOCK_ROADMAPS);
        setSubjects(MOCK_SUBJECTS);
        setResources(MOCK_RESOURCES);
        
        setIsLoading(false);
    }
    fetchData();
  }, []);


  return (
    <AppLayout>
        <main className="flex-1 p-4 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Library className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Resources &amp; Roadmaps Hub</h1>
                    <p className="text-muted-foreground">Your one-stop library for end-to-end interview preparation.</p>
                </div>
            </div>

            {isLoading ? <LoadingSkeleton /> : (
                <Tabs defaultValue="roadmaps" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                        <TabsTrigger value="roadmaps"><Map className="mr-2 h-4 w-4"/> Roadmaps</TabsTrigger>
                        <TabsTrigger value="prep"><Book className="mr-2 h-4 w-4"/> Subject Prep</TabsTrigger>
                        <TabsTrigger value="search"><Search className="mr-2 h-4 w-4"/> Search</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="roadmaps" className="mt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roadmaps.map((roadmap) => (
                                <ResourceCard key={roadmap.id} {...roadmap} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="prep" className="mt-6">
                         <Tabs defaultValue={subjects[0]?.id || 'dsa'} className="w-full">
                            <TabsList className="flex-wrap h-auto">
                                {subjects.map(subject => (
                                    <TabsTrigger key={subject.id} value={subject.id}>{subject.name}</TabsTrigger>
                                ))}
                            </TabsList>
                            {subjects.map(subject => (
                                <TabsContent key={subject.id} value={subject.id} className="mt-4 space-y-3">
                                    {resources.filter(r => r.subjectId === subject.id).map(item => <ResourceItem key={item.id} {...item} />)}
                                </TabsContent>
                            ))}
                         </Tabs>
                    </TabsContent>

                    <TabsContent value="search" className="mt-6 max-w-3xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Find What You Need</CardTitle>
                                <CardDescription>Search for topics, questions, or notes across all subjects.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input placeholder="e.g., 'SQL Joins' or 'HR weakness question'..." />
                                    <Button><Search className="mr-2 h-4 w-4"/> Search</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline">PDF</Button>
                                    <Button variant="outline">Video</Button>
                                    <Button variant="outline">Last-Minute</Button>
                                    <Button variant="outline">Beginner</Button>
                                    <Button variant="outline">Advanced</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </main>
    </AppLayout>
  );
}
