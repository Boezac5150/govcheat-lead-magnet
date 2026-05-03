import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  TrendingUp,
  Target,
  Zap,
  FileText,
  AlertCircle,
  ChevronRight,
  Award,
  Clock,
  DollarSign,
} from "lucide-react";

export default function AuthenticatedHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#00FF88] border-t-transparent rounded-full"></div>
          <p className="text-gray-400 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0A0E17] to-[#1a1f2e] border-b border-[#00FF88]/20 py-12">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-[#00FF88]">{user?.name || "Contractor"}</span>
              </h1>
              <p className="text-gray-400">Your government contract dashboard is ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Bids</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <Target className="w-8 h-8 text-[#00FF88]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Contracts Won</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <Award className="w-8 h-8 text-[#00FF88]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-3xl font-bold text-white mt-2">$0</p>
                </div>
                <DollarSign className="w-8 h-8 text-[#00FF88]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Alerts Active</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <AlertCircle className="w-8 h-8 text-[#00FF88]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Browse Contracts */}
          <Card className="border-[#00FF88]/30 bg-gradient-to-br from-[#0A0E17] to-[#1a1f2e] hover:border-[#00FF88]/50 transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-[#00FF88]" />
                Browse Live Contracts
              </CardTitle>
              <CardDescription>Find government opportunities that match your business</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                25+ live contracts updated daily from SAM.gov. Search, filter, and get AI analysis on each opportunity.
              </p>
              <Link href="/contracts">
                <Button className="bg-[#00FF88] text-[#0A0E17] hover:bg-[#00FF88]/90 w-full">
                  View Contracts <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* MyGovCheat Dashboard */}
          <Card className="border-[#00FF88]/30 bg-gradient-to-br from-[#0A0E17] to-[#1a1f2e] hover:border-[#00FF88]/50 transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-[#00FF88]" />
                MyGovCheat Dashboard
              </CardTitle>
              <CardDescription>Track all your bids and wins in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                See active bids, won contracts, bid status, and total contract value. Manage everything from one dashboard.
              </p>
              <Link href="/my-govcheat">
                <Button className="bg-[#00FF88] text-[#0A0E17] hover:bg-[#00FF88]/90 w-full">
                  Open Dashboard <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {/* Set Alerts */}
          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <AlertCircle className="w-5 h-5 text-[#00FF88]" />
                Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Get notified when new contracts match your criteria.
              </p>
              <Link href="/alerts">
                <Button variant="outline" className="w-full border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10">
                  Set Alerts
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-[#00FF88]" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Step-by-step guide to winning government contracts.
              </p>
              <Link href="/how-to">
                <Button variant="outline" className="w-full border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10">
                  Learn More
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Leads Portal */}
          <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-[#00FF88]" />
                Leads Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Share your business with potential partners.
              </p>
              <a href="https://leads.govcheat.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10">
                  Visit Portal
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips */}
        <Card className="border-[#00FF88]/20 bg-[#0A0E17]/50">
          <CardHeader>
            <CardTitle className="text-white">Getting Started</CardTitle>
            <CardDescription>Quick tips to start winning contracts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FF88]/20 flex items-center justify-center text-[#00FF88] font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-white">Browse Contracts</p>
                <p className="text-sm text-gray-400">Start with contracts under $50K and "easy" difficulty</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FF88]/20 flex items-center justify-center text-[#00FF88] font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-white">Get AI Analysis</p>
                <p className="text-sm text-gray-400">Click "Show Bid Summary" to see your win probability</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FF88]/20 flex items-center justify-center text-[#00FF88] font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-white">Place Your Bid</p>
                <p className="text-sm text-gray-400">Track it in MyGovCheat and follow the AI's strategy</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FF88]/20 flex items-center justify-center text-[#00FF88] font-bold">
                4
              </div>
              <div>
                <p className="font-semibold text-white">Set Alerts</p>
                <p className="text-sm text-gray-400">Get notified when new contracts match your criteria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
