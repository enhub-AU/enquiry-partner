"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { motion } from "framer-motion";
import {
  User,
  Mail,
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
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Globe,
  Home,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

/* ── Toggle component ── */
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

/* ── Section wrapper ── */
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

/* ── Field row ── */
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

/* ── Connection card ── */
function ConnectionCard({
  icon: Icon,
  name,
  connected,
  helper,
}: {
  icon: React.ElementType;
  name: string;
  connected: boolean;
  helper: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/40">
      <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-foreground/50" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-medium text-foreground">{name}</span>
          {connected ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--channel-sms))] font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--warm))] font-medium">
              <AlertCircle className="h-3 w-3" />
              Needs attention
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/50">{helper}</p>
      </div>
      <button className="text-[12px] text-foreground/70 hover:text-foreground flex items-center gap-1 transition-colors flex-shrink-0">
        {connected ? "View" : "Connect"}
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("Jordan Reynolds");
  const [email, setEmail] = useState("jordan@raywhite.com.au");
  const [phone, setPhone] = useState("0412 345 678");

  const [notifyHot, setNotifyHot] = useState(true);
  const [notifyUncalled, setNotifyUncalled] = useState(true);
  const [notifyWarmReply, setNotifyWarmReply] = useState(true);
  const [uncalledMins, setUncalledMins] = useState("15");
  const [deliveryPush, setDeliveryPush] = useState(true);
  const [deliveryEmail, setDeliveryEmail] = useState(true);
  const [deliverySms, setDeliverySms] = useState(false);

  const [messagingMode, setMessagingMode] = useState<"draft" | "safe" | "full">("draft");

  const [autoPrice, setAutoPrice] = useState(true);
  const [escalateIntent, setEscalateIntent] = useState(true);
  const [escalateInspection, setEscalateInspection] = useState(true);

  const [crmEnabled, setCrmEnabled] = useState(false);
  const [crmSendDetails, setCrmSendDetails] = useState(true);
  const [crmSendSummary, setCrmSendSummary] = useState(true);

  const inputClass =
    "h-10 w-full rounded-xl border border-border/40 bg-background/60 px-4 text-[13px] text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-border transition-all duration-150";

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
                  JR
                </div>
                <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-85 transition-opacity">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">{name}</p>
                <p className="text-[11px] text-muted-foreground/40">Agent</p>
              </div>
            </div>
            <Field label="Name">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Role">
              <span className="text-[13px] text-muted-foreground/60">Agent</span>
            </Field>
          </Section>

          <Section icon={Plug} title="Inbox Connections">
            <div className="space-y-3">
              <ConnectionCard icon={Mail} name="Email inbox" connected={true} helper="EnHub is receiving enquiries from Gmail, including REA and Domain portal emails" />
            </div>
          </Section>

          <Section icon={Bell} title="Notifications">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground/80">Notify me when a lead turns hot</span>
                <Toggle checked={notifyHot} onChange={setNotifyHot} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] text-foreground/80">Notify if a hot lead hasn&apos;t been called within</span>
                <div className="flex items-center gap-2">
                  <select value={uncalledMins} onChange={(e) => setUncalledMins(e.target.value)} className="h-8 px-2 rounded-lg border border-border/40 bg-background text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30">
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                  </select>
                  <Toggle checked={notifyUncalled} onChange={setNotifyUncalled} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground/80">Notify me when a warm lead replies</span>
                <Toggle checked={notifyWarmReply} onChange={setNotifyWarmReply} />
              </div>
            </div>
            <div className="pt-4 border-t border-border/15">
              <p className="text-[11px] text-muted-foreground/40 mb-3 tracking-wide uppercase font-medium">Delivery</p>
              <div className="flex gap-6">
                {[
                  { label: "Push", checked: deliveryPush, onChange: setDeliveryPush },
                  { label: "Email", checked: deliveryEmail, onChange: setDeliveryEmail },
                  { label: "SMS", checked: deliverySms, onChange: setDeliverySms },
                ].map(({ label, checked, onChange }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <Toggle checked={checked} onChange={onChange} />
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
                <label key={opt.value} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors duration-150 ${messagingMode === opt.value ? "border-foreground/20 bg-muted/30" : "border-border/30 hover:bg-muted/15"}`}>
                  <input type="radio" name="messagingMode" value={opt.value} checked={messagingMode === opt.value} onChange={() => setMessagingMode(opt.value)} className="mt-0.5 accent-foreground" />
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
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground/80">Auto-handle price-guide enquiries</span>
                <Toggle checked={autoPrice} onChange={setAutoPrice} />
              </div>
              <div className="pt-4 border-t border-border/15">
                <p className="text-[11px] text-muted-foreground/40 mb-3 tracking-wide uppercase font-medium">Escalate to hot when</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-foreground/80">Buyer replies with intent</span>
                    <Toggle checked={escalateIntent} onChange={setEscalateIntent} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-foreground/80">Buyer requests inspection</span>
                    <Toggle checked={escalateInspection} onChange={setEscalateInspection} />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/30 pt-2">&quot;Mark as Hot&quot; is always available on any lead.</p>
            </div>
          </Section>

          <Section icon={ArrowRight} title="CRM Handoff">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground/80">Send hot leads to CRM</span>
                <Toggle checked={crmEnabled} onChange={setCrmEnabled} />
              </div>
              {crmEnabled && (
                <div className="space-y-4 pt-3 animate-fade-in">
                  <Field label="Destination">
                    <select className="h-10 w-full rounded-xl border border-border/40 bg-background/60 px-4 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30">
                      <option>Select CRM</option>
                      <option>Agentbox</option>
                      <option>Rex</option>
                      <option>VaultRE</option>
                    </select>
                  </Field>
                  <div className="pt-3 border-t border-border/15">
                    <p className="text-[11px] text-muted-foreground/40 mb-3 tracking-wide uppercase font-medium">What gets sent</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-foreground/80">Contact details</span>
                        <Toggle checked={crmSendDetails} onChange={setCrmSendDetails} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-foreground/80">Conversation summary</span>
                        <Toggle checked={crmSendSummary} onChange={setCrmSendSummary} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
        </motion.div>
      </main>
    </div>
  );
}
