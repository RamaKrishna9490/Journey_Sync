import { Router } from "express";
import { db, tripsTable, usersTable, tripStopsTable, citiesTable, stopActivitiesTable, activitiesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateUser } from "./users";

const router = Router();

async function getUserId(clerkId: string): Promise<number> {
  const user = await getOrCreateUser(clerkId);
  return user.id;
}

async function assertTripOwner(tripId: number, userId: number, res: any): Promise<boolean> {
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return false; }
  return true;
}

async function formatTrip(trip: typeof tripsTable.$inferSelect) {
  const stops = await db.select({ count: count() }).from(tripStopsTable).where(eq(tripStopsTable.tripId, trip.id));
  return {
    id: trip.id,
    userId: trip.userId,
    name: trip.name,
    description: trip.description ?? null,
    startDate: trip.startDate,
    endDate: trip.endDate,
    coverPhotoUrl: trip.coverPhotoUrl ?? null,
    isPublic: trip.isPublic,
    totalBudget: trip.totalBudget ?? null,
    createdAt: trip.createdAt.toISOString(),
    stopCount: stops[0]?.count ?? 0,
  };
}

router.get("/trips", requireAuth, async (req: any, res) => {
  try {
    const userId = await getUserId(req.clerkId);
    const trips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId)).orderBy(tripsTable.createdAt);
    const formatted = await Promise.all(trips.map(formatTrip));
    res.json(formatted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/trips", requireAuth, async (req: any, res) => {
  try {
    const userId = await getUserId(req.clerkId);
    const { name, description, startDate, endDate, coverPhotoUrl, isPublic, totalBudget } = req.body;
    const [trip] = await db.insert(tripsTable).values({
      userId,
      name,
      description: description || null,
      startDate,
      endDate,
      coverPhotoUrl: coverPhotoUrl || null,
      isPublic: isPublic ?? false,
      totalBudget: totalBudget || null,
    }).returning();
    res.status(201).json(await formatTrip(trip));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/trips/:tripId", requireAuth, async (req: any, res) => {
  try {
    const userId = await getUserId(req.clerkId);
    const tripId = Number(req.params.tripId);
    const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
    if (!trip) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await formatTrip(trip));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/trips/:tripId", requireAuth, async (req: any, res) => {
  try {
    const userId = await getUserId(req.clerkId);
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { name, description, startDate, endDate, coverPhotoUrl, isPublic, totalBudget } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (coverPhotoUrl !== undefined) updates.coverPhotoUrl = coverPhotoUrl;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (totalBudget !== undefined) updates.totalBudget = totalBudget;
    const [updated] = await db.update(tripsTable).set(updates).where(eq(tripsTable.id, tripId)).returning();
    res.json(await formatTrip(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/trips/:tripId", requireAuth, async (req: any, res) => {
  try {
    const userId = await getUserId(req.clerkId);
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    await db.delete(tripsTable).where(eq(tripsTable.id, tripId));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/trips/:tripId/budget", requireAuth, async (req: any, res) => {
  try {
    const userId = await getUserId(req.clerkId);
    const tripId = Number(req.params.tripId);
    const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
    if (!trip) { res.status(404).json({ error: "Not found" }); return; }

    const stops = await db.select().from(tripStopsTable).where(eq(tripStopsTable.tripId, tripId));
    let activitiesCost = 0;
    for (const stop of stops) {
      const sas = await db.select({ cost: stopActivitiesTable.cost }).from(stopActivitiesTable).where(eq(stopActivitiesTable.stopId, stop.id));
      activitiesCost += sas.reduce((sum, sa) => sum + (sa.cost ?? 0), 0);
    }

    const startMs = new Date(trip.startDate).getTime();
    const endMs = new Date(trip.endDate).getTime();
    const days = Math.max(1, Math.ceil((endMs - startMs) / 86400000));
    const accommodation = stops.length * 80 * days / Math.max(1, stops.length);
    const transport = stops.length * 150;
    const meals = days * 40;
    const totalEstimated = activitiesCost + accommodation + transport + meals;

    res.json({
      tripId,
      totalEstimated,
      totalBudget: trip.totalBudget ?? null,
      isOverBudget: trip.totalBudget !== null && totalEstimated > (trip.totalBudget ?? 0),
      perDayCost: totalEstimated / days,
      breakdown: {
        activities: activitiesCost,
        accommodation,
        transport,
        meals,
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
