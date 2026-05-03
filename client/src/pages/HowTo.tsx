import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ChevronRight, Search, FileText, Target, Trophy, Users, Zap } from "lucide-react";

export default function HowTo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0A0E17] to-[#1a1f2e] border-b border-[#00FF88]/20 py-16">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How to Use <span className="text-[#00FF88]">GovCheat</span>
          </h1>
          <p className="text-lg text-gray-300">
            Your simple alternative to SAM.gov. Find government contracts, bid smarter, win faster.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-16">
        {/* Step 1: Sign Up */}
        <Card className="mb-8 border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF88] text-[#0A0E17] font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white">Sign Up (2 minutes)</CardTitle>
                <CardDescription className="text-gray-400">Create your free GovCheat account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Click "Get Free Cheat Sheet" on the home page. Enter your email. You'll get a confirmation email with your login link.
            </p>
            <div className="bg-[#1a1f2e] p-4 rounded border border-[#00FF88]/10">
              <p className="text-sm text-gray-400">
                <strong>💡 Pro Tip:</strong> Use your business email so you can share your MyGovCheat dashboard with your team.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Browse Contracts */}
        <Card className="mb-8 border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF88] text-[#0A0E17] font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white">Browse Live Contracts</CardTitle>
                <CardDescription className="text-gray-400">Find opportunities that match your business</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Go to the <strong>Contracts</strong> page. You'll see 25+ live government opportunities updated daily from SAM.gov.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Search className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">Search by keyword</p>
                  <p className="text-sm text-gray-400">Type "software", "construction", "consulting" to filter contracts</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">See plain-English descriptions</p>
                  <p className="text-sm text-gray-400">No government jargon. Just what the contract is actually about.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">Check difficulty & value</p>
                  <p className="text-sm text-gray-400">See contract size, deadline, and how hard it is to win</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Get AI Analysis */}
        <Card className="mb-8 border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF88] text-[#0A0E17] font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white">Get AI Bid Analysis</CardTitle>
                <CardDescription className="text-gray-400">Understand your chances before you bid</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Click "Show Bid Summary" on any contract. Our AI analyzes it and tells you:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Win Probability:</strong> Your realistic chances (0-100%)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Your Strengths:</strong> Why you can win this contract</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Challenges:</strong> What might hold you back</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>How to Win:</strong> Step-by-step bidding strategy</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 4: Track Your Bids */}
        <Card className="mb-8 border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF88] text-[#0A0E17] font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white">Track Your Bids</CardTitle>
                <CardDescription className="text-gray-400">See everything you're bidding on in one place</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Go to <strong>MyGovCheat</strong> (your personal dashboard). You'll see:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Active Bids:</strong> Contracts you're currently bidding on</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Won Contracts:</strong> Deals you've already won</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Bid Status:</strong> Track where each bid stands</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span><strong>Total Value:</strong> How much you're bidding on right now</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 5: Set Alerts */}
        <Card className="mb-8 border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#00FF88] text-[#0A0E17] font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white">Set Up Alerts (Optional)</CardTitle>
                <CardDescription className="text-gray-400">Get notified when new contracts match your criteria</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Go to <strong>Alert Preferences</strong>. Create alerts for:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span>Contract type (software, construction, consulting, etc.)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span>Contract value ($10K-$100K, $100K-$500K, etc.)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00FF88]">✓</span>
                <span>Set-asides (Small Business, 8(a), HUBZone, etc.)</span>
              </li>
            </ul>
            <div className="bg-[#1a1f2e] p-4 rounded border border-[#00FF88]/10">
              <p className="text-sm text-gray-400">
                <strong>💡 Pro Tip:</strong> Set alerts for contracts under $50K and with "easy" difficulty. These are fastest to win.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-6 my-12">
          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-[#00FF88]" />
                Plain English Descriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              No more decoding government jargon. We translate every contract into simple language you can understand in 30 seconds.
            </CardContent>
          </Card>

          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-[#00FF88]" />
                AI-Powered Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              Our AI analyzes each contract and gives you honest win probability and bidding strategy. No guessing.
            </CardContent>
          </Card>

          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-[#00FF88]" />
                Real-Time Data
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              Contracts update daily from SAM.gov. You're always seeing the latest opportunities before your competitors.
            </CardContent>
          </Card>

          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5 text-[#00FF88]" />
                Track Your Wins
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              MyGovCheat dashboard shows everything you're bidding on, your win rate, and total contract value.
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-[#1a1f2e] border border-[#00FF88]/20 rounded-lg p-8 my-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[#00FF88] mb-2">Q: Is GovCheat free?</h3>
              <p className="text-gray-300">
                Yes. The free tier gives you access to all contracts, search, and AI analysis. Premium tiers unlock advanced features like unlimited alerts and competitor tracking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#00FF88] mb-2">Q: How often are contracts updated?</h3>
              <p className="text-gray-300">
                Daily. We sync live data from SAM.gov every morning at 2 AM UTC. You'll always see the newest opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#00FF88] mb-2">Q: Can I share my account with my team?</h3>
              <p className="text-gray-300">
                Yes. Use your business email when you sign up. You can then invite team members to view your MyGovCheat dashboard and bid tracking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#00FF88] mb-2">Q: What if I find a contract I like but need help?</h3>
              <p className="text-gray-300">
                Click "Show Bid Summary" to get our AI analysis. It tells you win probability, your advantages, challenges, and step-by-step bidding strategy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#00FF88] mb-2">Q: How is GovCheat different from SAM.gov?</h3>
              <p className="text-gray-300">
                <strong>SAM.gov:</strong> Official government site. Lots of jargon, hard to navigate, no analysis. <br/>
                <strong>GovCheat:</strong> Simple interface, plain English, AI analysis, bid tracking, alerts. We make government contracting actually easy.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#00FF88]/5 border border-[#00FF88]/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Winning Government Contracts?</h2>
          <p className="text-gray-300 mb-6">
            Your first contract is waiting. GovCheat makes it simple.
          </p>
          <Link href="/contracts">
            <Button className="bg-[#00FF88] text-[#0A0E17] hover:bg-[#00FF88]/90 font-bold">
              View Live Contracts <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
