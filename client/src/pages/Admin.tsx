/**
 * Admin Dashboard — Subscriber Management
 * Protected route for the site owner to view subscriber count,
 * list, conversion metrics, and export to CSV.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Users,
  Download,
  TrendingUp,
  ArrowLeft,
  Loader2,
  Mail,
  Calendar,
  Shield,
  Crown,
  Lock,
} from "lucide-react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

export default function Admin() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const {
    data: countData,
    isLoading: countLoading,
    error: countError,
  } = trpc.subscriber.count.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = trpc.subscriber.list.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  // Handle forbidden access for non-admin users
  const isForbidden = countError?.message?.includes("permission") || listError?.message?.includes("permission");

  if (user && isForbidden) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <Lock size={48} className="text-[var(--color-govamber)] mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-white mb-3">
            Admin Access Only
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            This dashboard is restricted to admin accounts. Your current account does not have admin privileges.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="bg-[var(--color-govgreen)] text-black font-display font-bold px-6 py-3 hover:brightness-110 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <Shield size={48} className="text-[var(--color-govgreen)] mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-white mb-3">
            Admin Access Required
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Sign in with your admin account to access the subscriber dashboard.
          </p>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="bg-[var(--color-govgreen)] text-black font-display font-bold hover:brightness-110"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const subscribers = listData ?? [];
  const totalCount = countData?.count ?? 0;

  // Calculate metrics
  const today = new Date();
  const todaySubs = subscribers.filter((s) => {
    const d = new Date(s.createdAt);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  const last7Days = subscribers.filter((s) => {
    const d = new Date(s.createdAt);
    const diff = today.getTime() - d.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const last30Days = subscribers.filter((s) => {
    const d = new Date(s.createdAt);
    const diff = today.getTime() - d.getTime();
    return diff <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  // CSV export
  const handleExportCSV = () => {
    if (!subscribers.length) return;
    const headers = ["ID", "Email", "Source", "Verified", "Subscribed At"];
    const rows = subscribers.map((s) => [
      s.id,
      s.email,
      s.source,
      s.verified ? "Yes" : "No",
      new Date(s.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `govcheat-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══ ADMIN HEADER ═══ */}
      <nav className="border-b border-[oklch(0.2_0.02_250)] bg-[oklch(0.09_0.01_250)]">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-[var(--color-govgreen)]" />
              <span className="font-display font-bold text-white">
                GOV<span className="text-[var(--color-govgreen)]">CHEAT</span>
              </span>
              <span className="font-mono text-xs text-muted-foreground border border-[oklch(0.25_0.02_250)] px-2 py-0.5">
                ADMIN
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground">
              {user.name || user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="font-mono text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* ═══ METRICS CARDS ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={Users}
            label="Total Subscribers"
            value={countLoading ? "..." : String(totalCount)}
            accent
          />
          <MetricCard
            icon={TrendingUp}
            label="Today"
            value={countLoading ? "..." : String(todaySubs)}
          />
          <MetricCard
            icon={Calendar}
            label="Last 7 Days"
            value={countLoading ? "..." : String(last7Days)}
          />
          <MetricCard
            icon={Mail}
            label="Last 30 Days"
            value={countLoading ? "..." : String(last30Days)}
          />
        </div>

        {/* ═══ SUBSCRIBER TABLE ═══ */}
        <div className="bg-[oklch(0.12_0.01_250)] border border-[oklch(0.2_0.02_250)]">
          <div className="flex items-center justify-between p-4 border-b border-[oklch(0.2_0.02_250)]">
            <h2 className="font-display font-bold text-lg text-white">
              Subscriber List
            </h2>
            <Button
              onClick={handleExportCSV}
              disabled={!subscribers.length}
              className="bg-[var(--color-govgreen)] text-black font-mono text-xs font-bold hover:brightness-110 disabled:opacity-50"
              size="sm"
            >
              <Download size={14} className="mr-2" />
              EXPORT CSV
            </Button>
          </div>

          {listLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-[var(--color-govgreen)]" size={24} />
              <span className="ml-3 font-mono text-sm text-muted-foreground">
                Loading subscribers...
              </span>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                No subscribers yet. Share your lead magnet to start collecting
                emails.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[oklch(0.2_0.02_250)]">
                    <th className="text-left font-mono text-xs text-muted-foreground px-4 py-3">
                      #
                    </th>
                    <th className="text-left font-mono text-xs text-muted-foreground px-4 py-3">
                      EMAIL
                    </th>
                    <th className="text-left font-mono text-xs text-muted-foreground px-4 py-3">
                      SOURCE
                    </th>
                    <th className="text-left font-mono text-xs text-muted-foreground px-4 py-3">
                      STATUS
                    </th>
                    <th className="text-left font-mono text-xs text-muted-foreground px-4 py-3">
                      SUBSCRIBED
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, i) => (
                    <tr
                      key={sub.id}
                      className="border-b border-[oklch(0.15_0.01_250)] hover:bg-[oklch(0.14_0.01_250)] transition-colors"
                    >
                      <td className="font-mono text-xs text-muted-foreground px-4 py-3">
                        {i + 1}
                      </td>
                      <td className="font-mono text-sm text-white px-4 py-3">
                        {sub.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[var(--color-govgreen)] bg-[oklch(0.82_0.22_155_/_0.1)] px-2 py-1">
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-xs px-2 py-1 ${
                            sub.verified
                              ? "text-[var(--color-govgreen)] bg-[oklch(0.82_0.22_155_/_0.1)]"
                              : "text-[var(--color-govamber)] bg-[oklch(0.82_0.16_75_/_0.1)]"
                          }`}
                        >
                          {sub.verified ? "VERIFIED" : "PENDING"}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-muted-foreground px-4 py-3">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Metric Card ─── */
function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-[oklch(0.12_0.01_250)] border p-5 ${
        accent
          ? "border-[var(--color-govgreen)]"
          : "border-[oklch(0.2_0.02_250)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon
          size={16}
          className={
            accent ? "text-[var(--color-govgreen)]" : "text-muted-foreground"
          }
        />
        <span className="font-mono text-xs text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <p
        className={`font-display font-bold text-3xl ${
          accent ? "text-[var(--color-govgreen)]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
