import { useLocation } from "wouter";
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
import { useCreateTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Trip name is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  coverPhotoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPublic: z.boolean(),
  totalBudget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CreateTripPage() {
  const [, setLocation] = useLocation();
  const createTrip = useCreateTrip();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", coverPhotoUrl: "", isPublic: false, totalBudget: "" },
  });

  const onSubmit = async (values: FormData) => {
    try {
      const trip = await createTrip.mutateAsync({
        data: {
          name: values.name,
          description: values.description || undefined,
          startDate: values.startDate,
          endDate: values.endDate,
          coverPhotoUrl: values.coverPhotoUrl || undefined,
          isPublic: values.isPublic,
          totalBudget: values.totalBudget ? Number(values.totalBudget) : undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip created!" });
      setLocation(`/trips/${trip.id}`);
    } catch {
      toast({ title: "Failed to create trip", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation("/trips")}>
          <ArrowLeft size={16} className="mr-2" />
          Back to trips
        </Button>
        <h1 className="font-serif text-4xl font-bold text-foreground">Plan a new trip</h1>
        <p className="text-muted-foreground mt-1">Start by giving your adventure a name and some dates.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card border border-border rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer in Southeast Asia" className="h-12" {...field} data-testid="input-trip-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief overview of your trip..." className="resize-none" rows={3} {...field} data-testid="textarea-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-12" {...field} data-testid="input-start-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-12" {...field} data-testid="input-end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="coverPhotoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover photo URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="https://images.unsplash.com/..." className="h-12" {...field} data-testid="input-cover-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="totalBudget" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total budget (USD) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2000" className="h-12" {...field} data-testid="input-budget" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="isPublic" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <FormLabel className="text-base font-medium">Make public</FormLabel>
                    <p className="text-sm text-muted-foreground mt-0.5">Anyone with the link can view this itinerary</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-public" />
                  </FormControl>
                </FormItem>
              )} />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setLocation("/trips")}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-12 font-semibold" disabled={createTrip.isPending} data-testid="button-create-trip">
                  {createTrip.isPending ? "Creating..." : "Create trip"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
