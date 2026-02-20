"use client";

import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Flame, Eye, MessageSquare, Calendar, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const typeConfig: Record<
  Notification["type"],
  { icon: React.ElementType; color: string }
> = {
  hot_lead: { icon: Flame, color: "text-[hsl(var(--hot))]" },
  inspection_request: { icon: Calendar, color: "text-[hsl(var(--warm))]" },
  stale_lead: { icon: Eye, color: "text-muted-foreground" },
  warm_reply: { icon: MessageSquare, color: "text-primary" },
};

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const router = useRouter();

  const handleClick = (n: Notification) => {
    if (!n.is_read) {
      markRead(n.id);
    }
    if (n.enquiry_id) {
      router.push(`/inbox?id=${n.enquiry_id}`);
      onClose();
    }
  };

  return (
    <div className="absolute left-full bottom-0 ml-2 w-80 max-h-[480px] bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <h3 className="text-[13px] font-semibold text-foreground">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-[11px] font-mono text-primary">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="text-[11px] text-muted-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[12px] text-muted-foreground/40">
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;

            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/10 transition-colors hover:bg-accent/30",
                  !n.is_read && "bg-primary/3"
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[12px] truncate",
                          !n.is_read
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground/70"
                        )}
                      >
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/30 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
