"use client";

import { useState } from "react";
import {
  Inbox,
  Home,
  Settings,
  Zap,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "@/components/NotificationPanel";

interface AppSidebarProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Inbox, label: "Enquiries", path: "/inbox" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

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

      {/* Notification bell + Avatar */}
      <div className="flex flex-col items-center gap-2 py-4 border-t border-sidebar-border">
        <div className="relative">
          <button
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
              showNotifications
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
          AG
        </div>
      </div>
    </aside>
  );
}
