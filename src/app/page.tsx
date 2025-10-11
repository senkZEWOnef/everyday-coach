"use client";
import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import("@/components/DashboardContent").then(mod => ({ default: mod.DashboardContent })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/10 rounded-xl h-64 m-8"></div>
});

export default function HomePage() {
  return <DashboardContent />;
}