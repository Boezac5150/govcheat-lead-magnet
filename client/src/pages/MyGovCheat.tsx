import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, Award, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export function MyGovCheat() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("active");

  // Fetch user's bids
  const { data: bids = [], isLoading: bidsLoading } = trpc.bids.list.useQuery({
    status: selectedTab as any,
  });

  // Fetch bid statistics
  const { data: stats } = trpc.bids.getStats.useQuery();

  // Fetch saved contracts
  const { data: savedContracts = [] } = trpc.contracts.getSaved.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-400";
      case "won":
        return "bg-green-500/20 text-green-400";
      case "lost":
        return "bg-red-500/20 text-red-400";
      case "working_on":
        return "bg-yellow-500/20 text-yellow-400";
      case "submitted":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please sign in to view your bids.</p>
          <Link href="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/contracts">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-green-400 mb-2">MyGovCheat Dashboard</h1>
          <p className="text-gray-400">Track your bids, wins, and government contract opportunities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bids</p>
                <p className="text-2xl font-bold text-green-400">{stats?.totalBids || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Won</p>
                <p className="text-2xl font-bold text-green-400">{stats?.wonBids || 0}</p>
              </div>
              <Award className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats?.activeBids || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-card border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Won Value</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(stats?.totalWonValue || 0).toLocaleString()}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-card border-green-500/30">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-background/50 border-b border-green-500/20">
              <TabsTrigger value="active" className="data-[state=active]:text-green-400">
                Active ({stats?.activeBids || 0})
              </TabsTrigger>
              <TabsTrigger value="working_on" className="data-[state=active]:text-green-400">
                Working ({stats?.workingOn || 0})
              </TabsTrigger>
              <TabsTrigger value="submitted" className="data-[state=active]:text-green-400">
                Submitted
              </TabsTrigger>
              <TabsTrigger value="won" className="data-[state=active]:text-green-400">
                Won ({stats?.wonBids || 0})
              </TabsTrigger>
              <TabsTrigger value="lost" className="data-[state=active]:text-green-400">
                Lost ({stats?.lostBids || 0})
              </TabsTrigger>
            </TabsList>

            {/* Bids List */}
            <div className="p-6">
              {bidsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading bids...</div>
              ) : bids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No bids in this category yet.</p>
                  <Link href="/contracts">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Contracts
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid: any) => (
                    <div
                      key={bid.id}
                      className="border border-green-500/20 rounded-lg p-4 hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{bid.contractTitle}</h3>
                          <p className="text-sm text-gray-400">Contract ID: {bid.contractId}</p>
                        </div>
                        <Badge className={getStatusColor(bid.bidStatus)}>
                          {getStatusLabel(bid.bidStatus)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-400">Bid Amount</p>
                          <p className="text-green-400 font-semibold">
                            ${(bid.bidAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Contract Value</p>
                          <p className="text-green-400 font-semibold">
                            ${(bid.contractValue || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Deadline</p>
                          <p className="text-green-400 font-semibold">
                            {bid.deadline ? new Date(bid.deadline).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>

                      {bid.bidNotes && (
                        <div className="mb-3 p-2 bg-background/50 rounded border border-green-500/10">
                          <p className="text-sm text-gray-300">{bid.bidNotes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/contract/${bid.contractId}`}>
                          <Button size="sm" variant="outline">
                            View Contract
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </Card>

        {/* Saved Contracts Section */}
        {savedContracts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Saved Contracts ({savedContracts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedContracts.map((contract: any) => (
                <Card key={contract.id} className="bg-card border-green-500/30 p-4">
                  <h3 className="font-semibold text-white mb-2">{contract.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{contract.agency}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-semibold">${(contract.value || 0).toLocaleString()}</span>
                    <Link href={`/contract/${contract.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        View
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
