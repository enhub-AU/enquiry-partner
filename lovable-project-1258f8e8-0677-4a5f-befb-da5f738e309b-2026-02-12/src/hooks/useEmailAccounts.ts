import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface EmailAccount {
  id: string;
  label: string;
  provider: string;
  auth_method: "password" | "oauth";
  imap_host: string;
  imap_port: number;
  imap_user: string;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  oauth_email: string | null;
  last_scan_at: string | null;
  last_scan_error: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AddEmailAccountInput {
  label?: string;
  provider?: string;
  imap_host: string;
  imap_port?: number;
  imap_user: string;
  imap_password: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
}

export function useEmailAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery<EmailAccount[]>({
    queryKey: ["emailAccounts"],
    queryFn: async () => {
      const res = await fetch("/api/email-accounts");
      if (!res.ok) throw new Error("Failed to fetch email accounts");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (input: AddEmailAccountInput) => {
      const res = await fetch("/api/email-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailAccounts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/email-accounts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailAccounts"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/email-accounts/${id}/test`, {
        method: "POST",
      });
      return res.json();
    },
  });

  return {
    accounts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addAccount: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addError: addMutation.error,
    deleteAccount: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    testConnection: testMutation.mutateAsync,
    isTesting: testMutation.isPending,
  };
}
