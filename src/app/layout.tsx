import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/Footer";

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
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <SiteNavbar />
          <main className="flex-1 container-px py-6 max-w-7xl mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
