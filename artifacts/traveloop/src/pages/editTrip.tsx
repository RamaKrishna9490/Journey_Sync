import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTrip, useUpdateTrip, getListTripsQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Trip name is required"),
  description: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean(),
  totalBudget: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function EditTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useGetTrip(id, { query: { enabled: !!id, queryKey: getGetTripQueryKey(id) } });
  const updateTrip = useUpdateTrip();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", coverPhotoUrl: "", isPublic: false, totalBudget: "" },
  });

  useEffect(() => {
    if (trip) {
      form.reset({
        name: trip.name,
        description: trip.description ?? "",
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverPhotoUrl: trip.coverPhotoUrl ?? "",
        isPublic: trip.isPublic,
        totalBudget: trip.totalBudget ? String(trip.totalBudget) : "",
      });
    }
  }, [trip]);

  const onSubmit = async (values: FormData) => {
    try {
      await updateTrip.mutateAsync({ tripId: id, data: {
        name: values.name,
        description: values.description || null,
        startDate: values.startDate,
        endDate: values.endDate,
        coverPhotoUrl: values.coverPhotoUrl || null,
        isPublic: values.isPublic,
        totalBudget: values.totalBudget ? Number(values.totalBudget) : null,
      }});
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip updated!" });
      setLocation(`/trips/${id}`);
    } catch {
      toast({ title: "Failed to update trip", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation(`/trips/${id}`)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to trip
        </Button>
        <h1 className="font-serif text-4xl font-bold text-foreground">Edit trip</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card border border-border rounded-2xl p-8">
          {isLoading ? (
            <div className="space-y-4"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /></div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Trip name</FormLabel><FormControl><Input className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem><FormLabel>Start date</FormLabel><FormControl><Input type="date" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem><FormLabel>End date</FormLabel><FormControl><Input type="date" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="coverPhotoUrl" render={({ field }) => (
                  <FormItem><FormLabel>Cover photo URL</FormLabel><FormControl><Input className="h-12" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="totalBudget" render={({ field }) => (
                  <FormItem><FormLabel>Total budget (USD)</FormLabel><FormControl><Input type="number" className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="isPublic" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div><FormLabel className="text-base font-medium">Make public</FormLabel></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setLocation(`/trips/${id}`)}>Cancel</Button>
                  <Button type="submit" className="flex-1 h-12 font-semibold" disabled={updateTrip.isPending}>
                    {updateTrip.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
