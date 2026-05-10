import { Router } from "express";
import { db, tripNotesTable, tripsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateUser } from "./users";

const router = Router();

async function assertTripOwner(tripId: number, userId: number, res: any): Promise<boolean> {
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId))).limit(1);
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return false; }
  return true;
}

function formatNote(n: typeof tripNotesTable.$inferSelect) {
  return {
    id: n.id,
    tripId: n.tripId,
    stopId: n.stopId ?? null,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

router.get("/trips/:tripId/notes", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const notes = await db.select().from(tripNotesTable).where(eq(tripNotesTable.tripId, tripId)).orderBy(tripNotesTable.createdAt);
    res.json(notes.map(formatNote));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/trips/:tripId/notes", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { content, stopId } = req.body;
    const [note] = await db.insert(tripNotesTable).values({ tripId, content, stopId: stopId ?? null }).returning();
    res.status(201).json(formatNote(note));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/trips/:tripId/notes/:noteId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const noteId = Number(req.params.noteId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    const { content, stopId } = req.body;
    const updates: Record<string, any> = {};
    if (content !== undefined) updates.content = content;
    if (stopId !== undefined) updates.stopId = stopId;
    const [updated] = await db.update(tripNotesTable).set(updates).where(and(eq(tripNotesTable.id, noteId), eq(tripNotesTable.tripId, tripId))).returning();
    if (!updated) { res.status(404).json({ error: "Note not found" }); return; }
    res.json(formatNote(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/trips/:tripId/notes/:noteId", requireAuth, async (req: any, res) => {
  try {
    const userId = (await getOrCreateUser(req.clerkId)).id;
    const tripId = Number(req.params.tripId);
    const noteId = Number(req.params.noteId);
    if (!(await assertTripOwner(tripId, userId, res))) return;
    await db.delete(tripNotesTable).where(and(eq(tripNotesTable.id, noteId), eq(tripNotesTable.tripId, tripId)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
