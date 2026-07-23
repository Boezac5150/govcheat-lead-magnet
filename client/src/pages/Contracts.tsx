import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ContractFilters {
  category?: string;
  minValue?: number;
  maxValue?: number;
}

interface BidAnalysisData {
  summary: string;
  winProbability: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
  howToWin: string[];
  estimatedEffort: "low" | "medium" | "high";
  recommendedAction: "pursue" | "consider" | "skip";
}

export default function Contracts() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ContractFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);
  const [bidAnalyses, setBidAnalyses] = useState<Record<string, BidAnalysisData>>({});
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);

  // Fetch contracts list
  const { data: contracts = [], isLoading: contractsLoading } = trpc.contracts.list.useQuery(
    { ...filters, limit: 50 },
    { enabled: !authLoading }
  );

  // Search contracts
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Save/unsave contract
  const saveMutation = trpc.contracts.save.useMutation();
  const removeSavedMutation = trpc.contracts.removeSaved.useMutation();

  // Bid analysis - we'll call it directly in handleAnalyzeBid

  // Fetch saved contracts
  const { data: savedContracts = [] } = trpc.contracts.getSaved.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Track saved IDs
  useEffect(() => {
    setSavedIds(new Set(savedContracts.map((c: any) => c.id?.toString() || c.samId?.toString())));
  }, [savedContracts]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search term");
      return;
    }
    setIsSearching(true);
    try {
      const filtered = contracts.filter(
        (c: any) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.simplifiedDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      if (filtered.length === 0) {
        toast.info("No contracts found matching your search");
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveContract = async (contractId: string) => {
    if (!user) {
      toast.error("Sign in to save contracts");
      return;
    }

    try {
      await saveMutation.mutateAsync({ contractId });
      setSavedIds((prev) => new Set(prev).add(contractId));
      toast.success("Contract saved!");
    } catch (error) {
      toast.error("Failed to save contract");
    }
  };

  const handleRemoveSaved = async (contractId: string) => {
    try {
      await removeSavedMutation.mutateAsync({ contractId });
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(contractId);
        return next;
      });
      toast.success("Contract removed");
    } catch (error) {
      toast.error("Failed to remove contract");
    }
  };

    const bidAnalysisMutation = trpc.bidAnalysis.analyze.useMutation();

    const handleAnalyzeBid = async (contract: any) => {
    const contractId = contract.id?.toString() || contract.samId;
    
    if (bidAnalyses[contractId]) {
      setExpandedBidId(expandedBidId === contractId ? null : contractId);
      return;
    }

    setLoadingBidId(contractId);
    try {
      const analysis = await bidAnalysisMutation.mutateAsync({
        title: contract.title,
        description: contract.description || contract.simplifiedDescription,
        agency: contract.agency,
        contractType: contract.contractType || contract.simplifiedType,
        value: contract.value,
        deadline: contract.deadline?.toISOString?.() || contract.deadline,
        setAside: contract.setAside,
      });

      if (analysis) {
        setBidAnalyses((prev) => ({
          ...prev,
          [contractId]: analysis,
        }));
        setExpandedBidId(contractId);
      }
    } catch (error) {
      console.error("Bid analysis error:", error);
      toast.error("Failed to analyze bid");
    } finally {
      setLoadingBidId(null);
    }
  };

  const displayContracts = searchResults.length > 0 ? searchResults : contracts;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-400";
    if (probability >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getRecommendationIcon = (action: string) => {
    switch (action) {
      case "pursue":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "consider":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "skip":
        return <Lock className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-green-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-green-500/20 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Live <span className="text-green-400">Contracts</span>
              </h1>
              <p className="text-gray-400">
                {displayContracts.length} opportunities available
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tier: {user?.role || "scout"}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-gray-900/50 border-green-500/30 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-green-600 hover:bg-green-700 text-black"
            >
              {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-green-500/30 text-green-400"
            >
              <Filter size={18} />
            </Button>
            <Button
              onClick={() => window.open('https://leads.govcheat.com', '_blank')}
              variant="outline"
              className="border-green-500/30 text-green-400 whitespace-nowrap"
              title="Go to Leads Portal"
            >
              Leads Portal
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900/30 rounded-lg border border-green-500/20">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Min Value</label>
                <Input
                  type="number"
                  placeholder="$0"
                  onChange={(e) =>
                    setFilters({ ...filters, minValue: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="bg-gray-900/50 border-green-500/30"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Max Value</label>
                <Input
                  type="number"
                  placeholder="$1,000,000"
                  onChange={(e) =>
                    setFilters({ ...filters, maxValue: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="bg-gray-900/50 border-green-500/30"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Category</label>
                <Input
                  placeholder="All categories"
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value || undefined })
                  }
                  className="bg-gray-900/50 border-green-500/30"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contracts List */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {contractsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-green-400" size={48} />
          </div>
        ) : displayContracts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No contracts found. Try a different search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayContracts.map((contract: any) => {
              const contractId = contract.id?.toString() || contract.samId;
              const isSaved = savedIds.has(contractId);
              const analysis = bidAnalyses[contractId];
              const isExpanded = expandedBidId === contractId;
              const isLoading = loadingBidId === contractId;

              return (
                <Card
                  key={contractId}
                  className="bg-gray-900/50 border-green-500/20 hover:border-green-500/50 transition-all overflow-hidden"
                >
                  {/* Main Contract Card */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{contract.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{contract.agency}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={getDifficultyColor(contract.difficulty || "moderate")}>
                            {contract.difficulty || "moderate"}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                            {contract.simplifiedType || contract.contractType}
                          </Badge>
                          {contract.value && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                              ${contract.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          isSaved ? handleRemoveSaved(contractId) : handleSaveContract(contractId)
                        }
                        variant="ghost"
                        size="sm"
                        className="ml-4"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="text-green-400" size={24} />
                        ) : (
                          <Bookmark className="text-gray-400" size={24} />
                        )}
                      </Button>
                    </div>

                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {contract.simplifiedDescription || contract.description}
                    </p>

                    {contract.deadline && (
                      <p className="text-sm text-gray-500 mb-4">
                        Deadline:{" "}
                        {new Date(contract.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAnalyzeBid(contract)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-black font-bold py-2 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap size={18} />
                            {isExpanded ? "Hide" : "Show"} Bid Summary
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setLocation(`/contract/${contractId}`)}
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                        title="View full contract details and AI analysis"
                      >
                        <ExternalLink size={18} />
                        View Contract
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Bid Analysis Section */}
                  {isExpanded && analysis && (
                    <div className="border-t border-green-500/20 bg-gray-800/30 p-6 space-y-6">
                      {/* Win Probability */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-white">Win Probability</h4>
                          <div className={`text-3xl font-bold ${getWinProbabilityColor(analysis.winProbability)}`}>
                            {analysis.winProbability}%
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              analysis.winProbability >= 70
                                ? "bg-green-400"
                                : analysis.winProbability >= 50
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${analysis.winProbability}%` }}
                          />
                        </div>
                      </div>

                      {/* Bid Summary */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
                        <h4 className="text-lg font-bold text-white mb-3">What They Need</h4>
                        <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20 flex items-center gap-3">
                        {getRecommendationIcon(analysis.recommendedAction)}
                        <div>
                          <h4 className="text-lg font-bold text-white capitalize">
                            {analysis.recommendedAction === "pursue"
                              ? "Strong Opportunity"
                              : analysis.recommendedAction === "consider"
                              ? "Worth Considering"
                              : "Low Priority"}
                          </h4>
                          <p className="text-sm text-gray-400">
                            Estimated effort: <span className="text-green-400">{analysis.estimatedEffort}</span>
                          </p>
                        </div>
                      </div>

                      {/* Key Strengths */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <TrendingUp size={18} className="text-green-400" />
                          Your Advantages
                        </h4>
                        <ul className="space-y-2">
                          {analysis.keyStrengths.map((strength, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Key Weaknesses */}
                      {analysis.keyWeaknesses.length > 0 && (
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/20">
                          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <AlertCircle size={18} className="text-yellow-400" />
                            Challenges to Address
                          </h4>
                          <ul className="space-y-2">
                            {analysis.keyWeaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-gray-300 flex items-start gap-2">
                                <span className="text-yellow-400 mt-1">!</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* How to Win */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-blue-500/20">
                        <h4 className="text-lg font-bold text-white mb-3">How to Win</h4>
                        <ol className="space-y-2">
                          {analysis.howToWin.map((step, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start gap-3">
                              <span className="text-blue-400 font-bold">{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
