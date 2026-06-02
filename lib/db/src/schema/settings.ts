import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("BALE BELEQ NEWS"),
  siteSlogan: text("site_slogan"),
  siteDescription: text("site_description"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  footerText: text("footer_text"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialYoutube: text("social_youtube"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
