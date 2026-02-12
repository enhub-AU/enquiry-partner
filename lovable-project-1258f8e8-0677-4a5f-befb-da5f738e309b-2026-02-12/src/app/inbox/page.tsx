"use client";

import { Suspense, useState, useMemo } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { EnquiryList } from "@/components/EnquiryList";
import { EnquiryDetail } from "@/components/EnquiryDetail";
import { mockEnquiries } from "@/data/mockEnquiries";
import { Inbox, Search } from "lucide-react";
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
  const initialId = searchParams.get("id") || mockEnquiries[0]?.id || null;
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("hot");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mockEnquiries;
    const q = searchQuery.toLowerCase();
    return mockEnquiries.filter(
      (e) =>
        e.clientName.toLowerCase().includes(q) ||
        e.clientEmail?.toLowerCase().includes(q) ||
        e.clientPhone?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortMode) {
      case "hot": {
        const order = { hot: 0, warm: 1, cold: 2 };
        return list.sort((a, b) => {
          if (order[a.temperature] !== order[b.temperature])
            return order[a.temperature] - order[b.temperature];
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        });
      }
      case "newest":
        return list.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      case "open":
        return list.sort((a, b) => {
          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        });
      default:
        return list;
    }
  }, [filtered, sortMode]);

  const selected = mockEnquiries.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ── Global search bar ── */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone number"
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-border/50 bg-background/80 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40 focus:border-border transition-all duration-150"
            />
          </div>
        </div>

        {/* ── Three-column content ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT — Conversation list */}
          <div className="w-[320px] min-w-[280px] border-r border-border/40 flex-shrink-0 overflow-hidden bg-card/30">
            <EnquiryList
              enquiries={sorted}
              selectedId={selectedId}
              onSelect={setSelectedId}
              sortMode={sortMode}
              onSortChange={setSortMode}
            />
          </div>

          {/* CENTER + RIGHT — Detail */}
          <div className="flex-1 overflow-hidden">
            {selected ? (
              <EnquiryDetail enquiry={selected} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Inbox className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground/50">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
