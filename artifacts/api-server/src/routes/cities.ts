import { Router } from "express";
import { db, citiesTable, activitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/cities", async (req: any, res) => {
  try {
    const cities = await db.select().from(citiesTable).orderBy(citiesTable.popularity);
    res.json(cities.map(c => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      costIndex: c.costIndex,
      popularity: c.popularity,
      imageUrl: c.imageUrl ?? null,
      description: c.description ?? null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cities/:cityId", async (req: any, res) => {
  try {
    const cityId = Number(req.params.cityId);
    const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, cityId)).limit(1);
    if (!city) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      costIndex: city.costIndex,
      popularity: city.popularity,
      imageUrl: city.imageUrl ?? null,
      description: city.description ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cities/:cityId/activities", async (req: any, res) => {
  try {
    const cityId = Number(req.params.cityId);
    const activities = await db.select().from(activitiesTable).where(eq(activitiesTable.cityId, cityId));
    res.json(activities.map(a => ({
      id: a.id,
      cityId: a.cityId,
      name: a.name,
      description: a.description ?? null,
      type: a.type,
      estimatedCost: a.estimatedCost,
      duration: a.duration,
      imageUrl: a.imageUrl ?? null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
