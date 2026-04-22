/*
 * DESIGN PHILOSOPHY: "War Room" — Military Command Center Aesthetic
 * - Near-black (#0A0E17) base with electric green (#00FF88) accent
 * - Space Grotesk for headlines, IBM Plex Mono for data, Inter for body
 * - Sharp corners, scan-line animations, tactical urgency
 * - "Classified intel" feel reinforces the "cheat code" positioning
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  Download,
  ArrowRight,
  Lock,
  Clock,
  DollarSign,
  Users,
  FileText,
  ChevronDown,
} from "lucide-react";

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Contract Preview Card ─── */
function ContractCard({
  title,
  difficulty,
  value,
  icon: Icon,
  delay,
}: {
  title: string;
  difficulty: string;
  value: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: "0 0 24px oklch(0.82 0.22 155 / 0.15)" }}
      className="relative border border-[oklch(0.2_0.02_250)] bg-[oklch(0.11_0.01_250)] p-6 group"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[var(--color-govgreen)]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--color-govgreen)]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[var(--color-govgreen)]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--color-govgreen)]" />

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 flex items-center justify-center border border-[var(--color-govgreen)] text-[var(--color-govgreen)] shrink-0">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-white text-lg leading-tight mb-2">{title}</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono text-[var(--color-govgreen)] bg-[oklch(0.82_0.22_155_/_0.08)] px-2 py-0.5">
              {difficulty}
            </span>
            <span className="font-mono text-[var(--color-govamber)]">{value}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[oklch(0.2_0.02_250)] flex items-center gap-2 text-sm text-muted-foreground group-hover:text-[var(--color-govgreen)] transition-colors">
        <Lock size={14} />
        <span className="font-mono text-xs">FULL INTEL IN CHEAT SHEET</span>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.2_0.02_250)] bg-[oklch(0.09_0.01_250_/_0.9)] backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <a href="https://govcheat.com" className="font-display font-bold text-xl tracking-tight text-white">
            GOV<span className="text-[var(--color-govgreen)]">CHEAT</span>
          </a>
          <a
            href="#get-cheatsheet"
            className="font-mono text-xs px-4 py-2 border border-[var(--color-govgreen)] text-[var(--color-govgreen)] hover:bg-[var(--color-govgreen)] hover:text-black transition-all duration-200"
          >
            GET FREE CHEAT SHEET
          </a>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center pt-14">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/manus-storage/hero_bg_aeffa26e.png')" }}
        />
        {/* Scan line overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-govgreen)] to-transparent opacity-20 animate-scanline" />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(oklch(0.82 0.22 155) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.22 155) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left: Copy */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-govgreen)] border border-[var(--color-govgreen)] px-3 py-1.5 mb-6 bg-[oklch(0.82_0.22_155_/_0.05)]">
                  <span className="w-2 h-2 bg-[var(--color-govgreen)] rounded-full animate-pulse" />
                  LIVE INTEL — 15,145 ACTIVE CONTRACTS
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white mb-6"
              >
                Stop Guessing.<br />
                Start <span className="text-[var(--color-govgreen)]">Winning</span><br />
                Government Contracts.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-[oklch(0.7_0.01_250)] max-w-xl mb-8 leading-relaxed"
              >
                Download the free <span className="text-white font-semibold">Ultimate GovCon Cheat Sheet</span> and discover the 10 easiest government contracts to win in 2026 — even with zero experience. Over $183 billion was awarded to small businesses last year. Your share is waiting.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap gap-6 font-mono text-sm text-[oklch(0.6_0.01_250)]"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-govgreen)]" />
                  <span>No experience needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-govgreen)]" />
                  <span>Contracts under $15K</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-govgreen)]" />
                  <span>Instant download</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Book mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-2 flex justify-center"
            >
              <div className="animate-float relative">
                <div className="absolute -inset-4 bg-[var(--color-govgreen)] opacity-10 blur-3xl rounded-full" />
                <img
                  src="/manus-storage/govcon_cheat_sheet_cover_960e7e7d.png"
                  alt="The Ultimate GovCon Cheat Sheet"
                  className="relative w-72 sm:w-80 drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="font-mono text-xs">SCROLL FOR INTEL</span>
            <ChevronDown size={16} className="animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="border-y border-[oklch(0.2_0.02_250)] bg-[oklch(0.07_0.01_250)]">
        <div className="container py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 183, suffix: "B", prefix: "$", label: "Awarded to Small Biz (FY2024)" },
              { value: 15145, suffix: "+", prefix: "", label: "Active Contracts Right Now" },
              { value: 28, suffix: "%", prefix: "", label: "Of All Federal Dollars" },
              { value: 10, suffix: "", prefix: "", label: "Easy-Win Categories Inside" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-govgreen)] mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT'S INSIDE ═══ */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="font-mono text-xs text-[var(--color-govgreen)] mb-3 tracking-widest">// CLASSIFIED INTEL</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              What's Inside the Cheat Sheet
            </h2>
            <p className="text-[oklch(0.6_0.01_250)] max-w-2xl mx-auto leading-relaxed">
              Ten contract categories ranked by difficulty, competition level, and realistic value. Each one includes how to find them, what to expect, and exactly how to position yourself to win.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ContractCard title="Micro-Purchase Contracts" difficulty="EASY" value="Up to $15K" icon={Zap} delay={0} />
            <ContractCard title="Subcontracting Opportunities" difficulty="EASY" value="$10K - $500K" icon={Users} delay={0.08} />
            <ContractCard title="Cooperative Purchasing" difficulty="EASY" value="$5K - $500K" icon={Target} delay={0.16} />
            <ContractCard title="Simplified Acquisitions" difficulty="MODERATE" value="$15K - $350K" icon={FileText} delay={0.24} />
            <ContractCard title="Janitorial & Custodial" difficulty="MODERATE" value="$50K - $500K" icon={Shield} delay={0.32} />
            <ContractCard title="IT Support & Help Desk" difficulty="MODERATE" value="$50K - $2M+" icon={TrendingUp} delay={0.4} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <span className="font-mono text-sm text-muted-foreground">
              + 4 more categories inside the full cheat sheet
            </span>
          </motion.div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF / WHY GOVCHEAT ═══ */}
      <section
        className="py-20 lg:py-28 relative"
        style={{ backgroundImage: "url('/manus-storage/social_proof_bg_fe7da0ea.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-[oklch(0.09_0.01_250_/_0.85)]" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="font-mono text-xs text-[var(--color-govamber)] mb-3 tracking-widest">// STRATEGIC ADVANTAGE</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Why Smart Contractors Use GovCheat
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Find Contracts Faster",
                desc: "Stop wasting hours on SAM.gov. Our AI-powered matching surfaces the contracts you're most likely to win, ranked by competition level and deadline.",
              },
              {
                icon: DollarSign,
                title: "Win More Revenue",
                desc: "Members who use our cheat sheet strategy report landing their first government contract within 90 days. The average first win? $47,000.",
              },
              {
                icon: Clock,
                title: "Save 20+ Hours/Week",
                desc: "Automated alerts, pre-filtered categories, and deadline tracking mean you spend time bidding, not searching. Every minute counts when deadlines are live.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border border-[oklch(0.2_0.02_250)] bg-[oklch(0.1_0.01_250_/_0.8)] p-8 backdrop-blur-sm"
              >
                <div className="w-12 h-12 flex items-center justify-center border border-[var(--color-govgreen)] text-[var(--color-govgreen)] mb-5">
                  <item.icon size={24} />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-[oklch(0.6_0.01_250)] leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EMAIL CAPTURE / CTA ═══ */}
      <section id="get-cheatsheet" className="py-20 lg:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative border border-[var(--color-govgreen)] bg-[oklch(0.1_0.01_250)] p-8 sm:p-12"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--color-govgreen)]" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--color-govgreen)]" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--color-govgreen)]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--color-govgreen)]" />

              <div className="text-center">
                <div className="font-mono text-xs text-[var(--color-govgreen)] mb-4 tracking-widest">// DOWNLOAD NOW — FREE ACCESS</div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                  Get Your Free Cheat Sheet
                </h2>
                <p className="text-[oklch(0.6_0.01_250)] max-w-lg mx-auto mb-8 leading-relaxed">
                  Enter your email below and we'll send you the complete <span className="text-white font-semibold">Ultimate GovCon Cheat Sheet</span> — all 10 contract categories, step-by-step strategies, and the exact playbook to land your first government contract.
                </p>

                {!submitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your best email..."
                      required
                      className="flex-1 bg-[oklch(0.07_0.01_250)] border border-[oklch(0.25_0.02_250)] px-4 py-3 text-white font-mono text-sm placeholder:text-[oklch(0.4_0.01_250)] focus:border-[var(--color-govgreen)] focus:outline-none focus:ring-1 focus:ring-[var(--color-govgreen)] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[var(--color-govgreen)] text-black font-display font-bold px-6 py-3 text-sm hover:brightness-110 transition-all animate-pulse-glow disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                    >
                      {isSubmitting ? (
                        <span className="font-mono text-xs">PROCESSING...</span>
                      ) : (
                        <>
                          <Download size={16} />
                          <span>SEND MY CHEAT SHEET</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[oklch(0.82_0.22_155_/_0.08)] border border-[var(--color-govgreen)] p-6"
                  >
                    <CheckCircle size={32} className="text-[var(--color-govgreen)] mx-auto mb-3" />
                    <h3 className="font-display font-bold text-xl text-white mb-2">Intel Incoming.</h3>
                    <p className="font-mono text-sm text-[oklch(0.6_0.01_250)]">
                      Check your inbox. Your cheat sheet is on the way.<br />
                      While you wait — <a href="https://govcheat.com" className="text-[var(--color-govgreen)] underline hover:brightness-110">explore live contracts on GovCheat</a>.
                    </p>
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} />
                    <span>No spam, ever</span>
                  </div>
                  <span className="text-[oklch(0.25_0.02_250)]">|</span>
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} />
                    <span>Unsubscribe anytime</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ URGENCY STRIP ═══ */}
      <section className="border-y border-[oklch(0.2_0.02_250)] bg-[oklch(0.07_0.01_250)]">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <div className="font-mono text-sm text-[var(--color-govamber)] flex items-center gap-2">
              <Clock size={14} />
              <span>Government contracts expire daily.</span>
            </div>
            <span className="hidden sm:inline text-[oklch(0.25_0.02_250)]">|</span>
            <div className="font-mono text-sm text-white">
              The businesses that move first, win first.
            </div>
            <a
              href="#get-cheatsheet"
              className="font-mono text-sm text-[var(--color-govgreen)] flex items-center gap-1 hover:underline"
            >
              Get the cheat sheet now <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 border-t border-[oklch(0.15_0.01_250)]">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-display font-bold text-lg text-white">
              GOV<span className="text-[var(--color-govgreen)]">CHEAT</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              The Cheat Code for Government Contracts
            </div>
            <a
              href="https://govcheat.com"
              className="font-mono text-xs text-[var(--color-govgreen)] hover:underline flex items-center gap-1"
            >
              Go to GovCheat.com <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
