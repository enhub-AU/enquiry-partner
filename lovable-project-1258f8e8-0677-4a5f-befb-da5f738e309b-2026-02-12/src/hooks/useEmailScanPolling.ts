import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * In dev mode, polls /api/scan-emails at the given interval.
 * Disabled in production (Vercel Cron handles it).
 */
export function useEmailScanPolling(
  enabled: boolean = true,
  intervalMs: number = 30000
) {
  const queryClient = useQueryClient();
  const scanning = useRef(false);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV === "production") return;

    const poll = async () => {
      if (scanning.current) return;
      scanning.current = true;
      try {
        const res = await fetch("/api/scan-emails");
        if (res.ok) {
          // Invalidate inbox queries so new emails show up
          queryClient.invalidateQueries({ queryKey: ["enquiries"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
        }
      } catch {
        // Silently ignore scan errors in polling
      } finally {
        scanning.current = false;
      }
    };

    // Initial scan after a short delay
    const timeout = setTimeout(poll, 5000);
    const interval = setInterval(poll, intervalMs);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [enabled, intervalMs, queryClient]);
}
