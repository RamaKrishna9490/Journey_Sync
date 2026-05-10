import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useGetTripBudget, useGetTrip, getGetTripBudgetQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";

const COLORS = ["#f97316", "#1e3a5f", "#10b981", "#8b5cf6"];

export function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [, setLocation] = useLocation();

  const { data: trip } = useGetTrip(id, { query: { enabled: !!id, queryKey: getGetTripQueryKey(id) } });
  const { data: budget, isLoading } = useGetTripBudget(id, { query: { enabled: !!id, queryKey: getGetTripBudgetQueryKey(id) } });

  const pieData = budget ? [
    { name: "Activities", value: Math.round(budget.breakdown.activities) },
    { name: "Accommodation", value: Math.round(budget.breakdown.accommodation) },
    { name: "Transport", value: Math.round(budget.breakdown.transport) },
    { name: "Meals", value: Math.round(budget.breakdown.meals) },
  ] : [];

  const barData = pieData.map(d => ({ ...d, fill: COLORS[pieData.indexOf(d)] }));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation(`/trips/${id}`)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to trip
        </Button>
        <h1 className="font-serif text-4xl font-bold text-foreground">Budget Breakdown</h1>
        <p className="text-muted-foreground mt-1">{trip?.name}</p>
      </motion.div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
      ) : !budget ? null : (
        <>
          {/* Summary Cards */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground font-medium mb-2">Estimated total</p>
                <p className="text-3xl font-bold text-foreground">${Math.round(budget.totalEstimated).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className={`border-border ${budget.isOverBudget ? "border-destructive/50 bg-destructive/5" : ""}`}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground font-medium mb-2">Your budget</p>
                <p className="text-3xl font-bold text-foreground">
                  {budget.totalBudget ? `$${Math.round(budget.totalBudget).toLocaleString()}` : "Not set"}
                </p>
                {budget.isOverBudget && (
                  <div className="flex items-center gap-1 mt-2 text-destructive text-xs font-medium">
                    <AlertTriangle size={12} />
                    Over budget by ${Math.round(budget.totalEstimated - (budget.totalBudget ?? 0)).toLocaleString()}
                  </div>
                )}
                {!budget.isOverBudget && budget.totalBudget && (
                  <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
                    <CheckCircle size={12} />
                    ${Math.round((budget.totalBudget ?? 0) - budget.totalEstimated).toLocaleString()} remaining
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground font-medium mb-2">Per day cost</p>
                <p className="text-3xl font-bold text-foreground">${Math.round(budget.perDayCost).toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-border">
                <CardHeader><CardTitle className="font-serif text-xl">Cost distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${v}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="font-medium text-foreground ml-auto">${d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-border">
                <CardHeader><CardTitle className="font-serif text-xl">By category</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                      <Tooltip formatter={(v: any) => [`$${v}`, "Estimated"]} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
