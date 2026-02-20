import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AgentSettings {
  id: string;
  profile_id: string;
  ai_mode: "draft" | "safe" | "full";
  notify_hot_lead: boolean;
  notify_stale_lead: boolean;
  notify_warm_reply: boolean;
  notify_inspection_request: boolean;
  stale_lead_minutes: number;
  delivery_push: boolean;
  delivery_email: boolean;
  delivery_sms: boolean;
  price_template: string | null;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery<AgentSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<AgentSettings>) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
