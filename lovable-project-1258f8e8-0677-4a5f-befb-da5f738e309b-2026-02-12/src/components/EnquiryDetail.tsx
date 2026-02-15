"use client";

import { Enquiry, Message } from "@/types/enquiry";
import { channelConfig } from "@/lib/channelConfig";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  Edit3,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  MapPin,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
    <span className="text-[12px] font-mono text-muted-foreground/50 flex items-center gap-1.5">
      <Clock className="h-3 w-3" />
      {elapsed}
    </span>
  );
}

interface EnquiryDetailProps {
  enquiry: Enquiry;
}

/* -- Status badge for right panel -- */
function EnquiryStatusBadge({ enquiry }: { enquiry: Enquiry }) {
  if (enquiry.status === "hot") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[hsl(var(--hot)/0.1)] text-[hsl(var(--hot))]">
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--hot))] animate-pulse" />
        Ready to call
      </span>
    );
  }
  if (enquiry.status === "needs_attention") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[hsl(var(--warm)/0.1)] text-[hsl(var(--warm))]">
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--warm))]" />
        Needs Attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
      {enquiry.status === "new" ? "New" : "Auto-handled"}
    </span>
  );
}

/* -- Message bubble -- */
function MessageBubble({ message }: { message: Message }) {
  const isClient = message.sender === "client";
  const isAI = message.sender === "ai";
  const isPending = message.status === "pending_approval";

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[75%]",
        isClient ? "items-start" : "items-end ml-auto"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
          isClient
            ? "bg-muted/60 text-foreground rounded-bl-sm"
            : isPending
            ? "bg-primary/8 text-foreground border border-primary/20 border-dashed rounded-br-sm"
            : "bg-foreground text-background rounded-br-sm"
        )}
      >
        {message.content}
      </div>
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] text-muted-foreground/40">
          {format(message.timestamp, "h:mm a")}
        </span>
        {isAI && message.status === "sent" && (
          <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Sent by EnHub
          </span>
        )}
        {isPending && (
          <span className="text-[10px] font-medium text-primary/70 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            Draft
          </span>
        )}
        {message.sender === "agent" && message.status === "sent" && (
          <span className="text-[10px] text-muted-foreground/30 flex items-center gap-0.5">
            <Check className="h-2.5 w-2.5" />
          </span>
        )}
      </div>
    </div>
  );
}

export function EnquiryDetail({ enquiry }: EnquiryDetailProps) {
  const [replyText, setReplyText] = useState("");
  const hasPendingDraft = enquiry.messages.some(
    (m) => m.status === "pending_approval"
  );
  const ChannelIcon = channelConfig[enquiry.channel].icon;

  return (
    <div className="flex h-full">
      {/* -- CENTER: Conversation thread -- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thread header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                {enquiry.clientName}
              </h2>
              <p className="text-[12px] text-muted-foreground/50 mt-0.5">
                {enquiry.subject}
              </p>
            </div>
            {enquiry.status === "hot" && enquiry.clientPhone && (
              <a
                href={`tel:${enquiry.clientPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-[13px] font-bold font-mono tracking-tight text-foreground transition-opacity duration-150 hover:opacity-70"
              >
                <Phone className="h-3.5 w-3.5" />
                {enquiry.clientPhone}
              </a>
            )}
          </div>
        </div>

        {/* Hot lead banner */}
        {enquiry.status === "hot" && (
          <div className="flex-shrink-0 px-6 py-2.5 bg-[hsl(var(--hot)/0.06)] border-b border-[hsl(var(--hot)/0.1)] flex items-center gap-3">
            <Flame className="h-3.5 w-3.5 text-[hsl(var(--hot))] flex-shrink-0" />
            <span className="text-[12px] text-[hsl(var(--hot)/0.9)] font-semibold">
              Hot lead — call recommended
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {enquiry.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>

        {/* Action bar for pending drafts */}
        {hasPendingDraft && (
          <div className="flex-shrink-0 px-6 py-3 border-t border-border/20 bg-primary/3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary/50" />
            <span className="text-[12px] text-muted-foreground/60 flex-1">
              AI draft ready for review
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-[12px]">
              <Check className="h-3 w-3" />
              Approve & Send
            </Button>
          </div>
        )}

        {/* Composer */}
        {!hasPendingDraft && (
          <div className="flex-shrink-0 px-6 py-3 border-t border-border/20">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-border transition-all duration-150"
                />
              </div>
              <button className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center transition-opacity duration-150 hover:opacity-85 active:scale-[0.96] flex-shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -- RIGHT: Context panel -- */}
      <div className="hidden lg:flex flex-col w-[280px] border-l border-border/30 overflow-y-auto bg-card/20">
        <div className="p-5 space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-between pb-3 border-b border-border/15">
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/35">
              Enquiry age
            </span>
            <LiveTimer since={enquiry.lastActivity} />
          </div>

          {/* Contact card */}
          <div className="flex items-center gap-3 pb-4 border-b border-border/15">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground flex-shrink-0">
              {enquiry.clientName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-foreground truncate">
                {enquiry.clientName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <EnquiryStatusBadge enquiry={enquiry} />
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/35">
                  <ChannelIcon className="h-2.5 w-2.5" />
                  {channelConfig[enquiry.channel].label}
                </span>
              </div>
            </div>
          </div>

          {/* Contact links */}
          <div className="flex gap-2 pb-4 border-b border-border/15">
            {enquiry.clientPhone && (
              <a
                href={`tel:${enquiry.clientPhone.replace(/\s/g, "")}`}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[11px] font-bold text-foreground hover:opacity-70 transition-opacity"
              >
                <Phone className="h-3 w-3" />
                {enquiry.clientPhone}
              </a>
            )}
            {enquiry.clientEmail && (
              <a
                href={`mailto:${enquiry.clientEmail}`}
                className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                <Mail className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Property */}
          {enquiry.propertyAddress && (
            <div className="pb-4 border-b border-border/15">
              <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/35 mb-2">
                Property
              </p>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-foreground leading-snug">
                    {enquiry.propertyAddress}
                  </p>
                  {enquiry.propertyPriceGuide && (
                    <p className="text-[12px] text-primary font-semibold mt-0.5">
                      {enquiry.propertyPriceGuide}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
