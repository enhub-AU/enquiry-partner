"use client";

import { motion } from "framer-motion";
import { ArrowRight, Inbox, Sparkles, Phone, Filter, Shield, Zap, Search, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 },
  }),
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">EnHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#why-enhub" className="hover:text-foreground transition-colors">Why EnHub</a>
            <a href="#product" className="hover:text-foreground transition-colors">Product</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </button>
            <a
              href="#cta"
              className="h-9 px-5 rounded-full bg-foreground text-background text-[13px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              Request a demo
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-[11px] font-medium tracking-[0.25em] uppercase text-primary mb-5"
            >
              Enquiry intelligence for real estate
            </motion.p>
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-[clamp(2.25rem,5vw,3.5rem)] font-bold tracking-[-0.03em] leading-[1.1] text-foreground mb-6"
            >
              Turn enquiries into conversations worth having.
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-[17px] leading-relaxed text-muted-foreground max-w-lg mb-10"
            >
              EnHub sits between your enquiries and your phone — qualifying leads, filtering noise, and alerting agents only when it&apos;s worth calling.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="flex items-center gap-4">
              <a
                href="#cta"
                className="h-12 px-7 rounded-full bg-foreground text-background text-[14px] font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Request a demo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="text-[14px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                See how it works
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </motion.div>

          {/* Product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
            className="mt-16 md:mt-20 rounded-2xl border border-border/40 shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.08)] overflow-hidden bg-card"
          >
            <Image
              src="/images/enhub-product-mockup.png"
              alt="EnHub unified inbox showing conversation list, message thread, and lead context panel"
              width={1200}
              height={675}
              className="w-full"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAND ── */}
      <section className="py-16 border-y border-border/20 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[13px] text-muted-foreground/50">
            <span>Built for real estate agencies</span>
            <span className="hidden md:inline text-border/60">&middot;</span>
            <span>Designed for speed-to-lead</span>
            <span className="hidden md:inline text-border/60">&middot;</span>
            <span>Works alongside your CRM</span>
            <span className="hidden md:inline text-border/60">&middot;</span>
            <span>Trusted by leading agencies</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-16"
          >
            <motion.p custom={0} variants={fadeUp} className="text-[11px] font-medium tracking-[0.25em] uppercase text-primary mb-4">
              How it works
            </motion.p>
            <motion.h2 custom={1} variants={fadeUp} className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em] text-foreground">
              Three steps. Zero noise.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid md:grid-cols-3 gap-8 md:gap-12"
          >
            {[
              {
                icon: Inbox,
                step: "01",
                title: "All enquiries, one inbox",
                desc: "Every enquiry from portals, email, and websites flows into one clean inbox.",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "AI qualifies quietly in the background",
                desc: "EnHub responds instantly, sounds like the agent, and qualifies intent automatically.",
              },
              {
                icon: Phone,
                step: "03",
                title: "Agents call only when it matters",
                desc: "When a lead turns hot, EnHub alerts the agent — with context, not noise.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                variants={fadeUp}
                className="text-center md:text-left"
              >
                <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-5 mx-auto md:mx-0">
                  <item.icon className="h-5 w-5 text-foreground/60" />
                </div>
                <p className="text-[11px] font-mono text-muted-foreground/40 mb-2">{item.step}</p>
                <h3 className="text-[16px] font-semibold text-foreground mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROBLEM FRAMING ── */}
      <section className="py-24 md:py-32 bg-muted/20 border-y border-border/20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em] text-foreground mb-8"
            >
              Most agents don&apos;t miss leads.{" "}
              <span className="text-muted-foreground">They miss timing.</span>
            </motion.h2>
            <motion.div
              custom={1}
              variants={fadeUp}
              className="grid sm:grid-cols-2 gap-5 text-left max-w-xl mx-auto"
            >
              {[
                "90% of enquiries are low-intent",
                "Agents waste hours replying to price-only messages",
                "Real buyers get buried in inboxes",
                "Speed drops when volume increases",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{point}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── DIFFERENTIATION ── */}
      <section id="why-enhub" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div custom={0} variants={fadeUp} className="text-center mb-16">
              <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-primary mb-4">
                Why EnHub
              </p>
              <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em] text-foreground">
                Built for how agents actually work
              </h2>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUp}
              className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              {[
                { icon: Filter, title: "Filters noise automatically", desc: "Price-guide and early-stage enquiries are handled without agent input." },
                { icon: Search, title: "Qualifies buyers before agents call", desc: "Budget, timeline, and intent — confirmed before the phone rings." },
                { icon: Shield, title: "Protects agent attention", desc: "Only hot leads surface. Everything else is managed quietly." },
                { icon: Zap, title: "Works before your CRM", desc: "EnHub operates upstream — enquiry to qualification, not deal management." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 p-5 rounded-2xl border border-border/30 bg-card/40 hover:bg-card/70 transition-colors duration-200"
                >
                  <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-foreground/50" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-foreground mb-1 tracking-tight">{item.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PRODUCT SNAPSHOT ── */}
      <section id="product" className="py-24 md:py-32 bg-muted/20 border-y border-border/20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div custom={0} variants={fadeUp} className="text-center mb-12">
              <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-primary mb-4">
                The product
              </p>
              <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-[-0.02em] text-foreground mb-4">
                One inbox. Every channel. Total clarity.
              </h2>
              <p className="text-[15px] text-muted-foreground max-w-lg mx-auto">
                Search by name, email, or phone. See what&apos;s hot, what&apos;s being qualified, and what&apos;s been handled — at a glance.
              </p>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {["Unified inbox", "Hot lead alerts", "AI qualification", "Search & recall", "Multi-channel"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/60 border border-border/40 rounded-full px-3.5 py-1.5"
                >
                  <CheckCircle2 className="h-3 w-3 text-primary/50" />
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.div
              custom={2}
              variants={fadeUp}
              className="rounded-2xl border border-border/40 shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.08)] overflow-hidden bg-card"
            >
              <Image
                src="/images/enhub-product-mockup.png"
                alt="EnHub product interface showing unified inbox with conversation thread and lead context"
                width={1200}
                height={675}
                className="w-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section id="cta" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-[-0.02em] text-foreground mb-6"
            >
              Know who&apos;s worth calling —{" "}
              <span className="text-muted-foreground">before you pick up the phone.</span>
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-[15px] text-muted-foreground mb-10 max-w-md mx-auto">
              Join leading agencies using EnHub to protect their time and respond to the enquiries that matter.
            </motion.p>
            <motion.div custom={2} variants={fadeUp} className="flex items-center justify-center gap-4">
              <a
                href="mailto:hello@enhub.com"
                className="h-12 px-8 rounded-full bg-foreground text-background text-[14px] font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Request a demo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@enhub.com"
                className="h-12 px-8 rounded-full border border-border/50 text-foreground text-[14px] font-medium flex items-center gap-2 hover:bg-muted/40 transition-colors"
              >
                Join the waitlist
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">EnHub</span>
          </div>
          <p className="text-[12px] text-muted-foreground/40">
            &copy; {new Date().getFullYear()} EnHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
