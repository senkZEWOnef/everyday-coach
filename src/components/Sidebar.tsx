"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { 
  Home, 
  BookOpen, 
  Dumbbell, 
  Apple, 
  Calendar, 
  BarChart3, 
  CheckCircle2, 
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auto-expand on desktop, collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/books", label: "Books", icon: BookOpen },
    { href: "/workouts", label: "Workouts", icon: Dumbbell },
    { href: "/nutrition", label: "Nutrition", icon: Apple },
    { href: "/habits", label: "Habits", icon: CheckCircle2 },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/stats", label: "Stats", icon: BarChart3 },
    { href: "/stuffs", label: "Stuffs", icon: Package },
  ];

  return (
    <div className={clsx(
      "fixed left-0 top-0 h-full bg-black/60 backdrop-blur border-r border-white/10 z-40 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <Link href="/" className="font-semibold text-lg text-white">
            Everyday Coach
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className={clsx(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-white" : "text-white/70 group-hover:text-white"
              )} />
              
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};