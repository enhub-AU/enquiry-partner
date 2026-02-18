export type LeadTemperature = "hot" | "warm" | "cold";

export type Channel =
  | "sms"
  | "whatsapp"
  | "email"
  | "web"
  | "instagram"
  | "facebook"
  | "rea"
  | "domain";

export type MessageStatus = "pending_approval" | "sent" | "edited" | "failed";

export interface Property {
  address: string;
  priceGuide: string;
  status: "available" | "under_offer" | "sold";
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
}

export interface Message {
  id: string;
  sender: "client" | "ai" | "agent";
  content: string;
  timestamp: Date;
  channel: Channel;
  status?: MessageStatus;
}

export interface HotSignal {
  signal: string;
  evidence: string;
}

export interface CallBrief {
  preferredContact: string;
  intent: "buyer" | "seller";
  budgetRange: string;
  timeframe: string;
  motivations: string;
  sensitivities: string;
  suggestedOpening: string;
  strategyAngle: string;
  whyHot: HotSignal[];
}

export interface Enquiry {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  channel: Channel;
  property: Property;
  temperature: LeadTemperature;
  subject: string;
  messages: Message[];
  lastActivity: Date;
  isRead: boolean;
  callBrief?: CallBrief;
}

export type SortMode = "hot" | "newest" | "open";
