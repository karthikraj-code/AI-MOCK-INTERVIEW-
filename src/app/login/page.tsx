
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Logged in successfully",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Google login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-b from-purple-50 via-white to-white dark:from-background dark:to-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome to Career Compass</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Transform your hiring process with AI-powered intelligence</p>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <Button 
              type="submit" 
              className="w-full text-lg h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <p className="text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>

          <div className="p-6 rounded-lg bg-blue-50 border-2 border-orange-400 dark:bg-secondary dark:border-orange-500">
             <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-primary-foreground">343+ Students and Counting!</h3>
             </div>
             <p className="mt-2 text-gray-600 dark:text-muted-foreground">
                Students from various colleges are actively using our platform to enhance their skills, gain confidence, and ace their interviews.
             </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-lg mx-auto">
            <h2 className="text-4xl font-bold">Why Choose Career Compass?</h2>
            <p className="mt-4 text-lg opacity-90">Our AI-powered platform offers comprehensive interview preparation tools to help you succeed.</p>

            <div className="mt-10 space-y-6">
                <div>
                    <h3 className="font-bold text-xl">AI-Powered Mock Interviews</h3>
                    <p className="mt-1 opacity-90">Experience realistic, role-specific simulations.</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl">Comprehensive Feedback</h3>
                    <p className="mt-1 opacity-90">Get detailed performance reports with strengths & weaknesses.</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl">Flexible Scheduling</h3>
                    <p className="mt-1 opacity-90">Book mock interviews at your convenience, 24/7 availability.</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl">Performance Analytics</h3>
                    <p className="mt-1 opacity-90">Track progress with detailed insights.</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl">Institutional Insights</h3>
                    <p className="mt-1 opacity-90">Colleges can monitor student performance.</p>
                </div>
                <div>
                    <h3 className="font-bold text-xl">Instant Results</h3>
                    <p className="mt-1 opacity-90">Get immediate feedback after each session.</p>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-bold">Testimonials</h3>
                <div className="mt-4 p-6 rounded-xl bg-white/20 backdrop-blur-sm">
                    <p className="italic">"Thanks to Career Compass, I felt much more confident during my actual interviews. The platform's analytics helped me identify and improve my weak areas."</p>
                    <p className="mt-4 font-bold">Rahul Verma</p>
                    <p className="text-sm opacity-90">Recent Graduate</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
