import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tripNotesTable = pgTable("trip_notes", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  stopId: integer("stop_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTripNoteSchema = createInsertSchema(tripNotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTripNote = z.infer<typeof insertTripNoteSchema>;
export type TripNote = typeof tripNotesTable.$inferSelect;
