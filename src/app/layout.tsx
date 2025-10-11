import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Everyday Coach",
  description:
    "Your daily coach for workouts, nutrition, habits, and calendar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <SiteNavbar />
            <main className="flex-1 container-px py-6 max-w-7xl mx-auto">
              {children}
            </main>
            <Footer />
          </div>
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}
