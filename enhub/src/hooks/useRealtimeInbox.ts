import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Supabase Realtime subscription for inbox updates.
 * Subscribes to:
 * - `messages` table inserts (new messages for user's enquiries)
 * - `enquiries` table updates (temperature changes, new activity)
 *
 * TODO: Uncomment the subscription logic once Supabase is connected.
 */
export function useRealtimeInbox() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // TODO: Uncomment when Supabase is connected:
    //
    // const supabase = createClient();
    //
    // const channel = supabase
    //   .channel("inbox-realtime")
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "INSERT",
    //       schema: "public",
    //       table: "messages",
    //     },
    //     (payload) => {
    //       // Invalidate messages query to refetch
    //       queryClient.invalidateQueries({ queryKey: ["messages"] });
    //       // Also invalidate enquiries to update last activity
    //       queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    //     }
    //   )
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "UPDATE",
    //       schema: "public",
    //       table: "enquiries",
    //     },
    //     (payload) => {
    //       queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    //     }
    //   )
    //   .subscribe();
    //
    // return () => {
    //   supabase.removeChannel(channel);
    // };

    return undefined;
  }, [queryClient]);
}
