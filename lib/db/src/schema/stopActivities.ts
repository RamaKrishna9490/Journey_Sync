import { pgTable, text, serial, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stopActivitiesTable = pgTable("stop_activities", {
  id: serial("id").primaryKey(),
  stopId: integer("stop_id").notNull(),
  activityId: integer("activity_id").notNull(),
  scheduledTime: text("scheduled_time"),
  notes: text("notes"),
  cost: real("cost").notNull().default(0),
});

export const insertStopActivitySchema = createInsertSchema(stopActivitiesTable).omit({ id: true });
export type InsertStopActivity = z.infer<typeof insertStopActivitySchema>;
export type StopActivity = typeof stopActivitiesTable.$inferSelect;
