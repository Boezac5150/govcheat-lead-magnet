import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Search,
  Filter,
  TrendingUp,
  FileText,
  Zap,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Users,
  Target,
  Clock,
  DollarSign,
} from "lucide-react";
import { useLocation } from "wouter";

export default function HowToUse() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0A0E17] to-[#1a1f2e] border-b border-[#00FF88]/20 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#00FF88] mb-4">How to Use GovCheat</h1>
          <p className="text-lg text-gray-300">
            Your step-by-step guide to finding, analyzing, and winning government contracts.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Quick Start */}
        <section>
          <h2 className="text-3xl font-bold text-[#00FF88] mb-6 flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Quick Start (5 Minutes)
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: 1, title: "Sign Up", desc: "Create your free GovCheat account" },
              { step: 2, title: "Browse Contracts", desc: "See live government opportunities" },
              { step: 3, title: "Get AI Analysis", desc: "See win probability & bid strategy" },
            ].map((item) => (
              <Card key={item.step} className="border-[#00FF88]/20 bg-[#1a1f2e]">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00FF88] text-[#0A0E17] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed Walkthrough */}
        <section>
          <h2 className="text-3xl font-bold text-[#00FF88] mb-6 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Detailed Walkthrough
          </h2>

          {/* Step 1: Finding Contracts */}
          <Card className="border-[#00FF88]/20 bg-[#1a1f2e] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-[#00FF88]" />
                Step 1: Finding Contracts That Match You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                When you log in, you'll see the <strong>Contracts page</strong> with a live list of government opportunities.
              </p>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300">
                  <strong className="text-[#00FF88]">What you see:</strong>
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Contract Title:</strong> What the government is buying (e.g., "Software Development")</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Value:</strong> How much the contract is worth ($50K to $5M+)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Deadline:</strong> When bids are due (10-120 days away)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Difficulty:</strong> Easy, Medium, or Hard (based on competition)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Set-Aside:</strong> Reserved for small business, 8(a), HUBZone, etc.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Filtering & Searching */}
          <Card className="border-[#00FF88]/20 bg-[#1a1f2e] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Filter className="w-6 h-6 text-[#00FF88]" />
                Step 2: Filter to Find Your Perfect Fit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Don't want to scroll through all contracts? Use the <strong>Filters & Sort</strong> button to narrow down.
              </p>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300 font-bold text-[#00FF88]">Filter by:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Contract Type:</strong> Software, Consulting, Construction, Supplies, etc.</li>
                  <li>• <strong>Value Range:</strong> Set min/max budget (e.g., $100K-$500K)</li>
                  <li>• <strong>Difficulty:</strong> Easy (beginner-friendly) to Hard (competitive)</li>
                  <li>• <strong>Agency:</strong> DoD, GSA, VA, Commerce, HHS, etc.</li>
                  <li>• <strong>Set-Aside:</strong> Small Business, 8(a), HUBZone, WOSB, VOSB</li>
                </ul>
              </div>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300 font-bold text-[#00FF88]">Sort by:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Newest First:</strong> Latest opportunities posted</li>
                  <li>• <strong>Value (Low to High):</strong> Smaller contracts first</li>
                  <li>• <strong>Value (High to Low):</strong> Bigger contracts first</li>
                  <li>• <strong>Deadline (Soonest):</strong> Bids due soon</li>
                  <li>• <strong>Difficulty (Easiest):</strong> Beginner-friendly first</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: AI Bid Analysis */}
          <Card className="border-[#00FF88]/20 bg-[#1a1f2e] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#00FF88]" />
                Step 3: Get AI-Powered Bid Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Found a contract that interests you? Click <strong>"Show Bid Summary"</strong> to see AI analysis.
              </p>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300 font-bold text-[#00FF88]">You'll see:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Win Probability:</strong> Your realistic chance of winning (0-100%)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Key Strengths:</strong> Why you're positioned to win</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Key Weaknesses:</strong> Challenges you might face</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>How to Win:</strong> Step-by-step bidding strategy</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                    <span><strong>Recommendation:</strong> Pursue, Consider, or Skip</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: View Full Details */}
          <Card className="border-[#00FF88]/20 bg-[#1a1f2e] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#00FF88]" />
                Step 4: View Full Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Want the complete picture? Click <strong>"View Contract"</strong> to see the full contract details page.
              </p>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300 font-bold text-[#00FF88]">On the detail page:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Full contract specifications and requirements</li>
                  <li>• Plain-English translation of government jargon</li>
                  <li>• AI bid analysis and win probability</li>
                  <li>• Step-by-step "how to win" guidance</li>
                  <li>• Link to the official contract on SAM.gov</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Track Your Bids */}
          <Card className="border-[#00FF88]/20 bg-[#1a1f2e] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-6 h-8 text-[#00FF88]" />
                Step 5: Track Your Bids in MyGovCheat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Once you start bidding, go to <strong>MyGovCheat Dashboard</strong> to track everything.
              </p>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300 font-bold text-[#00FF88]">Track:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Active Bids:</strong> Contracts you're currently bidding on</li>
                  <li>• <strong>Won Contracts:</strong> Bids you've successfully won</li>
                  <li>• <strong>Working On:</strong> Contracts in proposal stage</li>
                  <li>• <strong>Statistics:</strong> Total bids, win rate, total value won</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 6: Set Up Alerts */}
          <Card className="border-[#00FF88]/20 bg-[#1a1f2e] mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-[#00FF88]" />
                Step 6: Get Alerts for New Contracts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Don't want to check manually? Set up <strong>Email Alerts</strong> to get notified when new contracts match your criteria.
              </p>
              <div className="bg-[#0A0E17] p-4 rounded border border-[#00FF88]/10 space-y-3">
                <p className="text-sm text-gray-300 font-bold text-[#00FF88]">Create alerts for:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Contract type (Software, Consulting, etc.)</li>
                  <li>• Value range ($50K-$500K, etc.)</li>
                  <li>• Difficulty level (Easy, Medium, Hard)</li>
                  <li>• Government agency</li>
                  <li>• Set-aside type (Small Business, 8(a), etc.)</li>
                </ul>
              </div>
              <p className="text-sm text-gray-400">
                Go to <strong>Alerts</strong> in the menu to set up your preferences. You'll get emails when new contracts match your saved searches.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Concepts */}
        <section>
          <h2 className="text-3xl font-bold text-[#00FF88] mb-6 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Key Concepts Explained
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "What is a Government Contract?",
                desc: "An agreement where the federal government buys goods or services from private companies. You bid to win the contract, then deliver what you promised.",
              },
              {
                title: "What Does 'Set-Aside' Mean?",
                desc: "Contracts reserved for specific business types: Small Business (fewer than 500 employees), 8(a) Program (disadvantaged businesses), HUBZone (economically distressed areas), WOSB (women-owned), VOSB (veteran-owned).",
              },
              {
                title: "What is SAM.gov?",
                desc: "The official System for Award Management. All federal contracts are posted there. GovCheat pulls real data from SAM.gov and makes it easier to understand.",
              },
              {
                title: "What is Win Probability?",
                desc: "Our AI analyzes the contract requirements and your business profile to estimate your realistic chance of winning (0-100%). Higher = better positioned.",
              },
              {
                title: "What Does 'Difficulty' Mean?",
                desc: "Easy = fewer competitors, beginner-friendly. Medium = moderate competition. Hard = highly competitive, requires experience.",
              },
              {
                title: "How Do I Actually Bid?",
                desc: "Click 'View Contract' to go to SAM.gov, then follow their bidding process. GovCheat gives you the strategy; SAM.gov is where you submit.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-[#00FF88]/20 bg-[#1a1f2e]">
                <CardHeader>
                  <CardTitle className="text-base text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pro Tips */}
        <section>
          <h2 className="text-3xl font-bold text-[#00FF88] mb-6 flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Pro Tips to Win More Contracts
          </h2>

          <div className="space-y-4">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Start Early",
                desc: "Don't wait until the deadline. Read the contract early, ask questions, and give yourself time to prepare a strong bid.",
              },
              {
                icon: <DollarSign className="w-6 h-6" />,
                title: "Price Competitively",
                desc: "Review similar contracts to understand pricing. Too high = you lose. Too low = you lose money. Find the sweet spot.",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Follow Instructions Exactly",
                desc: "Government buyers reject bids that don't follow their format. Read the requirements twice. Then read them again.",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Show Past Performance",
                desc: "Include examples of similar work you've done. Government buyers want proof you can deliver.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Partner with Others",
                desc: "Team up with other small businesses to bid on larger contracts. Joint ventures increase your winning chances.",
              },
              {
                icon: <AlertCircle className="w-6 h-6" />,
                title: "Use GovCheat's AI Analysis",
                desc: "Our 'How to Win' guidance is based on contract analysis. Follow it to position yourself better than competitors.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-[#00FF88]/20 bg-[#1a1f2e]">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="text-[#00FF88] flex-shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-300">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#00FF88]/10 to-[#00FF88]/5 border border-[#00FF88]/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Winning Contracts?</h2>
          <p className="text-gray-300 mb-6">
            Go to the Contracts page and start exploring opportunities. Use filters to find your perfect fit, get AI analysis, and start bidding.
          </p>
          {user ? (
            <Button
              onClick={() => setLocation("/contracts")}
              className="bg-[#00FF88] text-[#0A0E17] hover:bg-[#00FF88]/90 font-bold"
            >
              Browse Contracts <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setLocation("/")}
              className="bg-[#00FF88] text-[#0A0E17] hover:bg-[#00FF88]/90 font-bold"
            >
              Sign Up Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
