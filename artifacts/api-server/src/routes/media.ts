import { Router } from "express";
import { db, mediaTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

// GET /api/media
router.get("/", requireAuth, async (_req, res) => {
  try {
    const media = await db.select().from(mediaTable).orderBy(desc(mediaTable.createdAt));
    res.json(media.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/media
router.post("/", requireAuth, async (req, res) => {
  try {
    const { filename, url, type, size } = req.body;
    if (!filename || !url || !type) {
      res.status(400).json({ error: "Filename, url, and type are required" });
      return;
    }
    const [media] = await db.insert(mediaTable).values({ filename, url, type, size }).returning();
    res.status(201).json({ ...media, createdAt: media.createdAt.toISOString() });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/media/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(mediaTable).where(eq(mediaTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
