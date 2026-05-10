import { Router } from "express";
import { db, stopActivitiesTable, tripStopsTable, tripsTable, activitiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateUser } from "./users";

const router = Router();

async function assertStopAccess(tripId: number, stopId: number, userId: number, res: any): Promise<boolean> {
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return false; }
  const [stop] = await db.select().from(tripStopsTable).where(and(eq(tripStopsTable.id, stopId), eq(tripStopsTable.tripId, tripId))).limit(1);
  if (!stop) { res.status(404).json({ error: "Stop not found" }); return false; }
  return true;
}

async function formatStopActivity(sa: typeof stopActivitiesTable.$inferSelect) {
  const [act] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, sa.activityId)).limit(1);
  return {
    id: sa.id,
    stopId: sa.stopId,
    activityId: sa.activityId,
    activityName: act?.name ?? "Unknown",
    activityType: act?.type ?? "Other",
    activityImageUrl: act?.imageUrl ?? null,
    scheduledTime: sa.scheduledTime ?? null,
    notes: sa.notes ?? null,
    cost: sa.cost,
    duration: act?.duration ?? 1,
  };
}

router.get("/trips/:tripId/stops/:stopId/activities", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const stopId = Number(req.params.stopId);
    if (!(await assertStopAccess(tripId, stopId, userId, res))) return;
    const sas = await db.select().from(stopActivitiesTable).where(eq(stopActivitiesTable.stopId, stopId));
    res.json(await Promise.all(sas.map(formatStopActivity)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/trips/:tripId/stops/:stopId/activities", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const stopId = Number(req.params.stopId);
    if (!(await assertStopAccess(tripId, stopId, userId, res))) return;
    const { activityId, scheduledTime, notes, cost } = req.body;
    const [act] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, activityId)).limit(1);
    const [sa] = await db.insert(stopActivitiesTable).values({
      stopId, activityId,
      scheduledTime: scheduledTime || null,
      notes: notes || null,
      cost: cost ?? act?.estimatedCost ?? 0,
    }).returning();
    res.status(201).json(await formatStopActivity(sa));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/trips/:tripId/stops/:stopId/activities/:stopActivityId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const stopId = Number(req.params.stopId);
    const saId = Number(req.params.stopActivityId);
    if (!(await assertStopAccess(tripId, stopId, userId, res))) return;
    await db.delete(stopActivitiesTable).where(and(eq(stopActivitiesTable.id, saId), eq(stopActivitiesTable.stopId, stopId)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
