"use client";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@/components/Analytics";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-16 md:ml-64">
          <main className="flex-1 container-px py-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <Analytics />
    </ErrorBoundary>
  );
}