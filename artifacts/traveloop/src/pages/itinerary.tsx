import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Clock, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetTrip, useListStops, useListStopActivities, useAddStopActivity, useRemoveStopActivity,
  useListCityActivities, getListStopActivitiesQueryKey, getGetTripQueryKey, getListStopsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function StopSection({ tripId, stop }: { tripId: number; stop: any }) {
  const [open, setOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [time, setTime] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: activities, isLoading } = useListStopActivities(tripId, stop.id, {
    query: { enabled: true, queryKey: getListStopActivitiesQueryKey(tripId, stop.id) }
  });
  const { data: cityActivities } = useListCityActivities(stop.cityId);
  const addActivity = useAddStopActivity();
  const removeActivity = useRemoveStopActivity();

  const handleAdd = async () => {
    if (!selectedActivity) return;
    try {
      await addActivity.mutateAsync({ tripId, stopId: stop.id, data: { activityId: Number(selectedActivity), scheduledTime: time || undefined } });
      queryClient.invalidateQueries({ queryKey: getListStopActivitiesQueryKey(tripId, stop.id) });
      setOpen(false);
      setSelectedActivity("");
      setTime("");
      toast({ title: "Activity added!" });
    } catch { toast({ title: "Failed to add activity", variant: "destructive" }); }
  };

  const handleRemove = async (saId: number) => {
    try {
      await removeActivity.mutateAsync({ tripId, stopId: stop.id, stopActivityId: saId });
      queryClient.invalidateQueries({ queryKey: getListStopActivitiesQueryKey(tripId, stop.id) });
    } catch { toast({ title: "Failed to remove activity", variant: "destructive" }); }
  };

  return (
    <div className="relative pl-14">
      <div className="absolute left-5 top-4 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-sm z-10" />
      <div className="absolute left-7 top-9 bottom-0 w-0.5 bg-border" />

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          {stop.cityImageUrl && (
            <img src={stop.cityImageUrl} alt={stop.cityName} className="w-10 h-10 rounded-lg object-cover" />
          )}
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">{stop.cityName}</h3>
            <p className="text-sm text-muted-foreground">{stop.startDate} – {stop.endDate}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {isLoading ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : activities?.length === 0 ? (
          <div className="text-sm text-muted-foreground italic pl-2">No activities yet</div>
        ) : (
          activities?.map((sa, i) => (
            <motion.div key={sa.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border hover:border-primary/20 transition-colors">
                <CardContent className="py-3 flex items-center gap-3">
                  {sa.activityImageUrl && (
                    <img src={sa.activityImageUrl} alt={sa.activityName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{sa.activityName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="bg-muted px-2 py-0.5 rounded-full">{sa.activityType}</span>
                      {sa.scheduledTime && <span className="flex items-center gap-1"><Clock size={11} />{sa.scheduledTime}</span>}
                      <span className="flex items-center gap-1"><DollarSign size={11} />${sa.cost}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{sa.duration}h</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleRemove(sa.id)}>
                    <Trash2 size={14} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5 mb-8" onClick={() => setOpen(true)}>
        <Plus size={14} className="mr-1.5" />
        Add activity
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Add activity to {stop.cityName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Activity</Label>
              <Select onValueChange={setSelectedActivity} value={selectedActivity}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Choose an activity..." /></SelectTrigger>
                <SelectContent>
                  {cityActivities?.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} — ${a.estimatedCost} ({a.duration}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scheduled time <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input type="time" className="mt-1.5 h-11" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addActivity.isPending}>
              {addActivity.isPending ? "Adding..." : "Add activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [, setLocation] = useLocation();

  const { data: trip } = useGetTrip(id, { query: { enabled: !!id, queryKey: getGetTripQueryKey(id) } });
  const { data: stops, isLoading } = useListStops(id, { query: { enabled: !!id, queryKey: getListStopsQueryKey(id) } });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation(`/trips/${id}`)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to trip
        </Button>
        <h1 className="font-serif text-4xl font-bold text-foreground">{trip?.name}</h1>
        <p className="text-muted-foreground mt-1">Day-by-day itinerary across {stops?.length ?? 0} stops</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-6"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
      ) : stops?.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/20">
          <CardContent className="py-14 text-center">
            <MapPin size={32} className="text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Add stops to your trip to start building your itinerary.</p>
            <Button className="mt-4" onClick={() => setLocation(`/trips/${id}`)}>Add stops</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border" />
          {stops?.map((stop, i) => (
            <motion.div key={stop.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <StopSection tripId={id} stop={stop} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
