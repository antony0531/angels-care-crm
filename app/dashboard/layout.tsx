"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import type { User } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Gauge,
  Activity,
  MousePointer,
  FileText,
  Target,
  MapPin,
  Zap,
  Globe,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const navigation: NavItem[] = [
  { 
    title: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    title: "Analytics", 
    href: "/dashboard/analytics", 
    icon: BarChart3,
    children: [
      { title: "Overview", href: "/dashboard/analytics" },
      { title: "Core Web Vitals", href: "/dashboard/analytics/core-web-vitals" },
      { title: "Technical SEO", href: "/dashboard/analytics/technical-seo" },
      { title: "User Engagement", href: "/dashboard/analytics/user-engagement" },
      { title: "Content Performance", href: "/dashboard/analytics/content-performance" },
      { title: "Conversion Funnel", href: "/dashboard/analytics/conversion-funnel" },
      { title: "Local SEO", href: "/dashboard/analytics/local-seo" },
      { title: "Real-time Monitor", href: "/dashboard/analytics/real-time" }
    ]
  },
  { 
    title: "Leads", 
    href: "/dashboard/leads", 
    icon: Users,
    children: [
      { title: "Dashboard", href: "/dashboard/leads" },
      { title: "All Leads", href: "/dashboard/leads/all" },
      { title: "Lead Sources", href: "/dashboard/leads/sources" },
      { title: "Lead Analytics", href: "/dashboard/leads/analytics" },
      { title: "Lead Forms", href: "/dashboard/leads/forms" },
      { title: "Settings", href: "/dashboard/leads/settings" }
    ]
  },
  { 
    title: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings 
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [agentName, setAgentName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  

  useEffect(() => {
    setMounted(true);
    
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Get user metadata for name
        const userData = session.user.user_metadata;
        setAgentName(userData.name || session.user.email?.split('@')[0] || 'Agent');
      } else {
        router.push("/login");
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userData = session.user.user_metadata;
          setAgentName(userData.name || session.user.email?.split('@')[0] || 'Agent');
        } else if (event === 'SIGNED_OUT') {
          router.push("/login");
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    return item.children?.some(child => pathname === child.href);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect to login)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-foreground">Angels Care</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <div key={item.title}>
              <div
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
                  ${isParentActive(item) 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.title);
                  } else {
                    router.push(item.href);
                  }
                }}
              >
                <item.icon className={`h-5 w-5 ${!sidebarOpen ? "mx-auto" : "mr-3"}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.children && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedItems.includes(item.title) ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </>
                )}
              </div>
              {sidebarOpen && item.children && expandedItems.includes(item.title) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-2 py-1 text-sm rounded-md transition-colors
                        ${isActive(child.href)
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className={`h-5 w-5 ${!sidebarOpen ? "mx-auto" : "mr-3"}`} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center flex-1 gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search leads, agents, or activities..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/avatar-placeholder.png" alt={agentName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {agentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{agentName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Performance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Toast Notifications */}
      <Toaster richColors closeButton />
    </div>
  );
}