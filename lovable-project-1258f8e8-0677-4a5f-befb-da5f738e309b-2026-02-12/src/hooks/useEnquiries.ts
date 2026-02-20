import { useQuery } from "@tanstack/react-query";
import type { Enquiry } from "@/types/enquiry";

export function useEnquiries(search?: string) {
  return useQuery<Enquiry[]>({
    queryKey: ["enquiries", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const url = `/api/enquiries${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch enquiries");
      const data = await res.json();
      // Parse date strings into Date objects
      return data.map((e: Record<string, unknown>) => ({
        ...e,
        lastActivity: new Date(e.lastActivity as string),
        messages: ((e.messages as Record<string, unknown>[]) ?? []).map(
          (m: Record<string, unknown>) => ({
            ...m,
            timestamp: new Date(m.timestamp as string),
          })
        ),
      }));
    },
  });
}
