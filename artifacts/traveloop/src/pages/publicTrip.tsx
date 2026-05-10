import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Calendar, Share2, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicTrip, getGetPublicTripQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function PublicTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const { toast } = useToast();

  const { data: trip, isLoading, isError } = useGetPublicTrip(id, {
    query: { enabled: !!id, queryKey: getGetPublicTripQueryKey(id) }
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Plane size={16} />
              </div>
              <span className="font-serif font-bold text-lg text-primary">Traveloop</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 size={14} className="mr-1.5" />
              Share
            </Button>
            <Link href="/sign-up">
              <Button size="sm" className="font-medium">Plan your own trip</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-16 w-2/3" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : isError || !trip ? (
          <div className="text-center py-20">
            <MapPin size={40} className="text-primary/30 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Trip not found</h2>
            <p className="text-muted-foreground">This itinerary may be private or doesn't exist.</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {trip.coverPhotoUrl && (
                <div className="h-64 rounded-2xl overflow-hidden mb-8">
                  <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="font-serif text-5xl font-bold text-foreground mb-3">{trip.name}</h1>
              {trip.description && <p className="text-muted-foreground text-lg mb-4">{trip.description}</p>}
              <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5"><Calendar size={15} />{trip.startDate} – {trip.endDate}</span>
                <span className="flex items-center gap-1.5"><MapPin size={15} />{trip.stops.length} stops</span>
                <span>By <span className="font-medium text-foreground">{trip.authorName}</span></span>
              </div>
            </motion.div>

            {/* Stops */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-12">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Itinerary</h2>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {trip.stops.map((stop, i) => (
                    <motion.div
                      key={stop.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="relative pl-14"
                    >
                      <div className="absolute left-3 top-4 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-sm" />
                      <Card className="border-border">
                        <CardContent className="py-4 flex items-center gap-4">
                          {stop.cityImageUrl && (
                            <img src={stop.cityImageUrl} alt={stop.cityName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">{stop.cityName}</h3>
                            <p className="text-sm text-muted-foreground">{stop.cityCountry}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{stop.startDate} – {stop.endDate}</span>
                              <span>{stop.activityCount} activities</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16 text-center bg-muted/30 rounded-2xl p-10">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Inspired by this itinerary?</h3>
              <p className="text-muted-foreground mb-6">Create your own personalized travel plan with Traveloop.</p>
              <Link href="/sign-up">
                <Button size="lg" className="font-semibold">Start planning for free</Button>
              </Link>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
