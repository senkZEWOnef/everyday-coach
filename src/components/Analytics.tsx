"use client";
import { useEffect } from "react";

export function Analytics() {
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== "undefined" && "performance" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            console.log("Navigation timing:", entry);
          } else if (entry.entryType === "largest-contentful-paint") {
            console.log("LCP:", entry.startTime);
          } else if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEventTiming;
            console.log("FID:", fidEntry.processingStart - fidEntry.startTime);
          } else if (entry.entryType === "layout-shift") {
            const clsEntry = entry as { hadRecentInput?: boolean; value?: number };
            if (!clsEntry.hadRecentInput) {
              console.log("CLS:", clsEntry.value);
            }
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["navigation", "largest-contentful-paint", "first-input", "layout-shift"] });
      } catch {
        // Fallback for browsers that don't support all entry types
        try {
          observer.observe({ entryTypes: ["navigation"] });
        } catch {
          console.log("Performance Observer not supported");
        }
      }

      return () => observer.disconnect();
    }
  }, []);

  // Only load Google Analytics in production
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }
      gtag("js", new Date());
      gtag("config", process.env.NEXT_PUBLIC_GA_ID);
    }
  }, []);

  return null;
}

// Extend window type for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
  }
}