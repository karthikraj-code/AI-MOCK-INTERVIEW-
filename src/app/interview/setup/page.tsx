"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { generateInterviewQuestions } from "@/ai/flows/question-generator";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Briefcase, Users, UserCheck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ["text/plain", "application/pdf", "text/markdown"];

const interviewRounds = [
  {
    name: "Aptitude Round",
    id: "aptitude",
    description: "Evaluates logical reasoning and problem-solving.",
    icon: Briefcase,
  },
  {
    name: "Group Discussion",
    id: "group-discussion",
    description: "Simulates a group discussion to test communication.",
    icon: Users,
  },
  {
    name: "HR Round",
    id: "hr",
    description: "Assesses personality, behavior, and cultural fit.",
    icon: UserCheck,
  },
];

const formSchema = z.object({
  jobRole: z.string().min(2, { message: "Job role must be at least 2 characters." }),
  interviewRound: z.enum(["aptitude", "group-discussion", "hr"], {
    required_error: "You need to select an interview round.",
  }),
  resumeFile: z
    .any()
    .refine((files) => files?.length == 1, "Resume is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 2MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".txt, .md and .pdf files are accepted."
    ),
});

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type === "application/pdf") {
            resolve(`This is a PDF resume for the role. The file name is ${file.name}. Please generate questions based on a typical resume for this role.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};


export default function InterviewSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const resumeFile = values.resumeFile[0];
        const resumeText = await readFileAsText(resumeFile);
        
        const { questions } = await generateInterviewQuestions({ 
            jobRole: values.jobRole, 
            resume: resumeText,
            interviewRound: values.interviewRound,
        });
        const interviewId = crypto.randomUUID();

        localStorage.setItem(`interview_${interviewId}`, JSON.stringify({
          jobRole: values.jobRole,
          resume: resumeText,
          questions,
          answers: [],
          evaluations: [],
        }));

        toast({
          title: "Interview Ready!",
          description: "Your questions have been generated. Good luck!",
        });
        router.push(`/interview/${interviewId}`);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem setting up your interview. Please check your selections and try again.",
        });
      }
    });
  }

  return (
    <AppLayout>
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-blue-500/5 min-h-screen">
        {/* Enhanced Background with Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse opacity-60"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-blue-500/10 rounded-full blur-lg animate-bounce opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-br from-blue-500/15 to-pink-500/15 rounded-full blur-lg animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="w-full max-w-4xl mx-auto relative z-10 px-4 sm:px-0 overflow-x-hidden">
          {/* Enhanced Header Section */}
          <div className="text-center mb-8 sm:mb-12 transform transition-all duration-1000 hover:scale-105">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500 bg-clip-text text-transparent relative z-10 mb-3 sm:mb-4 animate-pulse">
                Mock Interview
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium px-4">
              Practice makes perfect. Let's get you <span className="text-blue-500 font-semibold">interview-ready!</span>
            </p>
          </div>

          {/* Enhanced Main Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card/90 via-card to-blue-500/5 backdrop-blur-sm border-2 border-border/30 hover:border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-700 transform hover:scale-[1.02] hover:-translate-y-2">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500"></div>
            
            {/* Floating Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

            <CardHeader className="relative z-10 pb-6 sm:pb-8 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 group-hover:translate-x-2 transition-transform duration-500">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-pink-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 group-hover:text-pink-500 transition-colors duration-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl text-foreground group-hover:text-blue-500 transition-colors duration-500">
                    New Mock Interview
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg mt-2">
                    Select an interview round, provide the job role, and upload your resume.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 p-4 sm:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 sm:space-y-10">
                  
                  {/* Enhanced Interview Round Selection */}
                  <FormField
                    control={form.control}
                    name="interviewRound"
                    render={({ field }) => (
                      <FormItem className="space-y-6">
                        <FormLabel className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Select Interview Round
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                          >
                            {interviewRounds.map((round, index) => (
                                <FormItem key={round.id} className="group/item">
                                    <FormControl>
                                        <RadioGroupItem value={round.id} id={round.id} className="peer sr-only" />
                                    </FormControl>
                                    <Label
                                      htmlFor={round.id}
                                      className={cn(
                                        "flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-gradient-to-br from-card to-muted/20 p-6 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-pink-500/5 hover:border-blue-500/50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-blue-500/10 peer-data-[state=checked]:to-pink-500/10 [&:has([data-state=checked])]:border-blue-500 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 cursor-pointer group-hover:shadow-xl relative overflow-hidden"
                                      )}
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                      {/* Animated background for selected state */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-pink-500/5 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity duration-500"></div>
                                      
                                      <div className="relative z-10 flex flex-col items-center">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-pink-500/10 mb-4 group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                                          <round.icon className="h-8 w-8 text-blue-500 group-hover/item:text-pink-500 transition-colors duration-300" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 group-hover/item:text-blue-500 transition-colors duration-300">
                                          {round.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground text-center leading-relaxed">
                                          {round.description}
                                        </p>
                                      </div>
                                      
                                      {/* Shine effect on hover */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -skew-x-12 -translate-x-full group-hover/item:translate-x-full transition-transform duration-700 ease-out"></div>
                                    </Label>
                                </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-pink-500" />
                      </FormItem>
                    )}
                  />

                  {/* Enhanced Job Role Input */}
                  <FormField
                    control={form.control}
                    name="jobRole"
                    render={({ field }) => (
                      <FormItem className="group/input">
                        <FormLabel className="text-xl font-semibold flex items-center gap-2 group-hover/input:text-blue-500 transition-colors duration-300">
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          Job Role
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="e.g., Senior Frontend Developer" 
                              {...field} 
                              className="h-14 text-lg border-2 bg-gradient-to-r from-background to-muted/20 hover:from-blue-500/5 hover:to-pink-500/5 focus:from-blue-500/10 focus:to-pink-500/10 border-border hover:border-blue-500/50 focus:border-blue-500 transition-all duration-500 transform hover:scale-[1.02] focus:scale-[1.02] shadow-lg hover:shadow-xl focus:shadow-2xl placeholder:text-muted-foreground/60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-md pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-pink-500" />
                      </FormItem>
                    )}
                  />

                  {/* Enhanced File Upload */}
                  <FormField
                    control={form.control}
                    name="resumeFile"
                    render={({ field }) => (
                      <FormItem className="group/upload">
                        <FormLabel className="text-xl font-semibold flex items-center gap-2 group-hover/upload:text-pink-500 transition-colors duration-300">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Your Resume
                        </FormLabel>
                        <FormControl>
                           <div className="flex items-center justify-center w-full group-hover/upload:scale-[1.02] transition-transform duration-300">
                                <label 
                                  htmlFor="dropzone-file" 
                                  className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-muted-foreground/30 rounded-2xl cursor-pointer bg-gradient-to-br from-muted/50 to-blue-500/5 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-pink-500/10 hover:border-blue-500/50 transition-all duration-500 transform hover:scale-[1.01] relative overflow-hidden group/dropzone"
                                >
                                    {/* Animated background */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover/dropzone:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                                        <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/10 to-pink-500/10 mb-6 group-hover/dropzone:scale-110 group-hover/dropzone:rotate-12 transition-all duration-500">
                                          <UploadCloud className="w-12 h-12 text-blue-500 group-hover/dropzone:text-pink-500 transition-colors duration-500" />
                                        </div>
                                        <p className="mb-3 text-lg font-semibold text-foreground group-hover/dropzone:text-blue-500 transition-colors duration-300">
                                          <span className="font-bold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-sm text-muted-foreground">TXT, MD, or PDF (MAX. 2MB)</p>
                                        
                                        {/* File selected indicator */}
                                        {form.watch('resumeFile')?.[0]?.name && (
                                          <div className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-pink-500/20 rounded-full border border-blue-500/30">
                                            <p className="text-sm font-medium text-blue-600">
                                              ✓ {form.watch('resumeFile')[0].name}
                                            </p>
                                          </div>
                                        )}
                                    </div>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -skew-x-12 -translate-x-full group-hover/dropzone:translate-x-full transition-transform duration-1000 ease-out"></div>
                                    
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
                         <FormDescription className="text-center text-base">
                          {form.watch('resumeFile')?.[0]?.name 
                            ? `✅ Selected: ${form.watch('resumeFile')[0].name}` 
                            : 'Your resume helps us create relevant questions tailored to your experience.'}
                        </FormDescription>
                        <FormMessage className="text-pink-500" />
                      </FormItem>
                    )}
                  />

                  {/* Enhanced Submit Button */}
                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      className="w-full h-16 text-lg font-bold relative overflow-hidden group bg-gradient-to-r from-blue-500 to-pink-500 hover:from-pink-500 hover:to-blue-500 disabled:from-muted disabled:to-muted transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 disabled:hover:scale-100 disabled:hover:shadow-none" 
                      disabled={isPending}
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isPending && <Loader2 className="h-6 w-6 animate-spin" />}
                        {isPending ? (
                          <>
                            <span>Generating Questions...</span>
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <div 
                                  key={i}
                                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.1}s` }}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          "🚀 Start Interview"
                        )}
                      </span>

                      {/* Animated border */}
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Floating Action Indicators */}
          <div className="flex justify-center mt-8 space-x-4">
            {['Select Round', 'Enter Role', 'Upload Resume', 'Start!'].map((step, index) => (
              <div 
                key={step}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-pink-500/10 border border-blue-500/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-blue-500' : 
                  index === 1 ? 'bg-pink-500' : 
                  index === 2 ? 'bg-blue-500' : 'bg-pink-500'
                } animate-pulse`}></div>
                <span className="text-sm font-medium text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Enhanced Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </AppLayout>
  );
}