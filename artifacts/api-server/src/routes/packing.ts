import { Router } from "express";
import { db, packingItemsTable, tripsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateUser } from "./users";

const router = Router();

async function assertTripOwner(tripId: number, userId: number, res: any): Promise<boolean> {
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return false; }
  return true;
}

router.get("/trips/:tripId/packing", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const items = await db.select().from(packingItemsTable).where(eq(packingItemsTable.tripId, tripId));
    res.json(items.map(i => ({ id: i.id, tripId: i.tripId, name: i.name, category: i.category, isPacked: i.isPacked })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/trips/:tripId/packing", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { name, category, isPacked } = req.body;
    const [item] = await db.insert(packingItemsTable).values({ tripId, name, category: category || "General", isPacked: isPacked ?? false }).returning();
    res.status(201).json({ id: item.id, tripId: item.tripId, name: item.name, category: item.category, isPacked: item.isPacked });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/trips/:tripId/packing/:itemId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const itemId = Number(req.params.itemId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { name, category, isPacked } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (isPacked !== undefined) updates.isPacked = isPacked;
    const [updated] = await db.update(packingItemsTable).set(updates).where(and(eq(packingItemsTable.id, itemId), eq(packingItemsTable.tripId, tripId))).returning();
    if (!updated) { res.status(404).json({ error: "Item not found" }); return; }
    res.json({ id: updated.id, tripId: updated.tripId, name: updated.name, category: updated.category, isPacked: updated.isPacked });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/trips/:tripId/packing/:itemId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const itemId = Number(req.params.itemId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    await db.delete(packingItemsTable).where(and(eq(packingItemsTable.id, itemId), eq(packingItemsTable.tripId, tripId)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
