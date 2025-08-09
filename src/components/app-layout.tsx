"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  LogOut,
  User,
  Settings,
  Sun,
  Sparkles,
  BarChart2,
  Crown,
  GraduationCap,
  Moon,
  BrainCircuit,
  Languages,
  Users,
  Building2,
  Trophy,
  LayoutDashboard,
  Menu,
  MessageSquare,
  ClipboardList,
  UserCheck,
  FileText,
  Library
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Chatbot } from "./chatbot/chatbot";

const CareerCompassLogo = () => (
    <div className="flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-primary">Career Compass</span>
    </div>
)

// Generate default avatar with user's first letter
const getDefaultAvatar = (email: string) => {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`;
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [userImage, setUserImage] = useState("");
  const [userName, setUserName] = useState("U");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUserImage(session.user.image || "");
      // Use name, email, or fallback to "U"
      const displayName = session.user.name || session.user.email || "U";
      setUserName(displayName);
    } else {
      // Fallback when no session
      setUserImage("");
      setUserName("U");
    }
  }, [session]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/interview/setup", label: "Aptitude/HR", icon: ClipboardList, activePaths: ["/interview/setup", "/interview/[id]", "/interview/[id]/results"] },
    { href: "/interview-analysis", label: "Intro Analyzer", icon: UserCheck },
    { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
    { href: "/interview/technical/setup", label: "Mock Tech Interview", icon: BrainCircuit, activePaths: ["/interview/technical/setup", "/interview/technical/[id]"] },
    { href: "/language-coach", label: "Language Coach", icon: Languages },
    { href: "/peer-practice", label: "Peer Practice", icon: Users },
    { href: "/company-simulator", label: "Company Simulator", icon: Building2 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/resources", label: "Resources", icon: Library },
  ];

  const isActive = (href: string, activePaths?: string[]) => {
    if (pathname === href) return true;
    if (activePaths) {
      const regexPaths = activePaths.map(p => new RegExp(`^${p.replace(/\[.*?\]/g, '[^/]+')}$`));
      return regexPaths.some(rp => rp.test(pathname));
    }
    return false;
  }
  
  const getCurrentSection = () => {
    const activeLink = navLinks.find(link => isActive(link.href, link.activePaths));
    return activeLink ? activeLink.label : 'General';
  }

  const NavContent = () => (
    <nav className="flex flex-col gap-4 text-lg font-medium">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            isActive(link.href, link.activePaths) ? "bg-muted text-primary font-semibold" : ""
          }`}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
       <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <CareerCompassLogo />
            </Link>
          </div>
          <div className="flex-1">
            <NavContent />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                 <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 mb-4">
                   <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <CareerCompassLogo />
                   </Link>
                 </div>
                <div className="px-4">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
              {/* Future: Add a global search bar here maybe */}
            </div>
            
             <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                       <Avatar className="h-8 w-8">
                          {userImage ? (
                            <AvatarImage src={userImage} alt={userName} />
                          ) : (
                            <AvatarImage 
                              src={getDefaultAvatar(session?.user?.email || "user")} 
                              alt={userName} 
                            />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    signOut({ callbackUrl: '/login' });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
            {children}
          </main>
          <Chatbot section={getCurrentSection()} />
      </div>
    </div>
  );
}