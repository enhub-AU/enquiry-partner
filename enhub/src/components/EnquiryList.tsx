"use client";

import { useState, useEffect } from "react";
import { Enquiry } from "@/types/enquiry";
import { channelConfig } from "@/lib/channelConfig";
import { cn } from "@/lib/utils";
import type { SortMode } from "@/types/enquiry";

/* ── live elapsed timer ── */
function useElapsed(since: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, now - since.getTime());
  const secs = Math.floor(diff / 1000) % 60;
  const mins = Math.floor(diff / 60000) % 60;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, "0")}m`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function LiveTimer({ since }: { since: Date }) {
  const elapsed = useElapsed(since);
  return (
    <span className="flex-shrink-0 text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1">
      <span className="inline-block h-1 w-1 rounded-full bg-primary/50 animate-pulse" />
      {elapsed}
    </span>
  );
}

interface EnquiryListProps {
  enquiries: Enquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

const sortLabels: Record<SortMode, string> = {
  hot: "Hot first",
  newest: "Newest",
  open: "Open",
};

function getStatusIndicator(enquiry: Enquiry) {
  if (enquiry.temperature === "hot") {
    return { dot: "bg-[hsl(var(--hot))]", label: "Hot" };
  }
  if (enquiry.temperature === "warm") {
    return { dot: "bg-[hsl(var(--warm))]", label: "AI working" };
  }
  return { dot: "bg-muted-foreground/20", label: "Handled" };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EnquiryList({
  enquiries,
  selectedId,
  onSelect,
  sortMode,
  onSortChange,
}: EnquiryListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
              Conversations
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded-md">
              {enquiries.length}
            </span>
          </div>
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="text-[11px] text-muted-foreground/60 bg-transparent border-none focus:outline-none cursor-pointer pr-0"
          >
            {(Object.keys(sortLabels) as SortMode[]).map((m) => (
              <option key={m} value={m}>
                {sortLabels[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {enquiries.length === 0 && (
          <div className="px-5 py-8 text-center text-[12px] text-muted-foreground/45">
            No conversations found.
          </div>
        )}
        {enquiries.map((enquiry) => {
          const isSelected = selectedId === enquiry.id;
          const status = getStatusIndicator(enquiry);
          const ChannelIcon = channelConfig[enquiry.channel].icon;
          const lastMsg = enquiry.messages[enquiry.messages.length - 1];
          

          return (
            <button
              key={enquiry.id}
              onClick={() => onSelect(enquiry.id)}
              className={cn(
                "w-full text-left px-5 py-3.5 transition-colors duration-100 border-b border-border/20",
                isSelected
                  ? "bg-accent/60"
                  : "hover:bg-accent/30"
              )}
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-[11px] font-semibold",
                      isSelected
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getInitials(enquiry.clientName)}
                  </div>
                  {/* Status dot */}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      status.dot,
                      enquiry.temperature === "hot" && "animate-pulse"
                    )}
                    title={status.label}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={cn(
                        "text-[13px] truncate",
                        !enquiry.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                      )}
                    >
                      {enquiry.clientName}
                    </span>
                    <LiveTimer since={enquiry.lastActivity} />
                  </div>

                  <p className="text-[12px] text-muted-foreground/60 truncate leading-relaxed">
                    {lastMsg?.content || enquiry.subject}
                  </p>

                  {/* Bottom row: channel + status */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <ChannelIcon className="h-3 w-3 text-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground/35">
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
