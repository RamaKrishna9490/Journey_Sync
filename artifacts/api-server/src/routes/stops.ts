import { Router } from "express";
import { db, tripStopsTable, tripsTable, citiesTable, stopActivitiesTable, activitiesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateUser } from "./users";

const router = Router({ mergeParams: true });

async function assertTripOwner(tripId: number, userId: number, res: any): Promise<boolean> {
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return false; }
  return true;
}

async function formatStop(stop: typeof tripStopsTable.$inferSelect) {
  const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, stop.cityId)).limit(1);
  const acts = await db.select({ count: count() }).from(stopActivitiesTable).where(eq(stopActivitiesTable.stopId, stop.id));
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
    activityCount: acts[0]?.count ?? 0,
  };
}

router.get("/trips/:tripId/stops", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const stops = await db.select().from(tripStopsTable).where(eq(tripStopsTable.tripId, tripId)).orderBy(tripStopsTable.order);
    res.json(await Promise.all(stops.map(formatStop)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/trips/:tripId/stops", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { cityId, startDate, endDate, order, notes } = req.body;
    const [stop] = await db.insert(tripStopsTable).values({
      tripId, cityId, startDate, endDate, order: order ?? 0, notes: notes || null,
    }).returning();
    res.status(201).json(await formatStop(stop));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/trips/:tripId/stops/:stopId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const stopId = Number(req.params.stopId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { startDate, endDate, order, notes } = req.body;
    const updates: Record<string, any> = {};
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (order !== undefined) updates.order = order;
    if (notes !== undefined) updates.notes = notes;
    const [updated] = await db.update(tripStopsTable).set(updates).where(and(eq(tripStopsTable.id, stopId), eq(tripStopsTable.tripId, tripId))).returning();
    if (!updated) { res.status(404).json({ error: "Stop not found" }); return; }
    res.json(await formatStop(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/trips/:tripId/stops/:stopId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const stopId = Number(req.params.stopId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    await db.delete(stopActivitiesTable).where(eq(stopActivitiesTable.stopId, stopId));
    await db.delete(tripStopsTable).where(and(eq(tripStopsTable.id, stopId), eq(tripStopsTable.tripId, tripId)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
