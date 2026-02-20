"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useSettings } from "@/hooks/useSettings";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Camera,
  Plug,
  Bell,
  Sparkles,
  Flame,
  ArrowRight,
  Shield,
  LogOut,
  Lock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { EmailAccountSetup } from "@/components/EmailAccountSetup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

/* -- Toggle component -- */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-foreground" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-background transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* -- Section wrapper -- */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      className="pb-10 mb-10 border-b border-border/20 last:border-b-0 last:mb-0 last:pb-0"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
          <Icon className="h-4 w-4 text-foreground/50" />
        </div>
        <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

/* -- Field row -- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4 last:mb-0">
      <label className="text-[13px] text-muted-foreground/70 sm:w-40 flex-shrink-0">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  agency_name: string | null;
  avatar_url: string | null;
  org_id: string | null;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { settings, isLoading: settingsLoading, updateSettings, isSaving } = useSettings();

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
    },
  });

  const inputClass =
    "h-10 w-full rounded-xl border border-border/40 bg-background/60 px-4 text-[13px] text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-border transition-all duration-150";

  if (settingsLoading || profileLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "??";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <motion.div
          className="max-w-[580px] mx-auto px-6 pt-16 pb-24"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={fadeUp} className="mb-12">
            <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em] text-foreground mb-2">
              Settings
            </h1>
            <p className="text-[13px] text-muted-foreground/50">
              Set once. Forget forever.
            </p>
          </motion.div>

          <Section icon={User} title="Profile">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                  {initials}
                </div>
                <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-85 transition-opacity">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">{profile?.full_name || "—"}</p>
                <p className="text-[11px] text-muted-foreground/40">Agent</p>
              </div>
            </div>
            <Field label="Name">
              <input
                type="text"
                defaultValue={profile?.full_name || ""}
                onBlur={(e) => {
                  if (e.target.value !== profile?.full_name) {
                    profileMutation.mutate({ full_name: e.target.value });
                  }
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input type="email" value={profile?.email || ""} disabled className={`${inputClass} opacity-60`} />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                defaultValue={profile?.phone || ""}
                onBlur={(e) => {
                  if (e.target.value !== (profile?.phone || "")) {
                    profileMutation.mutate({ phone: e.target.value });
                  }
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Role">
              <span className="text-[13px] text-muted-foreground/60">Agent</span>
            </Field>
          </Section>

          <Section icon={Plug} title="Inbox Connections">
            <EmailAccountSetup />
          </Section>

          <Section icon={Bell} title="Notifications">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground/80">Notify me when a lead turns hot</span>
                <Toggle
                  checked={settings?.notify_hot_lead ?? true}
                  onChange={(v) => updateSettings({ notify_hot_lead: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] text-foreground/80">Notify if a hot lead hasn&apos;t been called within</span>
                <div className="flex items-center gap-2">
                  <select
                    value={String(settings?.stale_lead_minutes ?? 15)}
                    onChange={(e) => updateSettings({ stale_lead_minutes: parseInt(e.target.value) })}
                    className="h-8 px-2 rounded-lg border border-border/40 bg-background text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30"
                  >
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                  </select>
                  <Toggle
                    checked={settings?.notify_stale_lead ?? true}
                    onChange={(v) => updateSettings({ notify_stale_lead: v })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground/80">Notify me when a warm lead replies</span>
                <Toggle
                  checked={settings?.notify_warm_reply ?? true}
                  onChange={(v) => updateSettings({ notify_warm_reply: v })}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-border/15">
              <p className="text-[11px] text-muted-foreground/40 mb-3 tracking-wide uppercase font-medium">Delivery</p>
              <div className="flex gap-6">
                {[
                  { label: "Push", field: "delivery_push" as const, value: settings?.delivery_push ?? true },
                  { label: "Email", field: "delivery_email" as const, value: settings?.delivery_email ?? true },
                  { label: "SMS", field: "delivery_sms" as const, value: settings?.delivery_sms ?? false },
                ].map(({ label, field, value }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <Toggle
                      checked={value}
                      onChange={(v) => updateSettings({ [field]: v })}
                    />
                    <span className="text-[12px] text-muted-foreground/60">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={Sparkles} title="AI Messaging">
            <div className="space-y-3 mb-5">
              {[
                { value: "draft" as const, label: "Draft only", desc: "AI writes, you review and send" },
                { value: "safe" as const, label: "Auto-send safe replies", desc: "Price guides and acknowledgements sent automatically" },
                { value: "full" as const, label: "Full auto-send", desc: "All qualifying messages sent without review" },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors duration-150 ${(settings?.ai_mode ?? "draft") === opt.value ? "border-foreground/20 bg-muted/30" : "border-border/30 hover:bg-muted/15"}`}>
                  <input
                    type="radio"
                    name="messagingMode"
                    value={opt.value}
                    checked={(settings?.ai_mode ?? "draft") === opt.value}
                    onChange={() => updateSettings({ ai_mode: opt.value })}
                    className="mt-0.5 accent-foreground"
                  />
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground/50">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/20 bg-card/30">
              <p className="text-[12px] text-muted-foreground/60">Using your approved response style</p>
              <button className="text-[12px] text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors">
                Review style
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/30 mt-4">EnHub only auto-sends messages you&apos;ve approved.</p>
          </Section>

          <Section icon={Flame} title="Lead Handling">
            <div className="space-y-4">
              <div className="pt-4 border-t border-border/15">
                <p className="text-[11px] text-muted-foreground/40 mb-3 tracking-wide uppercase font-medium">Escalate to hot when</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-foreground/80">Buyer replies with intent</span>
                    <Toggle
                      checked={settings?.notify_inspection_request ?? true}
                      onChange={(v) => updateSettings({ notify_inspection_request: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-foreground/80">Buyer requests inspection</span>
                    <Toggle
                      checked={settings?.notify_inspection_request ?? true}
                      onChange={(v) => updateSettings({ notify_inspection_request: v })}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/30 pt-2">&quot;Mark as Hot&quot; is always available on any lead.</p>
            </div>
          </Section>

          <Section icon={ArrowRight} title="CRM Handoff">
            <div className="space-y-4">
              <p className="text-[12px] text-muted-foreground/50">CRM integration coming soon.</p>
            </div>
          </Section>

          <Section icon={Shield} title="Security">
            <div className="space-y-3">
              <button className="flex items-center justify-between w-full p-3.5 rounded-xl border border-border/30 hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-[13px] text-foreground/80">Change password</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
              </button>
              <button className="flex items-center justify-between w-full p-3.5 rounded-xl border border-border/30 hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-[13px] text-foreground/80">Log out of all sessions</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
              </button>
            </div>
          </Section>

          {isSaving && (
            <div className="fixed bottom-6 right-6 bg-foreground text-background px-4 py-2 rounded-xl text-[12px] font-medium flex items-center gap-2 shadow-lg">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
