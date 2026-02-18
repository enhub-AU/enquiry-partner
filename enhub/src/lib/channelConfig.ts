import { Channel, LeadTemperature } from "@/types/enquiry";
import {
  MessageSquare,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Home,
  Phone,
} from "lucide-react";

export const channelConfig: Record<
  Channel,
  { label: string; icon: typeof Mail; colorClass: string }
> = {
  sms: { label: "SMS", icon: Phone, colorClass: "bg-channel-sms" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, colorClass: "bg-channel-whatsapp" },
  email: { label: "Email", icon: Mail, colorClass: "bg-channel-email" },
  web: { label: "Web Form", icon: Globe, colorClass: "bg-channel-web" },
  instagram: { label: "Instagram", icon: Instagram, colorClass: "bg-channel-instagram" },
  facebook: { label: "Facebook", icon: Facebook, colorClass: "bg-channel-facebook" },
  rea: { label: "REA", icon: Home, colorClass: "bg-channel-rea" },
  domain: { label: "Domain", icon: Home, colorClass: "bg-channel-domain" },
};

export const temperatureConfig: Record<
  LeadTemperature,
  { label: string; colorClass: string; bgClass: string; textClass: string }
> = {
  hot: {
    label: "Hot",
    colorClass: "bg-hot",
    bgClass: "bg-hot/10",
    textClass: "text-hot",
  },
  warm: {
    label: "Warm",
    colorClass: "bg-warm",
    bgClass: "bg-warm/10",
    textClass: "text-warm",
  },
  cold: {
    label: "Cold",
    colorClass: "bg-cold",
    bgClass: "bg-cold/10",
    textClass: "text-cold",
  },
};
