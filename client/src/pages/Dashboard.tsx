import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { format } from "date-fns";

const tierColors: Record<string, string> = {
  scout: "text-gray-400",
  operator: "text-blue-400",
  contractor: "text-purple-400",
  prime: "text-amber-400",
};

const tierNames: Record<string, string> = {
  scout: "Scout (Free)",
  operator: "Operator ($29/mo)",
  contractor: "Contractor ($79/mo)",
  prime: "Prime ($299/mo)",
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const subscriptionQuery = trpc.dashboard.getSubscription.useQuery();
  const paymentHistoryQuery = trpc.dashboard.getPaymentHistory.useQuery();
  const metricsQuery = trpc.dashboard.getMetrics.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground">
            You need to be logged in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const isLoading =
    subscriptionQuery.isLoading ||
    paymentHistoryQuery.isLoading ||
    metricsQuery.isLoading;
  const metrics = metricsQuery.data;
  const subscription = subscriptionQuery.data?.subscription;
  const payments = paymentHistoryQuery.data?.payments || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-[oklch(0.2_0.02_250)] bg-[oklch(0.09_0.01_250)]">
        <div className="container py-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Your Account
          </h1>
          <p className="text-[oklch(0.6_0.01_250)]">
            Manage your subscription and view payment history
          </p>
        </div>
      </div>

      <div className="container py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[var(--color-govgreen)]" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Subscription Status Section */}
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-6">
                Subscription Status
              </h2>

              {metrics?.isSubscribed ? (
                <Card className="bg-[oklch(0.11_0.01_250)] border-[oklch(0.2_0.02_250)] p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Current Plan */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle
                          size={24}
                          className="text-[var(--color-govgreen)]"
                        />
                        <h3 className="font-display font-bold text-xl text-white">
                          Active Plan
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-[oklch(0.5_0.01_250)] mb-1">
                            Current Tier
                          </p>
                          <p
                            className={`font-display font-bold text-lg ${tierColors[metrics.tier]}`}
                          >
                            {tierNames[metrics.tier]}
                          </p>
                        </div>
                        {metrics.nextBillingDate && (
                          <div>
                            <p className="text-sm text-[oklch(0.5_0.01_250)] mb-1">
                              Next Billing Date
                            </p>
                            <p className="font-mono text-white">
                              {format(
                                new Date(metrics.nextBillingDate),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Billing Summary */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard
                          size={24}
                          className="text-[var(--color-govgreen)]"
                        />
                        <h3 className="font-display font-bold text-xl text-white">
                          Billing Summary
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-[oklch(0.5_0.01_250)] mb-1">
                            Total Spent
                          </p>
                          <p className="font-display font-bold text-2xl text-white">
                            ${metrics.totalSpent.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[oklch(0.5_0.01_250)] mb-1">
                            Payments Made
                          </p>
                          <p className="font-mono text-white">
                            {metrics.totalPayments}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[oklch(0.2_0.02_250)] flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-[var(--color-govgreen)] text-[var(--color-govgreen)] hover:bg-[var(--color-govgreen)] hover:text-black"
                    >
                      Change Plan
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-[oklch(0.11_0.01_250)] border-[oklch(0.2_0.02_250)] p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle
                      size={24}
                      className="text-[var(--color-govamber)] shrink-0 mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-white mb-2">
                        No Active Subscription
                      </h3>
                      <p className="text-[oklch(0.6_0.01_250)] mb-4">
                        Upgrade to unlock the AI Bid Writer and access premium
                        government contract opportunities.
                      </p>
                      <Button className="bg-[var(--color-govgreen)] text-black font-display font-bold hover:brightness-110">
                        View Plans
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Payment History Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-white">
                  Payment History
                </h2>
                {payments.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--color-govgreen)] text-[var(--color-govgreen)] hover:bg-[var(--color-govgreen)] hover:text-black"
                  >
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>

              {payments.length > 0 ? (
                <Card className="bg-[oklch(0.11_0.01_250)] border-[oklch(0.2_0.02_250)] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[oklch(0.2_0.02_250)] hover:bg-transparent">
                        <TableHead className="text-[oklch(0.6_0.01_250)]">
                          Date
                        </TableHead>
                        <TableHead className="text-[oklch(0.6_0.01_250)]">
                          Amount
                        </TableHead>
                        <TableHead className="text-[oklch(0.6_0.01_250)]">
                          Description
                        </TableHead>
                        <TableHead className="text-[oklch(0.6_0.01_250)]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow
                          key={payment.id}
                          className="border-[oklch(0.2_0.02_250)] hover:bg-[oklch(0.15_0.01_250)]"
                        >
                          <TableCell className="font-mono text-sm text-white">
                            {payment.paidAt
                              ? format(new Date(payment.paidAt), "MMM d, yyyy")
                              : format(
                                  new Date(payment.createdAt),
                                  "MMM d, yyyy"
                                )}
                          </TableCell>
                          <TableCell className="font-display font-bold text-white">
                            ${(payment.amount / 100).toFixed(2)}{" "}
                            {payment.currency.toUpperCase()}
                          </TableCell>
                          <TableCell className="text-[oklch(0.6_0.01_250)]">
                            {payment.description || "Subscription"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded ${
                                payment.status === "paid"
                                  ? "bg-[oklch(0.82_0.22_155_/_0.2)] text-[var(--color-govgreen)]"
                                  : payment.status === "pending"
                                    ? "bg-[oklch(0.82_0.12_40_/_0.2)] text-[var(--color-govamber)]"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {payment.status === "paid" && (
                                <CheckCircle size={12} />
                              )}
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="bg-[oklch(0.11_0.01_250)] border-[oklch(0.2_0.02_250)] p-6 text-center">
                  <Calendar
                    size={32}
                    className="text-[oklch(0.3_0.01_250)] mx-auto mb-3"
                  />
                  <p className="text-[oklch(0.5_0.01_250)]">
                    No payment history yet
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
