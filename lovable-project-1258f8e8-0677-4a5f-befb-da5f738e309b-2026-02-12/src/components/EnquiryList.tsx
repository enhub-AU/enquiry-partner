"use client";

import { useState, useEffect, useMemo } from "react";
import { Enquiry } from "@/types/enquiry";
import { channelConfig } from "@/lib/channelConfig";
import { cn } from "@/lib/utils";
import type { SortMode } from "@/types/enquiry";
import { Flame, AlertCircle, Sparkles } from "lucide-react";

/* -- live elapsed timer -- */
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
  if (enquiry.status === "hot") {
    return { dot: "bg-[hsl(var(--hot))]", label: "Hot" };
  }
  if (enquiry.status === "needs_attention") {
    return { dot: "bg-[hsl(var(--warm))]", label: "Needs Attention" };
  }
  if (enquiry.status === "new") {
    return { dot: "bg-primary", label: "New" };
  }
  return { dot: "bg-muted-foreground/20", label: "Auto-handled" };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface GroupConfig {
  label: string;
  icon: React.ElementType;
  color: string;
}

const groupConfigs: Record<string, GroupConfig> = {
  hot: { label: "Hot Leads", icon: Flame, color: "text-[hsl(var(--hot))]" },
  needs_attention: { label: "Needs Attention", icon: AlertCircle, color: "text-[hsl(var(--warm))]" },
  auto_handled: { label: "Auto-handled", icon: Sparkles, color: "text-muted-foreground/50" },
};

function EnquiryRow({
  enquiry,
  isSelected,
  onSelect,
}: {
  enquiry: Enquiry;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const indicator = getStatusIndicator(enquiry);
  const ChannelIcon = channelConfig[enquiry.channel].icon;
  const lastMsg = enquiry.messages[enquiry.messages.length - 1];

  return (
    <button
      onClick={() => onSelect(enquiry.id)}
      className={cn(
        "w-full text-left px-5 py-3.5 transition-colors duration-100 border-b border-border/20",
        isSelected ? "bg-accent/60" : "hover:bg-accent/30"
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
              indicator.dot,
              enquiry.status === "hot" && "animate-pulse"
            )}
            title={indicator.label}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span
              className={cn(
                "text-[13px] truncate",
                !enquiry.isRead
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground/80"
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
              {indicator.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function GroupHeader({ config, count }: { config: GroupConfig; count: number }) {
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-2 px-5 py-2 bg-muted/20 border-b border-border/20">
      <Icon className={cn("h-3.5 w-3.5", config.color)} />
      <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground/60">
        {config.label}
      </span>
      <span className="text-[10px] font-mono text-muted-foreground/30 ml-auto">
        {count}
      </span>
    </div>
  );
}

export function EnquiryList({
  enquiries,
  selectedId,
  onSelect,
  sortMode,
  onSortChange,
}: EnquiryListProps) {
  // Group enquiries when in "hot" sort mode
  const groups = useMemo(() => {
    if (sortMode !== "hot") return null;

    const hot = enquiries.filter((e) => e.status === "hot");
    const needsAttention = enquiries.filter(
      (e) => e.status === "needs_attention" || e.status === "new"
    );
    const autoHandled = enquiries.filter((e) => e.status === "auto_handled");

    return [
      { key: "hot", config: groupConfigs.hot, items: hot },
      { key: "needs_attention", config: groupConfigs.needs_attention, items: needsAttention },
      { key: "auto_handled", config: groupConfigs.auto_handled, items: autoHandled },
    ].filter((g) => g.items.length > 0);
  }, [enquiries, sortMode]);

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
        {enquiries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[12px] text-muted-foreground/40">
              No conversations found
            </p>
          </div>
        ) : groups ? (
          // Grouped view
          groups.map((group) => (
            <div key={group.key}>
              <GroupHeader config={group.config} count={group.items.length} />
              {group.items.map((enquiry) => (
                <EnquiryRow
                  key={enquiry.id}
                  enquiry={enquiry}
                  isSelected={selectedId === enquiry.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))
        ) : (
          // Flat view
          enquiries.map((enquiry) => (
            <EnquiryRow
              key={enquiry.id}
              enquiry={enquiry}
              isSelected={selectedId === enquiry.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
