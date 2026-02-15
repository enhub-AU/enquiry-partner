import { EnquiryStatus } from "@/types/enquiry";
import { Mail } from "lucide-react";

export const channelConfig = {
  email: { label: "Email", icon: Mail, colorClass: "bg-channel-email" },
};

export const statusConfig: Record<
  EnquiryStatus,
  { label: string; colorClass: string; bgClass: string; textClass: string }
> = {
  hot: {
    label: "Hot",
    colorClass: "bg-hot",
    bgClass: "bg-hot/10",
    textClass: "text-hot",
  },
  needs_attention: {
    label: "Needs Attention",
    colorClass: "bg-warm",
    bgClass: "bg-warm/10",
    textClass: "text-warm",
  },
  auto_handled: {
    label: "Auto-handled",
    colorClass: "bg-cold",
    bgClass: "bg-cold/10",
    textClass: "text-cold",
  },
  new: {
    label: "New",
    colorClass: "bg-primary",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
};
