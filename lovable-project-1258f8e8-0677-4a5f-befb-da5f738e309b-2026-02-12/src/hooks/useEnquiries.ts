import { useQuery } from "@tanstack/react-query";
import { mockEnquiries } from "@/data/mockEnquiries";
import type { Enquiry } from "@/types/enquiry";

export function useEnquiries() {
  return useQuery<Enquiry[]>({
    queryKey: ["enquiries"],
    queryFn: async () => {
      // For now: return mock data directly
      return mockEnquiries;

      // TODO: Swap to API fetch when ready:
      // const res = await fetch("/api/enquiries");
      // if (!res.ok) throw new Error("Failed to fetch enquiries");
      // return res.json();
    },
  });
}
