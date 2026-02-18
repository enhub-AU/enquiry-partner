"use client";

import {
  Inbox,
  Home,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AppSidebarProps {
  className?: string;
  activeItem?: string;
}

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Inbox, label: "Enquiries", path: "/inbox" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-16 bg-sidebar border-r border-sidebar-border",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
        <Link href="/" className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-3">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <Link
              key={label}
              title={label}
              href={path}
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      {/* Avatar */}
      <div className="flex items-center justify-center py-4 border-t border-sidebar-border">
        <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
          JR
        </div>
      </div>
    </aside>
  );
}
