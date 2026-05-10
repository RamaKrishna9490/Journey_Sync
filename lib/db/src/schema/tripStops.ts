import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tripStopsTable = pgTable("trip_stops", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  cityId: integer("city_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  order: integer("order").notNull().default(0),
  notes: text("notes"),
});

export const insertTripStopSchema = createInsertSchema(tripStopsTable).omit({ id: true });
export type InsertTripStop = z.infer<typeof insertTripStopSchema>;
export type TripStop = typeof tripStopsTable.$inferSelect;
