import { useQuery } from "@tanstack/react-query";
import type { Enquiry, LeadTemperature, SortMode } from "@/types/enquiry";

interface UseEnquiriesParams {
  temperature?: LeadTemperature;
  sort?: SortMode;
}

export function useEnquiries(params: UseEnquiriesParams = {}) {
  const { temperature, sort } = params;

  return useQuery<Enquiry[]>({
    // Optional filters for temperature and sort
    queryKey: ["enquiries", temperature ?? null, sort ?? null],
    // Fetch enquiries from the API with optional filters
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (temperature) searchParams.set("temperature", temperature);
      if (sort) searchParams.set("sort", sort);

      const queryString = searchParams.toString();
      const url = queryString ? `/api/enquiries?${queryString}` : "/api/enquiries";

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch enquiries");
      }

      const rawEnquiries = await res.json();

      // Map the raw enquiries to the Enquiry type
      return rawEnquiries.map((enquiry: any) => ({
        ...enquiry,
        lastActivity: new Date(enquiry.lastActivity), 
        messages: (enquiry.messages ?? []).map((message: any) => ({ 
          ...message,
          timestamp: new Date(message.timestamp),
        })),
      }));
    },
  });
}
