"use client";
import Link from "next/link";
import { 
  Heart, 
  Github, 
  Twitter, 
  Instagram, 
  Mail,
  MapPin,
  Calendar,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20 backdrop-blur">
      <div className="container-px max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-lg">Everyday Coach</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your personal wellness companion for building better habits, tracking nutrition, 
              planning workouts, and growing spiritually every day.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@everydaycoach.com"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Navigation</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-white/60 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
              <Link href="/books" className="block text-white/60 hover:text-white transition-colors text-sm">
                Books & Reading
              </Link>
              <Link href="/workouts" className="block text-white/60 hover:text-white transition-colors text-sm">
                Workouts & Fitness
              </Link>
              <Link href="/nutrition" className="block text-white/60 hover:text-white transition-colors text-sm">
                Nutrition & Meals
              </Link>
              <Link href="/habits" className="block text-white/60 hover:text-white transition-colors text-sm">
                Daily Habits
              </Link>
              <Link href="/calendar" className="block text-white/60 hover:text-white transition-colors text-sm">
                Calendar & Planning
              </Link>
              <Link href="/stuffs" className="block text-white/60 hover:text-white transition-colors text-sm">
                Notes & Ideas
              </Link>
            </nav>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Features</h3>
            <div className="space-y-2">
              <div className="text-white/60 text-sm">📖 Daily Bible Reflections</div>
              <div className="text-white/60 text-sm">💡 Quick Idea Capture</div>
              <div className="text-white/60 text-sm">📅 Smart Time Blocking</div>
              <div className="text-white/60 text-sm">🍎 Nutrition Tracking</div>
              <div className="text-white/60 text-sm">💪 Workout Planning</div>
              <div className="text-white/60 text-sm">✅ Habit Building</div>
              <div className="text-white/60 text-sm">📱 WhatsApp Integration</div>
              <div className="text-white/60 text-sm">🤖 AI-Powered Insights</div>
            </div>
          </div>

          {/* Quick Stats & Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Today</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-white/60">
                  {format(new Date(), "EEEE, MMM dd")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-white/60">
                  Building better habits
                </span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400 mb-1">
                  {Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)}
                </div>
                <div className="text-xs text-white/60">Days this year</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span>for personal growth</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <span className="text-white/40">
              © {currentYear} Everyday Coach
            </span>
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-white/60 hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="pb-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 text-center">
            <p className="text-sm italic text-white/80">
              &ldquo;Every day is a new opportunity to become the person God created you to be.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};