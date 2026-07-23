import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Clock,
  DollarSign,
  Building2,
  Target,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BidAnalysisData {
  summary: string;
  winProbability: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
  howToWin: string[];
  estimatedEffort: "low" | "medium" | "high";
  recommendedAction: "pursue" | "consider" | "skip";
}

export default function ContractDetail() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [contractId, setContractId] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [analysis, setAnalysis] = useState<BidAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract contract ID from URL
  useEffect(() => {
    const match = location.match(/\/contract\/(.+)/);
    if (match) {
      setContractId(match[1]);
    }
  }, [location]);

  // Fetch contract details
  const { data: contractData, isLoading } = trpc.contracts.getById.useQuery(
    { id: contractId || "" },
    { enabled: !!contractId }
  );

  useEffect(() => {
    if (contractData) {
      setContract(contractData);
    }
  }, [contractData]);

  // Save/unsave contract
  const saveMutation = trpc.contracts.save.useMutation();
  const removeSavedMutation = trpc.contracts.removeSaved.useMutation();

  const handleSaveContract = async () => {
    if (!user) {
      toast.error("Please sign in to save contracts");
      return;
    }

    if (!contractId) return;

    try {
      if (isSaved) {
        await removeSavedMutation.mutateAsync({ contractId });
        setIsSaved(false);
        toast.success("Contract removed from saved");
      } else {
        await saveMutation.mutateAsync({ contractId });
        setIsSaved(true);
        toast.success("Contract saved!");
      }
    } catch (error) {
      toast.error("Failed to save contract");
    }
  };

  // Analyze bid
  const handleAnalyzeBid = async () => {
    if (!contract) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractTitle: contract.title,
          description: contract.simplifiedDescription || contract.description,
          agency: contract.agency,
          value: contract.value,
          difficulty: contract.difficulty,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      toast.error("Failed to analyze bid");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin text-green-400" size={48} />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button
            onClick={() => setLocation("/contracts")}
            variant="ghost"
            className="text-green-400 hover:text-green-300 mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Contracts
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Contract not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-green-500/20 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button
            onClick={() => setLocation("/contracts")}
            variant="ghost"
            className="text-green-400 hover:text-green-300 mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Contracts
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{contract.title}</h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Building2 size={16} />
                {contract.agency}
              </p>
            </div>
            <Button
              onClick={handleSaveContract}
              variant="ghost"
              size="lg"
              className="ml-4"
            >
              {isSaved ? (
                <BookmarkCheck className="text-green-400" size={28} />
              ) : (
                <Bookmark className="text-gray-400" size={28} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gray-900/50 border-green-500/20 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {contract.value && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <DollarSign size={14} />
                      Value
                    </p>
                    <p className="text-2xl font-bold text-green-400">
                      ${contract.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {contract.deadline && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <Clock size={14} />
                      Deadline
                    </p>
                    <p className="text-lg font-bold text-white">
                      {new Date(contract.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                    <Target size={14} />
                    Difficulty
                  </p>
                  <Badge className={getDifficultyColor(contract.difficulty || "moderate")}>
                    {contract.difficulty || "moderate"}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Type</p>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    {contract.simplifiedType || contract.contractType}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-gray-900/50 border-green-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">What They Need</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {contract.simplifiedDescription || contract.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {contract.setAside && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    {contract.setAside}
                  </Badge>
                )}
                {contract.category && (
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
                    {contract.category}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Bid Analysis Section */}
            {!analysis ? (
              <Button
                onClick={handleAnalyzeBid}
                disabled={isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-6 flex items-center justify-center gap-2 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing Your Bid Potential...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Get AI Bid Analysis & Win Probability
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-6">
                {/* Win Probability */}
                <Card className="bg-gray-900/50 border-green-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Your Win Probability</h3>
                    <div className={`text-4xl font-bold ${getWinProbabilityColor(analysis.winProbability)}`}>
                      {analysis.winProbability}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        analysis.winProbability >= 70
                          ? "bg-green-400"
                          : analysis.winProbability >= 50
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${analysis.winProbability}%` }}
                    />
                  </div>
                </Card>

                {/* Recommendation */}
                <Card className="bg-gray-900/50 border-green-500/20 p-6 flex items-center gap-4">
                  {getRecommendationIcon(analysis.recommendedAction)}
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">
                      {analysis.recommendedAction === "pursue"
                        ? "🎯 Strong Opportunity"
                        : analysis.recommendedAction === "consider"
                        ? "⚠️ Worth Considering"
                        : "❌ Low Priority"}
                    </h3>
                    <p className="text-gray-400">
                      Estimated effort: <span className="text-green-400 font-bold">{analysis.estimatedEffort}</span>
                    </p>
                  </div>
                </Card>

                {/* Your Advantages */}
                <Card className="bg-gray-900/50 border-green-500/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    Your Advantages
                  </h3>
                  <ul className="space-y-3">
                    {analysis.keyStrengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-3">
                        <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Challenges */}
                {analysis.keyWeaknesses.length > 0 && (
                  <Card className="bg-gray-900/50 border-red-500/20 p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-400" />
                      Challenges to Address
                    </h3>
                    <ul className="space-y-3">
                      {analysis.keyWeaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start gap-3">
                          <span className="text-red-400 mt-1 flex-shrink-0">⚠</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* How to Win */}
                <Card className="bg-gray-900/50 border-green-500/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-400" />
                    Step-by-Step Bidding Strategy
                  </h3>
                  <ol className="space-y-3">
                    {analysis.howToWin.map((step, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-3">
                        <span className="text-green-400 font-bold flex-shrink-0 bg-green-400/20 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>
            )}

            {/* View on SAM.gov */}
            <Button
              onClick={() => window.open(contract.url || `https://sam.gov/contract/${contract.samId}`, '_blank')}
              className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-6 flex items-center justify-center gap-2 text-lg"
            >
              <ExternalLink size={20} />
              View Full Contract on SAM.gov
            </Button>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contract Info Card */}
            <Card className="bg-gray-900/50 border-green-500/20 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Contract Info</h3>
              <div className="space-y-4 text-sm">
                {contract.samId && (
                  <div>
                    <p className="text-gray-400 mb-1">SAM.gov ID</p>
                    <p className="text-green-400 font-mono">{contract.samId}</p>
                  </div>
                )}
                {contract.naicsCode && (
                  <div>
                    <p className="text-gray-400 mb-1">NAICS Code</p>
                    <p className="text-white">{contract.naicsCode}</p>
                  </div>
                )}
                {contract.setAside && (
                  <div>
                    <p className="text-gray-400 mb-1">Set-Aside</p>
                    <p className="text-white">{contract.setAside}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-green-500/20">
                  <p className="text-gray-400 text-xs">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "moderate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "hard":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
}

function getWinProbabilityColor(probability: number) {
  if (probability >= 70) return "text-green-400";
  if (probability >= 50) return "text-yellow-400";
  return "text-red-400";
}

function getRecommendationIcon(action: string) {
  switch (action) {
    case "pursue":
      return <CheckCircle2 className="text-green-400" size={32} />;
    case "consider":
      return <AlertCircle className="text-yellow-400" size={32} />;
    default:
      return <AlertCircle className="text-red-400" size={32} />;
  }
}
