export type EnquiryStatus = "new" | "hot" | "needs_attention" | "auto_handled";

export type EnquiryCategory =
  | "price_only"
  | "inspection"
  | "multi_question"
  | "other";

export type MessageStatus = "pending_approval" | "sent" | "failed";

export interface Message {
  id: string;
  sender: "client" | "ai" | "agent";
  content: string;
  timestamp: Date;
  channel: "email";
  status?: MessageStatus;
}

export interface Enquiry {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  channel: "email";
  subject: string;
  status: EnquiryStatus;
  category?: EnquiryCategory;
  propertyAddress?: string;
  propertyPriceGuide?: string;
  messages: Message[];
  lastActivity: Date;
  isRead: boolean;
}

export type SortMode = "hot" | "newest" | "open";
