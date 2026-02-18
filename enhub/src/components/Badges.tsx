"use client";

import { cn } from "@/lib/utils";
import { Channel, LeadTemperature } from "@/types/enquiry";
import { channelConfig, temperatureConfig } from "@/lib/channelConfig";

interface ChannelBadgeProps {
  channel: Channel;
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

interface TemperatureBadgeProps {
  temperature: LeadTemperature;
  className?: string;
}

export function TemperatureBadge({ temperature, className }: TemperatureBadgeProps) {
  const config = temperatureConfig[temperature];
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
          temperature === "hot" && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
