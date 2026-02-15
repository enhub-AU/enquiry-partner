"use client";

import { cn } from "@/lib/utils";
import { EnquiryStatus } from "@/types/enquiry";
import { channelConfig, statusConfig } from "@/lib/channelConfig";

interface ChannelBadgeProps {
  channel: "email";
  className?: string;
}

export function ChannelBadge({ channel, className }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-primary-foreground",
        config.colorClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: EnquiryStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          config.colorClass,
          status === "hot" && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
