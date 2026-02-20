import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  profile_id: string;
  enquiry_id: string | null;
  type: "hot_lead" | "inspection_request" | "stale_lead" | "warm_reply";
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30s as backup to realtime
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to mark read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all_read: true }),
      });
      if (!res.ok) throw new Error("Failed to mark all read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount =
    query.data?.filter((n) => !n.is_read).length ?? 0;

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    unreadCount,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  };
}
