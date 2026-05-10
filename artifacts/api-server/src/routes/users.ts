import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

async function getOrCreateUser(clerkId: string, fallbackName?: string, fallbackEmail?: string) {
  const [upserted] = await db.insert(usersTable)
    .values({ clerkId, name: fallbackName || "Traveler", email: fallbackEmail || "" })
    .onConflictDoNothing({ target: usersTable.clerkId })
    .returning();
  if (upserted) return upserted;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  return existing;
}

router.get("/users/me", requireAuth, async (req: any, res) => {
  try {
    const user = await getOrCreateUser(req.clerkId);
    res.json({
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      language: user.language,
      savedDestinations: user.savedDestinations ?? [],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/me", requireAuth, async (req: any, res) => {
  try {
    const user = await getOrCreateUser(req.clerkId);
    const { name, avatarUrl, language, savedDestinations } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (language !== undefined) updates.language = language;
    if (savedDestinations !== undefined) updates.savedDestinations = savedDestinations;
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
    res.json({
      id: updated.id,
      clerkId: updated.clerkId,
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatarUrl ?? null,
      language: updated.language,
      savedDestinations: updated.savedDestinations ?? [],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { getOrCreateUser };
export default router;
