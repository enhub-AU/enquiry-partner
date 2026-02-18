import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/types/enquiry";

export function useMessages(enquiryId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", enquiryId],
    enabled: !!enquiryId,
    queryFn: async () => {
      const res = await fetch(
        `/api/messages?enquiry_id=${encodeURIComponent(enquiryId!)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const rawMessages = await res.json();

      return rawMessages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }));
    },
  });
}
