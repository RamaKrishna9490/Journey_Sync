import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, MapPin, Calendar, Edit, DollarSign, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetTrip, useListStops, useCreateStop, useDeleteStop, useListCities, getListStopsQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trip, isLoading: tripLoading } = useGetTrip(id, { query: { enabled: !!id, queryKey: getGetTripQueryKey(id) } });
  const { data: stops, isLoading: stopsLoading } = useListStops(id, { query: { enabled: !!id, queryKey: getListStopsQueryKey(id) } });
  const { data: cities } = useListCities();

  const createStop = useCreateStop();
  const deleteStop = useDeleteStop();

  const [addStopOpen, setAddStopOpen] = useState(false);
  const [newStop, setNewStop] = useState({ cityId: "", startDate: "", endDate: "" });

  const handleAddStop = async () => {
    if (!newStop.cityId || !newStop.startDate || !newStop.endDate) return;
    try {
      await createStop.mutateAsync({ tripId: id, data: { cityId: Number(newStop.cityId), startDate: newStop.startDate, endDate: newStop.endDate, order: (stops?.length ?? 0) } });
      queryClient.invalidateQueries({ queryKey: getListStopsQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      setAddStopOpen(false);
      setNewStop({ cityId: "", startDate: "", endDate: "" });
      toast({ title: "Stop added!" });
    } catch {
      toast({ title: "Failed to add stop", variant: "destructive" });
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    try {
      await deleteStop.mutateAsync({ tripId: id, stopId });
      queryClient.invalidateQueries({ queryKey: getListStopsQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      toast({ title: "Stop removed" });
    } catch {
      toast({ title: "Failed to remove stop", variant: "destructive" });
    }
  };

  if (tripLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );

  if (!trip) return <div className="text-center py-20 text-muted-foreground">Trip not found.</div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation("/trips")}>
          <ArrowLeft size={16} className="mr-2" />
          All trips
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground">{trip.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><Calendar size={14} />{trip.startDate} – {trip.endDate}</span>
              <span className="flex items-center gap-1"><MapPin size={14} />{trip.stopCount} stops</span>
              {trip.totalBudget && <span className="flex items-center gap-1"><DollarSign size={14} />${trip.totalBudget.toLocaleString()}</span>}
            </div>
            {trip.description && <p className="text-muted-foreground mt-2">{trip.description}</p>}
          </div>
          <Button variant="outline" onClick={() => setLocation(`/trips/${id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Edit trip
          </Button>
        </div>
      </motion.div>

      {/* Quick nav tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Itinerary", href: `/trips/${id}/itinerary`, icon: Calendar },
            { label: "Budget", href: `/trips/${id}/budget`, icon: DollarSign },
            { label: "Packing", href: `/trips/${id}/packing`, icon: Package },
            { label: "Notes", href: `/trips/${id}/notes`, icon: FileText },
          ].map(tab => (
            <Link key={tab.href} href={tab.href}>
              <Button variant="outline" size="sm" className="font-medium">
                <tab.icon size={14} className="mr-1.5" />
                {tab.label}
              </Button>
            </Link>
          ))}
          {trip.isPublic && (
            <Link href={`/public/${id}`}>
              <Button variant="outline" size="sm">View public page</Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stops */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-bold text-foreground">Stops</h2>
          <Button onClick={() => setAddStopOpen(true)} className="font-medium">
            <Plus size={16} className="mr-2" />
            Add stop
          </Button>
        </div>

        {stopsLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : stops?.length === 0 ? (
          <Card className="border-dashed border-2 border-border bg-muted/20">
            <CardContent className="py-14 text-center">
              <MapPin size={32} className="text-primary/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">No stops yet</h3>
              <p className="text-muted-foreground text-sm mb-5">Add cities to build out your itinerary</p>
              <Button onClick={() => setAddStopOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add first stop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {stops?.map((stop, i) => (
                <motion.div
                  key={stop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-sm" />
                  <Card className="border-border hover:border-primary/30 hover:shadow-md transition-all duration-200">
                    <CardContent className="py-4 flex items-center gap-4">
                      {stop.cityImageUrl ? (
                        <img src={stop.cityImageUrl} alt={stop.cityName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <MapPin size={24} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg">{stop.cityName}</h3>
                        <p className="text-sm text-muted-foreground">{stop.cityCountry}</p>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{stop.startDate} – {stop.endDate}</span>
                          <span>{stop.activityCount} activities</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/trips/${id}/itinerary`)}>
                          <Calendar size={14} className="mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteStop(stop.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Stop Dialog */}
      <Dialog open={addStopOpen} onOpenChange={setAddStopOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add a stop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>City</Label>
              <Select onValueChange={v => setNewStop(s => ({ ...s, cityId: v }))} value={newStop.cityId}>
                <SelectTrigger className="mt-1.5 h-11" data-testid="select-city">
                  <SelectValue placeholder="Choose a city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map(c => (
                    <SelectItem key={c.id} value={String(c.id)} data-testid={`city-option-${c.id}`}>
                      {c.name}, {c.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input type="date" className="mt-1.5 h-11" value={newStop.startDate} onChange={e => setNewStop(s => ({ ...s, startDate: e.target.value }))} data-testid="input-stop-start" />
              </div>
              <div>
                <Label>To</Label>
                <Input type="date" className="mt-1.5 h-11" value={newStop.endDate} onChange={e => setNewStop(s => ({ ...s, endDate: e.target.value }))} data-testid="input-stop-end" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStopOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStop} disabled={createStop.isPending} data-testid="button-add-stop">
              {createStop.isPending ? "Adding..." : "Add stop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
