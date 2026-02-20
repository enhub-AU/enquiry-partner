"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { EnquiryList } from "@/components/EnquiryList";
import { EnquiryDetail } from "@/components/EnquiryDetail";
import { useEnquiries } from "@/hooks/useEnquiries";
import { useRealtimeInbox } from "@/hooks/useRealtimeInbox";
import { Inbox, Search, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { SortMode } from "@/types/enquiry";

export default function InboxPage() {
  return (
    <Suspense>
      <InboxContent />
    </Suspense>
  );
}

function InboxContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || null;
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("hot");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useRealtimeInbox();

  // Debounce search for server-side filtering
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Simple debounce: update after a tick
    const timeout = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timeout);
  }, []);

  const { data: enquiries, isLoading } = useEnquiries(debouncedSearch || undefined);

  const sorted = useMemo(() => {
    const list = [...(enquiries ?? [])];
    switch (sortMode) {
      case "hot": {
        const order = { hot: 0, needs_attention: 1, new: 2, auto_handled: 3 };
        return list.sort((a, b) => {
          const aOrder = order[a.status] ?? 3;
          const bOrder = order[b.status] ?? 3;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        });
      }
      case "newest":
        return list.sort(
          (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
        );
      case "open":
        return list.sort((a, b) => {
          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        });
      default:
        return list;
    }
  }, [enquiries, sortMode]);

  // Auto-select first if none selected and we have data
  const effectiveSelectedId = selectedId || sorted[0]?.id || null;
  const selected = sorted.find((e) => e.id === effectiveSelectedId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Global search bar */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, phone, or address"
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-border/50 bg-background/80 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40 focus:border-border transition-all duration-150"
            />
          </div>
        </div>

        {/* Three-column content */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT — Conversation list */}
          <div className="w-[320px] min-w-[280px] border-r border-border/40 flex-shrink-0 overflow-hidden bg-card/30">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <EnquiryList
                enquiries={sorted}
                selectedId={effectiveSelectedId}
                onSelect={setSelectedId}
                sortMode={sortMode}
                onSortChange={setSortMode}
              />
            )}
          </div>

          {/* CENTER + RIGHT — Detail */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selected ? (
              <EnquiryDetail enquiry={selected} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Inbox className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground/50">
                    {enquiries?.length === 0
                      ? "No enquiries yet"
                      : "Select a conversation"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
