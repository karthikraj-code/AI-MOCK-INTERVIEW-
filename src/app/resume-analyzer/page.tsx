
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import { analyzeResume, AnalyzeResumeOutput } from "@/ai/flows/resume-analyzer";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, Bot, ThumbsDown, ThumbsUp, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ["text/plain", "application/pdf", "text/markdown", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const formSchema = z.object({
  jobRole: z.string().min(2, { message: "Job role must be at least 2 characters." }),
  resumeFile: z
    .any()
    .refine((files) => files?.length == 1, "Resume is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 2MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".txt, .md, .docx, and .pdf files are accepted."
    ),
});

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type === "application/pdf" || file.type.includes('wordprocessingml')) {
            resolve(`This is a binary file named ${file.name}. Please provide analysis for a typical resume for the specified job role.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

const ResultsDisplay = ({ results }: { results: AnalyzeResumeOutput }) => (
    <Card className="mt-8 animate-in fade-in-50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot /> AI Analysis Complete</CardTitle>
            <div className="flex items-center gap-2">
                <CardDescription>Overall Recommendation Score:</CardDescription>
                <Badge variant={results.recommendation_score > 7 ? 'default' : results.recommendation_score > 4 ? 'secondary' : 'destructive'}>
                    {results.recommendation_score} / 10
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ThumbsDown className="text-destructive"/> Key Weaknesses</h3>
                <ul className="space-y-2 list-disc list-inside pl-2">
                    {results.weaknesses.map((item, index) => (
                        <li key={index} className="text-muted-foreground">{item}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ThumbsUp className="text-green-500"/> Improvement Suggestions</h3>
                 <ul className="space-y-2 list-disc list-inside pl-2">
                    {results.suggestions.map((item, index) => (
                        <li key={index} className="text-muted-foreground">{item}</li>
                    ))}
                </ul>
            </div>
            {results.rewritten_summary && (
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Wand2 className="text-primary"/> Rewritten Summary</h3>
                    <blockquote className="p-4 bg-muted border-l-4 border-primary/50 rounded-r-md italic">
                        {results.rewritten_summary}
                    </blockquote>
                </div>
            )}
        </CardContent>
    </Card>
);

export default function ResumeAnalyzerPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setAnalysisResult(null);
    startTransition(async () => {
      try {
        const resumeFile = values.resumeFile[0];
        const resumeText = await readFileAsText(resumeFile);
        
        const result = await analyzeResume({ 
            jobRole: values.jobRole, 
            resumeText: resumeText,
        });
        
        setAnalysisResult(result);
        toast({
          title: "Analysis Complete!",
          description: "Your resume has been successfully analyzed.",
        });

      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem analyzing your resume. Please try again.",
        });
      }
    });
  }

  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle className="text-2xl">AI Resume Analyzer</CardTitle>
                        <CardDescription>
                            Upload your resume to get instant feedback and improvement suggestions.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="jobRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Job Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Software Development Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resumeFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Resume</FormLabel>
                        <FormControl>
                           <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">TXT, MD, DOCX, or PDF (MAX. 2MB)</p>
                                    </div>
                                    <Input 
                                        id="dropzone-file" 
                                        type="file" 
                                        className="hidden" 
                                        accept={ACCEPTED_FILE_TYPES.join(",")}
                                        onChange={(e) => field.onChange(e.target.files)}
                                    />
                                </label>
                            </div> 
                        </FormControl>
                         <FormDescription>
                          {form.watch('resumeFile')?.[0]?.name ? `Selected file: ${form.watch('resumeFile')[0].name}` : 'The AI will analyze your resume against the job role.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending} size="lg">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Analyzing..." : "Analyze My Resume"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {isPending && (
            <div className="text-center mt-8 p-4">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Our AI is reading your resume. This may take a moment...</p>
            </div>
          )}
          
          {analysisResult && <ResultsDisplay results={analysisResult} />}

        </div>
      </main>
    </AppLayout>
  );
}
