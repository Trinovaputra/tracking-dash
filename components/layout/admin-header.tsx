"use client";

import { LogoutButton } from "@/components/LogoutButton";
import { MobileMenuButton } from "./MobileMenuButton";
import { ThemeToggle } from "@/components/theme-toggle";

type AdminHeaderProps = {
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  };
};

export default function AdminHeader({ session }: AdminHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <MobileMenuButton />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 hidden md:block">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {session?.user?.name || session?.user?.email || "Admin"}
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">
            {session?.user?.role?.toLowerCase() || "Admin"}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
