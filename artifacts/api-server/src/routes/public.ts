import { Router } from "express";
import { db, tripsTable, tripStopsTable, citiesTable, usersTable, stopActivitiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/public/trips/:tripId", async (req: any, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.isPublic, true))).limit(1);
    if (!trip) { res.status(404).json({ error: "Not found or not public" }); return; }

    const [author] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, trip.userId)).limit(1);
    const stops = await db.select().from(tripStopsTable).where(eq(tripStopsTable.tripId, tripId)).orderBy(tripStopsTable.order);
    const formattedStops = await Promise.all(stops.map(async stop => {
      const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, stop.cityId)).limit(1);
      const acts = await db.select().from(stopActivitiesTable).where(eq(stopActivitiesTable.stopId, stop.id));
      return {
        id: stop.id,
        tripId: stop.tripId,
        cityId: stop.cityId,
        cityName: city?.name ?? "Unknown",
        cityCountry: city?.country ?? "",
        cityImageUrl: city?.imageUrl ?? null,
        startDate: stop.startDate,
        endDate: stop.endDate,
        order: stop.order,
        notes: stop.notes ?? null,
        activityCount: acts.length,
      };
    }));

    res.json({
      id: trip.id,
      name: trip.name,
      description: trip.description ?? null,
      coverPhotoUrl: trip.coverPhotoUrl ?? null,
      startDate: trip.startDate,
      endDate: trip.endDate,
      authorName: author?.name ?? "Anonymous",
      stops: formattedStops,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
