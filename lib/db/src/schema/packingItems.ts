import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packingItemsTable = pgTable("packing_items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("General"),
  isPacked: boolean("is_packed").notNull().default(false),
});

export const insertPackingItemSchema = createInsertSchema(packingItemsTable).omit({ id: true });
export type InsertPackingItem = z.infer<typeof insertPackingItemSchema>;
export type PackingItem = typeof packingItemsTable.$inferSelect;
