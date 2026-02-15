"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { mockEnquiries } from "@/data/mockEnquiries";
import { channelConfig } from "@/lib/channelConfig";
import { Phone, ChevronRight, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* -- count-up hook -- */
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* -- live elapsed timer -- */
function useElapsed(since: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, now - since.getTime());
  const secs = Math.floor(diff / 1000) % 60;
  const mins = Math.floor(diff / 60000) % 60;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, "0")}m`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function LiveTimer({ since }: { since: Date }) {
  const elapsed = useElapsed(since);
  return (
    <span className="text-[11px] font-mono whitespace-nowrap flex items-center gap-1.5 text-muted-foreground/50">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      {elapsed}
    </span>
  );
}

/* -- greeting -- */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* -- animation variants -- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardHover = {
  y: -2,
  transition: { duration: 0.2, ease: "easeOut" },
};

export default function DashboardPage() {
  const router = useRouter();

  const hotLeads = mockEnquiries
    .filter((e) => e.status === "hot")
    .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
    .slice(0, 5);

  const stats = {
    autoHandled: mockEnquiries.filter((e) => e.status === "auto_handled")
      .length,
    promotedHot: hotLeads.length,
    waitingReply: mockEnquiries.filter((e) =>
      e.messages.some((m) => m.status === "pending_approval")
    ).length,
  };

  const handledCount = useCountUp(stats.autoHandled, 2000);
  const promotedCount = useCountUp(stats.promotedHot, 1600);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background relative">
        {/* Ambient light effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,hsl(36,80%,70%,0.08),transparent_60%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsl(270,60%,80%,0.06),transparent_60%)] blur-3xl pointer-events-none" />

        <motion.div
          className="max-w-[720px] mx-auto px-8 pt-20 pb-32 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* GREETING */}
          <motion.div variants={itemVariants} className="mb-16">
            <p className="text-muted-foreground text-[15px] font-medium mb-3">
              {getGreeting()}
            </p>
            <h1 className="text-[clamp(2.8rem,6vw,4.2rem)] font-extrabold tracking-[-0.04em] leading-[0.92] text-foreground">
              Your leads,
              <br />
              <span className="text-gradient-brand">handled.</span>
            </h1>
          </motion.div>

          {/* STATS ROW */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 mb-16"
          >
            {[
              { label: "Auto-handled", value: handledCount, accent: true },
              { label: "Promoted", value: promotedCount, accent: true },
              { label: "Waiting", value: stats.waitingReply, accent: false },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 group"
              >
                <div className="flex items-center gap-2.5">
                  <p
                    className={`text-[36px] font-extrabold tracking-[-0.03em] leading-none ${
                      stat.accent ? "text-gradient-brand" : "text-foreground"
                    }`}
                  >
                    {stat.value}
                  </p>
                  {stat.accent && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: [6, -2, 0] }}
                      transition={{
                        delay: 1.2 + i * 0.15,
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      className="relative"
                    >
                      <div className="h-5 w-5 rounded-md bg-[hsl(var(--channel-sms)/0.12)] flex items-center justify-center">
                        <motion.div
                          animate={{ y: [0, -1, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <ArrowUp className="h-2.5 w-2.5 text-[hsl(var(--channel-sms))]" />
                        </motion.div>
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-md bg-[hsl(var(--channel-sms)/0.08)]"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground mt-2 font-medium tracking-wide">
                  {stat.label}
                </p>
                {stat.accent && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[radial-gradient(circle,hsl(36,80%,60%,0.08),transparent_70%)] pointer-events-none" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* PRIORITY QUEUE */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-[13px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                  Call Now
                </h2>
              </div>
              <span className="text-[12px] text-muted-foreground/60 font-medium">
                {hotLeads.length} {hotLeads.length === 1 ? "lead" : "leads"}{" "}
                ready
              </span>
            </div>

            {hotLeads.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
                <p className="text-muted-foreground text-sm">
                  No calls needed right now. Everything is handled.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {hotLeads.map((lead, i) => {
                  const ChannelIcon = channelConfig[lead.channel].icon;

                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.7 + i * 0.08,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={cardHover}
                      onClick={() => router.push(`/inbox?id=${lead.id}`)}
                      className="group relative flex items-center gap-5 rounded-2xl bg-card border border-border/40 p-5 cursor-pointer transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_30px_-8px_hsl(36,80%,50%,0.12)]"
                    >
                      {/* Sequence indicator */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                        <span className="text-[12px] font-bold font-mono text-primary-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Channel icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                        <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">
                            {lead.clientName}
                          </span>
                          <LiveTimer since={lead.lastActivity} />
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-1">
                          {lead.subject}
                        </p>
                      </div>

                      {/* Phone + arrow */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <a
                          href={`tel:${lead.clientPhone?.replace(/\s/g, "")}`}
                          className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold font-mono text-foreground/80 hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {lead.clientPhone || "\u2014"}
                        </a>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/25 group-hover:text-primary/60 transition-colors duration-300" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* QUIET FOOTER */}
          <motion.div variants={itemVariants} className="mt-20 text-center">
            <p className="text-[12px] text-muted-foreground/40 font-medium tracking-wide">
              Everything else is handled quietly in the background.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
