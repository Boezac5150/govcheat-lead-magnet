/**
 * Thank You / Upsell Page
 * Shown after successful email capture. Delivers the cheat sheet PDF
 * and pitches 4-tier pricing with AI Bid Writer as the core paid feature.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle,
  Download,
  ArrowRight,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Star,
  Crown,
  Lock,
  Bot,
  FileText,
  Bell,
  BarChart3,
  Headphones,
  Sparkles,
  Check,
  X,
} from "lucide-react";

const PDF_URL = "/manus-storage/Ultimate_GovCon_Cheat_Sheet_2026_45abce47.pdf";

/* ─── Tier Definitions ─── */
const tiers = [
  {
    name: "Scout",
    price: 0,
    period: "forever",
    tagline: "Start learning the game",
    cta: "CURRENT PLAN",
    ctaStyle: "border border-[oklch(0.3_0.02_250)] text-muted-foreground cursor-default",
    highlight: false,
    features: [
      { text: "GovCon Cheat Sheet (PDF)", included: true },
      { text: "Weekly contract digest email", included: true },
      { text: "SAM.gov basics guide", included: true },
      { text: "AI Bid Writer", included: false },
      { text: "Contract matching alerts", included: false },
      { text: "Bid-ready templates", included: false },
      { text: "Win rate analytics", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Operator",
    price: 29,
    period: "/mo",
    tagline: "Find and bid on contracts",
    cta: "START BIDDING",
    ctaStyle: "bg-[var(--color-govgreen)] text-black hover:brightness-110",
    highlight: false,
    features: [
      { text: "Everything in Scout", included: true },
      { text: "AI Bid Writer — 10 bids/mo", included: true },
      { text: "Daily contract matching alerts", included: true },
      { text: "5 bid-ready templates", included: true },
      { text: "Basic win rate tracking", included: true },
      { text: "Email support", included: true },
      { text: "Compliance checker", included: false },
      { text: "Dedicated advisor", included: false },
    ],
  },
  {
    name: "Contractor",
    price: 79,
    period: "/mo",
    tagline: "Win consistently",
    cta: "GO PRO",
    ctaStyle: "bg-[var(--color-govgreen)] text-black hover:brightness-110 ring-2 ring-[var(--color-govgreen)] ring-offset-2 ring-offset-[oklch(0.09_0.01_250)]",
    highlight: true,
    badge: "MOST POPULAR",
    features: [
      { text: "Everything in Operator", included: true },
      { text: "AI Bid Writer — Unlimited bids", included: true },
      { text: "Full template library (50+)", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Compliance auto-checker", included: true },
      { text: "Priority email + chat support", included: true },
      { text: "Subcontractor matching", included: true },
      { text: "Dedicated advisor", included: false },
    ],
  },
  {
    name: "Prime",
    price: 299,
    period: "/mo",
    tagline: "Dominate your NAICS codes",
    cta: "GO PRIME",
    ctaStyle: "bg-[var(--color-govamber)] text-black hover:brightness-110",
    highlight: false,
    features: [
      { text: "Everything in Contractor", included: true },
      { text: "AI Bid Writer — Unlimited + priority", included: true },
      { text: "Dedicated GovCon advisor", included: true },
      { text: "Custom proposal reviews", included: true },
      { text: "Competitor intelligence reports", included: true },
      { text: "Phone + Slack support", included: true },
      { text: "White-label bid documents", included: true },
      { text: "Quarterly strategy sessions", included: true },
    ],
  },
];

export default function ThankYou() {
  const [countdown, setCountdown] = useState(15 * 60);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const handleCheckout = async (tier: "operator" | "contractor" | "prime") => {
    setLoadingTier(tier);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        tier,
        origin: window.location.origin,
      });

      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.2_0.02_250)] bg-[oklch(0.09_0.01_250_/_0.9)] backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <a
            href="https://govcheat.com"
            className="font-display font-bold text-xl tracking-tight text-white"
          >
            GOV<span className="text-[var(--color-govgreen)]">CHEAT</span>
          </a>
          <a
            href={PDF_URL}
            download
            className="font-mono text-xs border border-[var(--color-govgreen)] text-[var(--color-govgreen)] px-4 py-2 hover:bg-[var(--color-govgreen)] hover:text-black transition-all flex items-center gap-2"
          >
            <Download size={14} />
            DOWNLOAD PDF
          </a>
        </div>
      </nav>

      {/* ═══ SUCCESS HERO ═══ */}
      <section className="pt-28 pb-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.82_0.22_155_/_0.04)_0%,transparent_70%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-[oklch(0.82_0.22_155_/_0.1)] border border-[oklch(0.82_0.22_155_/_0.3)] px-4 py-2 mb-6">
              <CheckCircle size={18} className="text-[var(--color-govgreen)]" />
              <span className="font-mono text-sm text-[var(--color-govgreen)]">
                INTEL SECURED
              </span>
            </div>

            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
              Your Cheat Sheet is{" "}
              <span className="text-[var(--color-govgreen)]">Ready</span>
            </h1>

            <p className="text-[oklch(0.6_0.01_250)] text-lg mb-8 leading-relaxed">
              Download the Ultimate GovCon Cheat Sheet and start identifying
              your first government contract win.
            </p>

            <a
              href={PDF_URL}
              download
              className="inline-flex items-center gap-3 bg-[var(--color-govgreen)] text-black font-display font-bold px-8 py-4 text-lg hover:brightness-110 transition-all animate-pulse-glow"
            >
              <Download size={20} />
              DOWNLOAD YOUR CHEAT SHEET
            </a>

            <p className="mt-4 font-mono text-xs text-muted-foreground">
              PDF format — 10 contract categories — instant access
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ AI BID WRITER SPOTLIGHT ═══ */}
      <section className="py-16 border-y border-[oklch(0.2_0.02_250)] bg-[oklch(0.07_0.01_250)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.82_0.22_155_/_0.03)_0%,transparent_50%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.82_0.22_155_/_0.08)] border border-[oklch(0.82_0.22_155_/_0.2)] px-4 py-2 mb-4">
                <Bot size={16} className="text-[var(--color-govgreen)]" />
                <span className="font-mono text-xs text-[var(--color-govgreen)]">
                  POWERED BY AI
                </span>
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                Meet the{" "}
                <span className="text-[var(--color-govgreen)]">
                  AI Bid Writer
                </span>
              </h2>
              <p className="text-[oklch(0.6_0.01_250)] max-w-xl mx-auto text-lg leading-relaxed">
                Stop spending 40+ hours writing proposals from scratch. Our AI
                analyzes the solicitation, matches your capabilities, and
                generates a compliant, competitive bid in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[oklch(0.1_0.01_250)] border border-[oklch(0.2_0.02_250)] p-6 text-center">
                <FileText
                  size={28}
                  className="text-[var(--color-govgreen)] mx-auto mb-3"
                />
                <h3 className="font-display font-bold text-white mb-2">
                  Paste the Solicitation
                </h3>
                <p className="text-sm text-[oklch(0.5_0.01_250)]">
                  Drop in the RFP, RFQ, or solicitation number. The AI extracts
                  every requirement automatically.
                </p>
              </div>
              <div className="bg-[oklch(0.1_0.01_250)] border border-[oklch(0.2_0.02_250)] p-6 text-center">
                <Sparkles
                  size={28}
                  className="text-[var(--color-govgreen)] mx-auto mb-3"
                />
                <h3 className="font-display font-bold text-white mb-2">
                  AI Writes Your Bid
                </h3>
                <p className="text-sm text-[oklch(0.5_0.01_250)]">
                  Generates a compliant proposal with technical approach, past
                  performance, and pricing narrative — tailored to win.
                </p>
              </div>
              <div className="bg-[oklch(0.1_0.01_250)] border border-[oklch(0.2_0.02_250)] p-6 text-center">
                <Target
                  size={28}
                  className="text-[var(--color-govgreen)] mx-auto mb-3"
                />
                <h3 className="font-display font-bold text-white mb-2">
                  Submit & Win
                </h3>
                <p className="text-sm text-[oklch(0.5_0.01_250)]">
                  Export to Word/PDF, review, and submit. Members using the AI
                  Bid Writer report 3x higher win rates.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING TIERS ═══ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.82_0.16_75_/_0.03)_0%,transparent_60%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Urgency Banner */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-[oklch(0.82_0.16_75_/_0.1)] border border-[oklch(0.82_0.16_75_/_0.3)] px-6 py-3 mb-6">
                <Clock size={16} className="text-[var(--color-govamber)]" />
                <span className="font-mono text-sm text-[var(--color-govamber)]">
                  LAUNCH PRICING EXPIRES IN{" "}
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
              </div>

              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                Choose Your{" "}
                <span className="text-[var(--color-govgreen)]">
                  Clearance Level
                </span>
              </h2>

              <p className="text-[oklch(0.6_0.01_250)] max-w-xl mx-auto text-lg leading-relaxed">
                Every tier includes the cheat sheet. Paid tiers unlock the AI
                Bid Writer — the fastest way to go from "interested" to
                "awarded."
              </p>
            </div>

            {/* Tier Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-12">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className={`bg-[oklch(0.11_0.01_250)] border p-6 flex flex-col relative ${
                    tier.highlight
                      ? "border-[var(--color-govgreen)] ring-1 ring-[var(--color-govgreen)]"
                      : "border-[oklch(0.2_0.02_250)]"
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-govgreen)] text-black font-mono text-[10px] font-bold px-3 py-1 tracking-wider">
                      {(tier as any).badge}
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-display font-bold text-lg text-white mb-1">
                      {tier.name}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground">
                      {tier.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display font-bold text-4xl text-white">
                      ${tier.price}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>

                  {tier.price > 0 && (
                    <p className="font-mono text-[10px] text-[var(--color-govamber)] mb-4">
                      Lock in this price — goes up after launch
                    </p>
                  )}
                  {tier.price === 0 && <div className="mb-4" />}

                  <div className="flex-1 mb-6">
                    <ul className="space-y-2.5">
                      {tier.features.map((f) => (
                        <li
                          key={f.text}
                          className="flex items-start gap-2 text-sm"
                        >
                          {f.included ? (
                            <Check
                              size={14}
                              className="text-[var(--color-govgreen)] mt-0.5 shrink-0"
                            />
                          ) : (
                            <X
                              size={14}
                              className="text-[oklch(0.3_0.01_250)] mt-0.5 shrink-0"
                            />
                          )}
                          <span
                            className={
                              f.included
                                ? "text-[oklch(0.75_0.01_250)]"
                                : "text-[oklch(0.35_0.01_250)]"
                            }
                          >
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (tier.price > 0) {
                        handleCheckout(tier.name.toLowerCase() as "operator" | "contractor" | "prime");
                      }
                    }}
                    disabled={tier.price === 0 || loadingTier === tier.name.toLowerCase()}
                    className={`inline-flex items-center justify-center gap-2 font-display font-bold px-6 py-3 text-sm transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed ${tier.ctaStyle}`}
                  >
                    {loadingTier === tier.name.toLowerCase() ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {tier.cta}
                        {tier.price > 0 && <ArrowRight size={14} />}
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Guarantee + Social Proof */}
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Lock size={14} />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Shield size={14} />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Zap size={14} />
                  <span>Instant access</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-[oklch(0.2_0.02_250)] border-2 border-background flex items-center justify-center"
                    >
                      <span className="text-xs text-muted-foreground font-mono">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  <span className="text-white font-semibold">1,247</span>{" "}
                  contractors already using GovCheat
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <section className="py-16 border-t border-[oklch(0.2_0.02_250)] bg-[oklch(0.07_0.01_250)]">
        <div className="container max-w-3xl">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-10">
            Common Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What exactly does the AI Bid Writer do?",
                a: "It reads the government solicitation (RFP/RFQ), extracts every requirement, and generates a compliant proposal draft — including technical approach, past performance narrative, and pricing structure. You review, customize, and submit. What used to take 40+ hours now takes under 2.",
              },
              {
                q: "Do I need experience to use GovCheat?",
                a: "No. The free Scout tier and cheat sheet are designed for complete beginners. The AI Bid Writer in paid tiers handles the complex proposal writing so you can compete even without prior government contracting experience.",
              },
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes. Change your plan at any time. Upgrades take effect immediately. Downgrades apply at the end of your current billing cycle. No penalties, no lock-in.",
              },
              {
                q: "What's the difference between Contractor and Prime?",
                a: "Contractor gives you unlimited AI bids and the full tool suite. Prime adds a dedicated human advisor, custom proposal reviews, competitor intelligence, and quarterly strategy sessions — it's for contractors serious about scaling past $1M in government revenue.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-[oklch(0.1_0.01_250)] border border-[oklch(0.2_0.02_250)] p-5"
              >
                <h3 className="font-display font-bold text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-[oklch(0.55_0.01_250)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
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
