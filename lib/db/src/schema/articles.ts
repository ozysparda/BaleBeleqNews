import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const articleStatusEnum = pgEnum("article_status", ["DRAFT", "PENDING_REVIEW", "PUBLISHED"]);

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  status: articleStatusEnum("status").notNull().default("DRAFT"),
  isBreaking: boolean("is_breaking").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  authorId: integer("author_id").notNull().references(() => usersTable.id),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
