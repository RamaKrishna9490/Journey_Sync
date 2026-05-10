import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plane, MapPin, DollarSign, Users, ArrowRight, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const destinations = [
  { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1499856845952-5870984e51be?w=400&h=300&fit=crop" },
  { name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
  { name: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop" },
  { name: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop" },
  { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop" },
  { name: "Istanbul", country: "Turkey", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop" },
];

const features = [
  { icon: MapPin, title: "Multi-City Itineraries", desc: "Plan seamless routes across multiple cities with day-by-day stop management." },
  { icon: DollarSign, title: "Budget Tracking", desc: "Stay on budget with real-time cost breakdowns across activities, accommodation, and transport." },
  { icon: CheckCircle, title: "Packing Checklists", desc: "Never forget a thing. Smart checklists organized by category for every trip." },
  { icon: Users, title: "Share Your Plans", desc: "Make itineraries public and inspire fellow travelers with your routes." },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Plane size={18} />
            </div>
            <span className="font-serif font-bold text-xl text-primary">Traveloop</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="font-medium">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-medium shadow-sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&h=900&fit=crop"
            alt="Travel hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground border border-primary/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <Globe size={14} />
              Your personal travel command center
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Plan trips that feel{" "}
              <span className="text-primary italic">legendary.</span>
            </h1>
            <p className="text-white/80 text-xl leading-relaxed mb-10">
              From multi-city itineraries to budget breakdowns and packing lists — Traveloop gives every adventurer the tools to make every journey unforgettable.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/sign-up">
                <Button size="lg" className="font-semibold text-base h-14 px-8 shadow-lg shadow-primary/30">
                  Start planning for free
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="font-semibold text-base h-14 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Explore the world</h2>
            <p className="text-muted-foreground text-lg">Discover top destinations loved by Traveloop adventurers</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="font-serif font-bold text-white text-xl">{dest.name}</p>
                  <p className="text-white/70 text-sm">{dest.country}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Everything a traveler needs</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Traveloop brings every planning tool into one beautiful space</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <f.icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-secondary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Your next adventure awaits.</h2>
            <p className="text-white/70 text-xl mb-10">Join thousands of travelers planning smarter with Traveloop.</p>
            <Link href="/sign-up">
              <Button size="lg" className="font-semibold text-base h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
                Start for free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Plane size={12} />
            </div>
            <span className="font-serif font-semibold text-foreground">Traveloop</span>
          </div>
          <p>Built for adventurers everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
