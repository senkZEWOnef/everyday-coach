"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import { Menu, X, Home, BookOpen, Dumbbell, Apple, Calendar, BarChart3, CheckCircle2, Package } from "lucide-react";

export const SiteNavbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
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

  const link = (href: string, label: string, icon?: React.ComponentType<{ className?: string }>) => {
    const Icon = icon;
    return (
      <Link
        key={href}
        href={href}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors",
          pathname === href && "bg-white/10"
        )}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span className="md:inline">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="container-px max-w-7xl mx-auto flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold text-lg" onClick={() => setIsOpen(false)}>
          Everyday Coach
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => link(item.href, item.label, item.icon))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur">
          <div className="container-px max-w-7xl mx-auto py-2 space-y-1">
            {navItems.map(item => (
              <div key={item.href} className="block">
                {link(item.href, item.label, item.icon)}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
