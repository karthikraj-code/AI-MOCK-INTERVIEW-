
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Code, Database, Network, Server, Star } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const topics = [
  { id: "dsa", name: "Data Structures & Algorithms", icon: Code },
  { id: "dbms", name: "DBMS", icon: Database },
  { id: "os", name: "Operating Systems", icon: Server },
  { id: "cn", name: "Computer Networks", icon: Network },
  { id: "oops", name: "OOPs", icon: Star },
];

const formSchema = z.object({
  topic: z.enum(["dsa", "dbms", "os", "cn", "oops"], {
      required_error: "You must select a technical topic.",
  }),
  experienceLevel: z.enum(["intern", "junior", "senior"], {
      required_error: "You must select an experience level.",
  }),
});

export default function TechnicalInterviewSetupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
      const interviewId = crypto.randomUUID();
      localStorage.setItem(`tech_interview_${interviewId}`, JSON.stringify({
          topic: values.topic,
          experienceLevel: values.experienceLevel,
          history: [],
          currentQuestion: null, // Will be generated on the interview page
      }));

      toast({
        title: "Technical Interview Ready!",
        description: "Your session is being prepared. Good luck!",
      });
      router.push(`/interview/technical/${interviewId}`);
  }

  return (
    <AppLayout>
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
          <Card>
            <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <CardTitle className="text-xl sm:text-2xl">Mock Technical Interview Setup</CardTitle>
                </div>
              <CardDescription className="text-sm sm:text-base">
                Choose your topic and experience level to start the simulated technical interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                  
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm sm:text-base font-semibold">Select Interview Topic</FormLabel>
                         <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                          >
                            {topics.map((topic) => (
                                <FormItem key={topic.id}>
                                    <FormControl>
                                        <RadioGroupItem value={topic.id} id={topic.id} className="peer sr-only" />
                                    </FormControl>
                                    <Label
                                    htmlFor={topic.id}
                                    className={cn(
                                        "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 sm:p-4 h-24 sm:h-28 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                        "cursor-pointer"
                                    )}
                                    >
                                        <topic.icon className="mb-2 h-5 w-5 sm:h-6 sm:w-6" />
                                        <span className="text-xs sm:text-sm font-medium text-center leading-tight">{topic.name}</span>
                                    </Label>
                                </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-semibold">Select Your Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="intern">Intern / Fresher</SelectItem>
                                <SelectItem value="junior">Junior Developer (1-3 years)</SelectItem>
                                <SelectItem value="senior">Senior Developer (3+ years)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" size="lg">
                    Start Technical Interview
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}
