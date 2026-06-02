import { Router } from "express";
import { db, categoriesTable, articlesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

// GET /api/categories
router.get("/", async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    // Get article counts
    const counts = await db
      .select({ categoryId: articlesTable.categoryId, count: count() })
      .from(articlesTable)
      .groupBy(articlesTable.categoryId);
    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));
    const result = categories.map((cat) => ({
      ...cat,
      articleCount: countMap.get(cat.id) || 0,
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/categories
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "EDITOR"), async (req, res) => {
  try {
    const { name, slug, description, color } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: "Name and slug are required" });
      return;
    }
    const [cat] = await db.insert(categoriesTable).values({ name, slug, description, color }).returning();
    res.status(201).json({ ...cat, articleCount: 0 });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(400).json({ error: "Category slug already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/categories/:id
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN", "EDITOR"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, description, color } = req.body;
    const [cat] = await db
      .update(categoriesTable)
      .set({ name, slug, description, color, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ ...cat, articleCount: 0 });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
