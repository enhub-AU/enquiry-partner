import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/types/enquiry";

export function useMessages(enquiryId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", enquiryId],
    enabled: !!enquiryId,
    queryFn: async () => {
      const res = await fetch(`/api/messages?enquiry_id=${enquiryId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      return data.map((m: Record<string, unknown>) => ({
        ...m,
        timestamp: new Date(m.timestamp as string),
      }));
    },
  });
}
