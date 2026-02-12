import { useQuery } from "@tanstack/react-query";
import { mockEnquiries } from "@/data/mockEnquiries";
import type { Message } from "@/types/enquiry";

export function useMessages(enquiryId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", enquiryId],
    enabled: !!enquiryId,
    queryFn: async () => {
      // For now: return mock messages from the given enquiry
      const enquiry = mockEnquiries.find((e) => e.id === enquiryId);
      return enquiry?.messages ?? [];

      // TODO: Swap to API fetch when ready:
      // const res = await fetch(`/api/messages?enquiry_id=${enquiryId}`);
      // if (!res.ok) throw new Error("Failed to fetch messages");
      // return res.json();
    },
  });
}
