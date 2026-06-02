import { Router } from "express";
import { db, articlesTable, usersTable, categoriesTable, activityTable } from "@workspace/db";
import { eq, count, sum, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

// GET /api/stats/dashboard
router.get("/dashboard", requireAuth, async (_req, res) => {
  try {
    const [totalArticles] = await db.select({ count: count() }).from(articlesTable);
    const [published] = await db.select({ count: count() }).from(articlesTable).where(eq(articlesTable.status, "PUBLISHED"));
    const [draft] = await db.select({ count: count() }).from(articlesTable).where(eq(articlesTable.status, "DRAFT"));
    const [pending] = await db.select({ count: count() }).from(articlesTable).where(eq(articlesTable.status, "PENDING_REVIEW"));
    const [totalUsers] = await db.select({ count: count() }).from(usersTable);
    const [totalCategories] = await db.select({ count: count() }).from(categoriesTable);
    const [views] = await db.select({ total: sum(articlesTable.viewCount) }).from(articlesTable);

    res.json({
      totalArticles: Number(totalArticles.count),
      publishedArticles: Number(published.count),
      draftArticles: Number(draft.count),
      pendingArticles: Number(pending.count),
      totalUsers: Number(totalUsers.count),
      totalCategories: Number(totalCategories.count),
      totalViews: Number(views.total || 0),
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/articles-by-category
router.get("/articles-by-category", requireAuth, async (_req, res) => {
  try {
    const result = await db
      .select({
        categoryName: categoriesTable.name,
        count: count(),
        color: categoriesTable.color,
      })
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .groupBy(categoriesTable.name, categoriesTable.color)
      .orderBy(desc(count()));

    res.json(result.map((r) => ({ categoryName: r.categoryName, count: Number(r.count), color: r.color })));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/recent-activity
router.get("/recent-activity", requireAuth, async (_req, res) => {
  try {
    const activities = await db
      .select()
      .from(activityTable)
      .orderBy(desc(activityTable.createdAt))
      .limit(20);

    res.json(activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
