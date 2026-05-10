import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, Map, TrendingUp, Clock, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardSummary, useListTrips } from "@workspace/api-client-react";

const popularDestImages: Record<string, string> = {
  "Paris": "https://images.unsplash.com/photo-1499856845952-5870984e51be?w=200&h=150&fit=crop",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=150&fit=crop",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=150&fit=crop",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&h=150&fit=crop",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=200&h=150&fit=crop",
};

function StatCard({ label, value, icon: Icon, loading }: { label: string; value?: number | string; icon: any; loading?: boolean }) {
  return (
    <Card className="border-border hover:border-primary/30 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon size={20} />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-bold text-foreground">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: trips, isLoading: tripsLoading } = useListTrips();

  const recentTrips = trips?.slice(-3).reverse() ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Where will you go next?</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard label="Total Trips" value={summary?.totalTrips} icon={Map} loading={summaryLoading} />
        <StatCard label="Upcoming" value={summary?.upcomingTrips} icon={Clock} loading={summaryLoading} />
        <StatCard label="Completed" value={summary?.pastTrips} icon={TrendingUp} loading={summaryLoading} />
        <StatCard label="Total Budget" value={summary ? `$${Math.round(summary.totalBudget).toLocaleString()}` : undefined} icon={Globe} loading={summaryLoading} />
      </motion.div>

      {/* Recent Trips */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-bold text-foreground">Recent trips</h2>
          <Link href="/trips">
            <Button variant="ghost" className="text-primary font-medium">
              View all <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        {tripsLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : recentTrips.length === 0 ? (
          <Card className="border-dashed border-2 border-border bg-muted/20">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Map size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">Your adventure starts with a single plan. Let's create one.</p>
              <Link href="/trips/new">
                <Button className="font-medium">
                  <Plus size={16} className="mr-2" />
                  Plan your first trip
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recentTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={`/trips/${trip.id}`}>
                  <Card className="group cursor-pointer border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="h-36 bg-muted overflow-hidden relative">
                      {trip.coverPhotoUrl ? (
                        <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Map size={36} className="text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        {trip.isPublic && (
                          <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Public</span>
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4 pb-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{trip.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{trip.startDate} → {trip.endDate}</p>
                      <p className="text-xs text-muted-foreground mt-1">{trip.stopCount} stops</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Action */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Link href="/trips/new">
          <Card className="border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="py-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Plan a new trip</h3>
                <p className="text-muted-foreground text-sm mt-0.5">Create your next adventure — multi-city, budget-aware, and shareable</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-primary group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Top Destinations */}
      {(summary?.topDestinations?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-5">Your top destinations</h2>
          <div className="flex gap-3 flex-wrap">
            {summary!.topDestinations.map(dest => (
              <div key={dest} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm font-medium">
                <Globe size={14} className="text-primary" />
                {dest}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
