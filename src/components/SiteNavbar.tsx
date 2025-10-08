"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export const SiteNavbar = () => {
  const pathname = usePathname();
  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={clsx(
        "px-3 py-2 rounded-xl text-sm hover:bg-white/10",
        pathname === href && "bg-white/10"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="container-px max-w-7xl mx-auto flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          Everyday Coach
        </Link>
        <div className="flex items-center gap-1">
          {link("/", "Dashboard")}
          {link("/workouts", "Workouts")}
          {link("/nutrition", "Nutrition")}
          {link("/habits", "Habits")}
          {link("/calendar", "Calendar")}
        </div>
      </div>
    </nav>
  );
};
