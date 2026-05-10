import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Map, Edit, Trash2, Eye, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useListTrips, useDeleteTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function TripsPage() {
  const { data: trips, isLoading } = useListTrips();
  const deleteTrip = useDeleteTrip();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTrip.mutateAsync({ tripId: deletingId });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip deleted" });
    } catch {
      toast({ title: "Failed to delete trip", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-foreground">My Trips</h1>
          <p className="text-muted-foreground mt-1">{trips?.length ?? 0} adventures planned</p>
        </div>
        <Link href="/trips/new">
          <Button className="font-medium shadow-sm">
            <Plus size={16} className="mr-2" />
            New Trip
          </Button>
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : trips?.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/20">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
              <Map size={36} />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">No trips yet</h3>
            <p className="text-muted-foreground text-lg mb-8">Your first adventure is just one click away.</p>
            <Link href="/trips/new">
              <Button size="lg" className="font-semibold">
                <Plus size={18} className="mr-2" />
                Plan your first trip
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {trips?.map((trip, i) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200">
                  <div
                    className="h-44 bg-muted overflow-hidden relative cursor-pointer"
                    onClick={() => setLocation(`/trips/${trip.id}`)}
                  >
                    {trip.coverPhotoUrl ? (
                      <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 flex items-center justify-center">
                        <Map size={42} className="text-primary/30" />
                      </div>
                    )}
                    {trip.isPublic && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow-sm">Public</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4 pb-4">
                    <h3
                      className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors cursor-pointer truncate"
                      onClick={() => setLocation(`/trips/${trip.id}`)}
                    >
                      {trip.name}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{trip.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{trip.startDate} – {trip.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{trip.stopCount} stops</span>
                      </div>
                    </div>
                    {trip.totalBudget && (
                      <p className="text-xs font-medium text-primary mt-2">Budget: ${trip.totalBudget.toLocaleString()}</p>
                    )}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setLocation(`/trips/${trip.id}`)}>
                        <Eye size={14} className="mr-1.5" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setLocation(`/trips/${trip.id}/edit`)}>
                        <Edit size={14} className="mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        onClick={() => setDeletingId(trip.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the trip and all its stops, activities, and notes.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
