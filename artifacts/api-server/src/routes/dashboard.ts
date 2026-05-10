import { Router } from "express";
import { db, tripsTable, tripStopsTable, citiesTable } from "@workspace/db";
import { eq, and, gte, lt } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateUser } from "./users";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const allTrips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId));
    const now = new Date().toISOString().split("T")[0];
    const upcoming = allTrips.filter(t => t.startDate >= now).length;
    const past = allTrips.filter(t => t.endDate < now).length;
    const totalBudget = allTrips.reduce((sum, t) => sum + (t.totalBudget ?? 0), 0);

    const stopCityIds: number[] = [];
    for (const trip of allTrips) {
      const stops = await db.select({ cityId: tripStopsTable.cityId }).from(tripStopsTable).where(eq(tripStopsTable.tripId, trip.id));
      stopCityIds.push(...stops.map(s => s.cityId));
    }

    const cityFreq: Record<number, number> = {};
    for (const id of stopCityIds) cityFreq[id] = (cityFreq[id] || 0) + 1;
    const topCityIds = Object.entries(cityFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => Number(id));
    const topDestinations: string[] = [];
    for (const cityId of topCityIds) {
      const [city] = await db.select({ name: citiesTable.name }).from(citiesTable).where(eq(citiesTable.id, cityId)).limit(1);
      if (city) topDestinations.push(city.name);
    }

    res.json({
      totalTrips: allTrips.length,
      upcomingTrips: upcoming,
      pastTrips: past,
      totalBudget,
      topDestinations,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
