import type { Channel, LeadTemperature, MessageStatus } from "@/types/enquiry";

export const ENQUIRY_SELECT = `
  id,
  channel,
  subject,
  temperature,
  property_address,
  property_price_guide,
  property_status,
  is_read,
  last_activity_at,
  call_brief,
  contact:contacts(name, email, phone),
  messages(id, sender, content, channel, status, created_at)
`;

export const TEMPERATURE_ORDER: Record<LeadTemperature, number> = {
  hot: 0,
  warm: 1,
  cold: 2,
};

export function isLeadTemperature(value: string | null): value is LeadTemperature {
  return value === "hot" || value === "warm" || value === "cold";
}

type ContactRow = {
  name: string;
  email: string | null;
  phone: string | null;
};

type MessageRow = {
  id: string;
  sender: "client" | "ai" | "agent";
  content: string;
  channel: Channel;
  status: MessageStatus | null;
  created_at: string;
};

export type EnquiryRow = {
  id: string;
  channel: Channel;
  subject: string | null;
  temperature: LeadTemperature;
  property_address: string | null;
  property_price_guide: string | null;
  property_status: "available" | "under_offer" | "sold" | null;
  is_read: boolean | null;
  last_activity_at: string | null;
  call_brief: unknown;
  contact: ContactRow[] | null;
  messages: MessageRow[] | null;
};

export function mapToEnquiry(row: EnquiryRow) {
  const contact = row.contact?.[0];
  const messages = [...(row.messages ?? [])].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return {
    id: row.id,
    clientName: contact?.name ?? "Unknown contact",
    clientEmail: contact?.email ?? undefined,
    clientPhone: contact?.phone ?? undefined,
    channel: row.channel,
    property: {
      address: row.property_address ?? "Address unavailable",
      priceGuide: row.property_price_guide ?? "Price guide unavailable",
      status: row.property_status ?? "available",
    },
    temperature: row.temperature,
    subject: row.subject ?? "No subject",
    messages: messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      content: message.content,
      timestamp: message.created_at,
      channel: message.channel,
      status: message.status ?? undefined,
    })),
    lastActivity: row.last_activity_at ?? new Date().toISOString(),
    isRead: row.is_read ?? false,
    callBrief: row.call_brief ?? undefined,
  };
}
