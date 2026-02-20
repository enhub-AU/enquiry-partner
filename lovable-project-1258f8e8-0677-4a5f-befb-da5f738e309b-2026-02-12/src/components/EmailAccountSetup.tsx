"use client";

import { useState } from "react";
import {
  useEmailAccounts,
  type AddEmailAccountInput,
} from "@/hooks/useEmailAccounts";
import {
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wifi,
  X,
} from "lucide-react";

const PROVIDER_PRESETS: Record<
  string,
  { imap_host: string; imap_port: number; smtp_host: string; smtp_port: number; helper: string }
> = {
  gmail: {
    imap_host: "imap.gmail.com",
    imap_port: 993,
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    helper: "",
  },
  other: {
    imap_host: "",
    imap_port: 993,
    smtp_host: "",
    smtp_port: 587,
    helper: "",
  },
};

const inputClass =
  "h-10 w-full rounded-xl border border-border/40 bg-background/60 px-4 text-[13px] text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-border transition-all duration-150";

const selectClass =
  "h-10 w-full rounded-xl border border-border/40 bg-background/60 px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 transition-all duration-150";

export function EmailAccountSetup() {
  const {
    accounts,
    isLoading,
    addAccount,
    isAdding,
    addError,
    deleteAccount,
    isDeleting,
    testConnection,
    isTesting,
  } = useEmailAccounts();

  const [showForm, setShowForm] = useState(false);
  const [provider, setProvider] = useState("gmail");
  const [form, setForm] = useState({
    imap_user: "",
    imap_password: "",
    imap_host: PROVIDER_PRESETS.gmail.imap_host,
    imap_port: PROVIDER_PRESETS.gmail.imap_port,
    smtp_host: PROVIDER_PRESETS.gmail.smtp_host,
    smtp_port: PROVIDER_PRESETS.gmail.smtp_port,
  });
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  const preset = PROVIDER_PRESETS[provider];

  function handleProviderChange(newProvider: string) {
    setProvider(newProvider);
    const p = PROVIDER_PRESETS[newProvider];
    setForm((f) => ({
      ...f,
      imap_host: p.imap_host,
      imap_port: p.imap_port,
      smtp_host: p.smtp_host,
      smtp_port: p.smtp_port,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: AddEmailAccountInput = {
      provider,
      imap_host: form.imap_host,
      imap_port: form.imap_port,
      imap_user: form.imap_user,
      imap_password: form.imap_password,
      smtp_host: form.smtp_host,
      smtp_port: form.smtp_port,
      smtp_user: form.imap_user,
      smtp_password: form.imap_password,
    };

    try {
      await addAccount(input);
      setShowForm(false);
      setForm({
        imap_user: "",
        imap_password: "",
        imap_host: PROVIDER_PRESETS.gmail.imap_host,
        imap_port: PROVIDER_PRESETS.gmail.imap_port,
        smtp_host: PROVIDER_PRESETS.gmail.smtp_host,
        smtp_port: PROVIDER_PRESETS.gmail.smtp_port,
      });
      setProvider("gmail");
    } catch {
      // error is available via addError
    }
  }

  async function handleTest(accountId: string) {
    setTestResult(null);
    try {
      const result = await testConnection(accountId);
      setTestResult({ id: accountId, ...result });
    } catch {
      setTestResult({
        id: accountId,
        success: false,
        message: "Test failed",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connected accounts */}
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/40"
        >
          <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0">
            <Mail className="h-4 w-4 text-foreground/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-medium text-foreground truncate">
                {account.imap_user}
              </span>
              {account.last_scan_error ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--warm))] font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--channel-sms))] font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/50">
              {account.provider}{account.auth_method === "oauth" ? " (OAuth)" : ""} &middot;{" "}
              {account.last_scan_at
                ? `Last scan: ${new Date(account.last_scan_at).toLocaleTimeString()}`
                : "Not scanned yet"}
              {account.last_scan_error && (
                <span className="text-[hsl(var(--warm))]">
                  {" "}
                  &middot; {account.last_scan_error}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleTest(account.id)}
              disabled={isTesting}
              className="text-[11px] text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors disabled:opacity-40"
            >
              {isTesting && testResult === null ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wifi className="h-3 w-3" />
              )}
              Test
            </button>
            <button
              onClick={() => deleteAccount(account.id)}
              disabled={isDeleting}
              className="text-[11px] text-muted-foreground/40 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {testResult?.id === account.id && (
            <span
              className={`text-[10px] font-medium ${
                testResult.success
                  ? "text-[hsl(var(--channel-sms))]"
                  : "text-[hsl(var(--warm))]"
              }`}
            >
              {testResult.message}
            </span>
          )}
        </div>
      ))}

      {/* Add account button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full p-4 rounded-xl border border-dashed border-border/40 hover:border-foreground/20 hover:bg-muted/15 transition-all text-[13px] text-muted-foreground/60 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Connect email account
        </button>
      ) : (
        <div className="p-5 rounded-xl border border-border/30 bg-card/40 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-medium text-foreground">
              Connect Email
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Provider */}
          <div>
            <label className="text-[11px] text-muted-foreground/60 mb-1.5 block">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className={selectClass}
            >
              <option value="gmail">Gmail</option>
              <option value="other">Custom IMAP</option>
            </select>
          </div>

          {/* Gmail: Sign in with Google */}
          {provider === "gmail" ? (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                Connect your Gmail account securely with Google sign-in. No app password needed.
              </p>
              <a
                href="/api/auth/google-email"
                className="w-full h-10 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </a>
            </div>
          ) : (
            /* Custom IMAP: Manual form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-muted-foreground/60 mb-1.5 block">
                    IMAP Host
                  </label>
                  <input
                    type="text"
                    value={form.imap_host}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imap_host: e.target.value }))
                    }
                    placeholder="imap.example.com"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground/60 mb-1.5 block">
                    Port
                  </label>
                  <input
                    type="number"
                    value={form.imap_port}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        imap_port: parseInt(e.target.value) || 993,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground/60 mb-1.5 block">
                  Email address
                </label>
                <input
                  type="email"
                  value={form.imap_user}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imap_user: e.target.value }))
                  }
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground/60 mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  value={form.imap_password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imap_password: e.target.value }))
                  }
                  placeholder="Password"
                  className={inputClass}
                  required
                />
              </div>

              {addError && (
                <p className="text-[11px] text-red-500 font-medium">
                  {addError.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isAdding}
                className="w-full h-10 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing & connecting...
                  </>
                ) : (
                  "Connect Account"
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
