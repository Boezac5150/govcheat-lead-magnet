import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, Bookmark, BookmarkCheck, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ContractFilters {
  category?: string;
  minValue?: number;
  maxValue?: number;
}

export default function Contracts() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ContractFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  // Fetch saved contracts
  const { data: savedContracts = [] } = trpc.contracts.getSaved.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Track saved IDs
  useEffect(() => {
    setSavedIds(new Set(savedContracts.map((c: any) => c.id.toString())));
  }, [savedContracts]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search term");
      return;
    }
    setIsSearching(true);
    try {
      // Search using the contracts list with a filter
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

  const isLocked = (minTier: string) => {
    if (!user) return false;
    const tierHierarchy = { user: 0, admin: 3 };
    const userTier = tierHierarchy[user.role as keyof typeof tierHierarchy] || 0;
    const requiredTier = minTier === "prime" ? 3 : minTier === "contractor" ? 2 : minTier === "operator" ? 1 : 0;
    return userTier < requiredTier;
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-green-400" size={20} />
              <Input
                placeholder="Search contracts by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-background/50 border-green-500/30 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-green-500 hover:bg-green-600 text-black font-bold"
            >
              {isSearching ? <Loader2 className="animate-spin" /> : "Search"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <Filter size={20} />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-background/30 border border-green-500/20 rounded-lg">
              <div>
                <label className="text-sm text-gray-400">Category</label>
                <Input
                  placeholder="e.g., IT, Construction"
                  value={filters.category || ""}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="mt-1 bg-background/50 border-green-500/30"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Min Value ($)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minValue || ""}
                  onChange={(e) => setFilters({ ...filters, minValue: parseInt(e.target.value) || 0 })}
                  className="mt-1 bg-background/50 border-green-500/30"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Max Value ($)</label>
                <Input
                  type="number"
                  placeholder="999999"
                  value={filters.maxValue || ""}
                  onChange={(e) => setFilters({ ...filters, maxValue: parseInt(e.target.value) || 0 })}
                  className="mt-1 bg-background/50 border-green-500/30"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {contractsLoading || isSearching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-400" size={48} />
          </div>
        ) : displayContracts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No contracts found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayContracts.map((contract: any) => {
              const isLocked_ = isLocked(contract.minTierRequired);
              const isSaved = savedIds.has(contract.id.toString());

              return (
                <Card
                  key={contract.id}
                  className="bg-background/40 border-green-500/20 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20 relative overflow-hidden group"
                >
                  {/* Locked Overlay */}
                  {isLocked_ && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="text-center">
                        <Lock className="mx-auto mb-2 text-yellow-400" size={32} />
                        <p className="text-white font-bold">Upgrade to {contract.minTierRequired}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-400">{contract.agency}</p>
                      </div>
                      <button
                        onClick={() =>
                          isSaved
                            ? handleRemoveSaved(contract.id.toString())
                            : handleSaveContract(contract.id.toString())
                        }
                        className="ml-2 p-2 hover:bg-green-500/20 rounded transition-colors"
                        disabled={isLocked_}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="text-green-400" size={20} />
                        ) : (
                          <Bookmark className="text-gray-400 hover:text-green-400" size={20} />
                        )}
                      </button>
                    </div>

                    {/* Simplified Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {contract.simplifiedDescription}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className={`${getDifficultyColor(contract.difficulty)} border`}
                      >
                        {contract.difficulty}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50 border">
                        {contract.simplifiedType}
                      </Badge>
                      {contract.setAside && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 border">
                          {contract.setAside}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      {contract.value && (
                        <div>
                          <p className="text-gray-500">Value</p>
                          <p className="text-green-400 font-bold">
                            ${(contract.value / 1000).toFixed(0)}K
                          </p>
                        </div>
                      )}
                      {contract.deadline && (
                        <div>
                          <p className="text-gray-500">Deadline</p>
                          <p className="text-white font-bold">
                            {new Date(contract.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                        disabled={isLocked_}
                      >
                        View Details
                      </Button>
                      {user && user.role === "admin" && (
                        <Button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold">
                          Write Bid
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
