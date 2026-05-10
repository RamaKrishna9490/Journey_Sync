import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListCities } from "@workspace/api-client-react";

export function CitiesPage() {
  const { data: cities, isLoading } = useListCities();
  const [search, setSearch] = useState("");

  const filtered = cities?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.region.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-bold text-foreground">Explore Cities</h1>
        <p className="text-muted-foreground mt-1">Discover destinations and add them to your trips</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cities, countries, or regions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-11 h-12 text-base"
          data-testid="input-city-search"
        />
      </motion.div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin size={32} className="mx-auto mb-3 text-primary/30" />
          <p>No cities found matching "{search}"</p>
        </div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="group overflow-hidden border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="h-48 bg-muted overflow-hidden relative">
                  {city.imageUrl ? (
                    <img
                      src={city.imageUrl}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                      <MapPin size={40} className="text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-serif font-bold text-xl text-white">{city.name}</h3>
                    <p className="text-white/80 text-sm">{city.country} · {city.region}</p>
                  </div>
                </div>
                <CardContent className="py-4">
                  {city.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{city.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign size={14} className="text-primary" />
                      <span>Cost index: <span className="font-medium text-foreground">{city.costIndex.toFixed(1)}x</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Star size={14} className="text-primary" />
                      <span className="font-medium text-foreground">{city.popularity}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
