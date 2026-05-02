import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Bell,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function AlertPreferences() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    searchKeywords: "",
    minValue: "",
    maxValue: "",
    difficulty: "",
    category: "",
    setAside: "",
    emailFrequency: "daily" as "daily" | "weekly" | "instantly",
  });

  // Fetch user's alerts
  const { data: alerts = [], isLoading, refetch } = trpc.alerts.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Create alert
  const createMutation = trpc.alerts.create.useMutation();
  const updateMutation = trpc.alerts.update.useMutation();
  const deleteMutation = trpc.alerts.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Alert name required");
      return;
    }

    if (!formData.searchKeywords.trim()) {
      toast.error("At least one keyword required");
      return;
    }

    try {
      const keywords = formData.searchKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          searchKeywords: keywords,
          minValue: formData.minValue ? parseInt(formData.minValue) : undefined,
          maxValue: formData.maxValue ? parseInt(formData.maxValue) : undefined,
          difficulty: formData.difficulty as any,
          category: formData.category || undefined,
          setAside: formData.setAside || undefined,
          emailFrequency: formData.emailFrequency,
        });
        toast.success("Alert updated!");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          searchKeywords: keywords,
          minValue: formData.minValue ? parseInt(formData.minValue) : undefined,
          maxValue: formData.maxValue ? parseInt(formData.maxValue) : undefined,
          difficulty: formData.difficulty as any,
          category: formData.category || undefined,
          setAside: formData.setAside || undefined,
          emailFrequency: formData.emailFrequency,
        });
        toast.success("Alert created!");
      }

      setFormData({
        name: "",
        searchKeywords: "",
        minValue: "",
        maxValue: "",
        difficulty: "",
        category: "",
        setAside: "",
        emailFrequency: "daily",
      });
      setEditingId(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save alert");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this alert?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Alert deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const handleEdit = (alert: any) => {
    setFormData({
      name: alert.name,
      searchKeywords: alert.searchKeywords.join(", "),
      minValue: alert.minValue?.toString() || "",
      maxValue: alert.maxValue?.toString() || "",
      difficulty: alert.difficulty || "",
      category: alert.category || "",
      setAside: alert.setAside || "",
      emailFrequency: alert.emailFrequency,
    });
    setEditingId(alert.id);
    setIsCreating(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-gray-400">Please sign in to manage alerts</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Bell className="text-green-400" size={32} />
            Contract Alerts
          </h1>
          <p className="text-gray-400">
            Get notified when new contracts match your criteria
          </p>
        </div>

        {/* Create/Edit Form */}
        <Card className="bg-gray-900/50 border-green-500/20 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingId ? "Edit Alert" : "Create New Alert"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Alert Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., IT Services Contracts"
                  className="bg-gray-800/50 border-green-500/30"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Keywords (comma-separated) *
                </label>
                <Input
                  value={formData.searchKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, searchKeywords: e.target.value })
                  }
                  placeholder="e.g., software, cloud, infrastructure"
                  className="bg-gray-800/50 border-green-500/30"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Min Value ($)
                </label>
                <Input
                  type="number"
                  value={formData.minValue}
                  onChange={(e) =>
                    setFormData({ ...formData, minValue: e.target.value })
                  }
                  placeholder="0"
                  className="bg-gray-800/50 border-green-500/30"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Max Value ($)
                </label>
                <Input
                  type="number"
                  value={formData.maxValue}
                  onChange={(e) =>
                    setFormData({ ...formData, maxValue: e.target.value })
                  }
                  placeholder="1000000"
                  className="bg-gray-800/50 border-green-500/30"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-green-500/30 text-white rounded px-3 py-2"
                >
                  <option value="">Any</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Email Frequency
                </label>
                <select
                  value={formData.emailFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailFrequency: e.target.value as any,
                    })
                  }
                  className="w-full bg-gray-800/50 border border-green-500/30 text-white rounded px-3 py-2"
                >
                  <option value="instantly">Instantly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., IT Services"
                  className="bg-gray-800/50 border-green-500/30"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Set-Aside
                </label>
                <Input
                  value={formData.setAside}
                  onChange={(e) =>
                    setFormData({ ...formData, setAside: e.target.value })
                  }
                  placeholder="e.g., Small Business"
                  className="bg-gray-800/50 border-green-500/30"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-black font-bold"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    {editingId ? "Update Alert" : "Create Alert"}
                  </>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setIsCreating(false);
                    setFormData({
                      name: "",
                      searchKeywords: "",
                      minValue: "",
                      maxValue: "",
                      difficulty: "",
                      category: "",
                      setAside: "",
                      emailFrequency: "daily",
                    });
                  }}
                  variant="outline"
                  className="border-gray-500/30 text-gray-400"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Alerts List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Alerts</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-400" size={48} />
            </div>
          ) : alerts.length === 0 ? (
            <Card className="bg-gray-900/50 border-green-500/20 p-8 text-center">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-400 text-lg">No alerts yet</p>
              <p className="text-gray-500 text-sm">
                Create your first alert to get notified about new contracts
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <Card
                  key={alert.id}
                  className="bg-gray-900/50 border-green-500/20 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {alert.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alert.searchKeywords.map((keyword: string) => (
                          <Badge
                            key={keyword}
                            className="bg-green-500/20 text-green-400 border-green-500/50"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        {alert.minValue && (
                          <p>Min Value: ${alert.minValue.toLocaleString()}</p>
                        )}
                        {alert.maxValue && (
                          <p>Max Value: ${alert.maxValue.toLocaleString()}</p>
                        )}
                        {alert.difficulty && (
                          <p>Difficulty: {alert.difficulty}</p>
                        )}
                        <p>
                          Frequency:{" "}
                          <span className="text-green-400 capitalize">
                            {alert.emailFrequency}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(alert)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-green-400"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
