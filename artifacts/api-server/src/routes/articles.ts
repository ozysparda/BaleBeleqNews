import { Router } from "express";
import { db, articlesTable, usersTable, categoriesTable, activityTable } from "@workspace/db";
import { eq, desc, and, ilike, or, ne, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() + "-" + Date.now();
}

async function enrichArticle(article: typeof articlesTable.$inferSelect) {
  const [author] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, createdAt: usersTable.createdAt }).from(usersTable).where(eq(usersTable.id, article.authorId)).limit(1);
  let category = null;
  if (article.categoryId) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, article.categoryId)).limit(1);
    category = cat ? { ...cat, articleCount: 0 } : null;
  }
  return {
    ...article,
    category,
    author: author ? { ...author, createdAt: author.createdAt.toISOString() } : null,
    publishedAt: article.publishedAt?.toISOString() || null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

// GET /api/articles
router.get("/", async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "10"));
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId)) : null;
    const search = req.query.search ? String(req.query.search) : null;
    const status = req.query.status ? String(req.query.status) : null;

    const conditions = [];

    // Public endpoint: if no status filter from admin, show only PUBLISHED
    const authHeader = req.headers.authorization;
    if (!authHeader && !status) {
      conditions.push(eq(articlesTable.status, "PUBLISHED"));
    } else if (status && ["DRAFT", "PENDING_REVIEW", "PUBLISHED"].includes(status)) {
      conditions.push(eq(articlesTable.status, status as any));
    }

    if (categoryId) conditions.push(eq(articlesTable.categoryId, categoryId));
    if (search) conditions.push(or(ilike(articlesTable.title, `%${search}%`), ilike(articlesTable.excerpt, `%${search}%`)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(articlesTable).where(where);
    const articles = await db.select().from(articlesTable).where(where).orderBy(desc(articlesTable.createdAt)).limit(limit).offset(offset);

    const enriched = await Promise.all(articles.map(enrichArticle));

    res.json({ articles: enriched, total: Number(count), page, limit });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/articles/breaking
router.get("/breaking", async (_req, res) => {
  try {
    const articles = await db.select().from(articlesTable)
      .where(and(eq(articlesTable.isBreaking, true), eq(articlesTable.status, "PUBLISHED")))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(5);
    const enriched = await Promise.all(articles.map(enrichArticle));
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/articles/featured
router.get("/featured", async (_req, res) => {
  try {
    const articles = await db.select().from(articlesTable)
      .where(and(eq(articlesTable.isFeatured, true), eq(articlesTable.status, "PUBLISHED")))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(5);
    const enriched = await Promise.all(articles.map(enrichArticle));
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/articles/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    // Increment view count
    await db.update(articlesTable).set({ viewCount: article.viewCount + 1 }).where(eq(articlesTable.id, id));
    const enriched = await enrichArticle({ ...article, viewCount: article.viewCount + 1 });
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/articles
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, excerpt, content, coverImage, categoryId, isBreaking, isFeatured, status } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }
    const slug = slugify(title);
    const [article] = await db.insert(articlesTable).values({
      title, slug, excerpt, content, coverImage,
      categoryId: categoryId || null,
      isBreaking: isBreaking || false,
      isFeatured: isFeatured || false,
      status: status || "DRAFT",
      authorId: req.user!.id,
    }).returning();

    await db.insert(activityTable).values({
      action: "Membuat berita",
      articleTitle: title,
      userName: req.user!.email,
      userId: req.user!.id,
      articleId: article.id,
    });

    const enriched = await enrichArticle(article);
    res.status(201).json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/articles/:id
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    // Wartawan can only edit their own articles
    if (req.user!.role === "WARTAWAN" && existing.authorId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { title, excerpt, content, coverImage, categoryId, isBreaking, isFeatured, status } = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isBreaking !== undefined) updateData.isBreaking = isBreaking;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (status !== undefined) updateData.status = status;

    const [article] = await db.update(articlesTable).set(updateData).where(eq(articlesTable.id, id)).returning();
    const enriched = await enrichArticle(article);
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/articles/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    if (req.user!.role === "WARTAWAN" && existing.authorId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await db.delete(articlesTable).where(eq(articlesTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/articles/:id/publish
router.post("/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!["SUPER_ADMIN", "EDITOR"].includes(req.user!.role)) {
      res.status(403).json({ error: "Only editors can publish articles" });
      return;
    }
    const id = parseInt(req.params.id);
    const [article] = await db.update(articlesTable)
      .set({ status: "PUBLISHED", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(articlesTable.id, id))
      .returning();
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    await db.insert(activityTable).values({
      action: "Mempublish berita",
      articleTitle: article.title,
      userName: req.user!.email,
      userId: req.user!.id,
      articleId: article.id,
    });

    const enriched = await enrichArticle(article);
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/articles/:id/submit
router.post("/:id/submit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [article] = await db.update(articlesTable)
      .set({ status: "PENDING_REVIEW", updatedAt: new Date() })
      .where(eq(articlesTable.id, id))
      .returning();
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    await db.insert(activityTable).values({
      action: "Mengajukan review berita",
      articleTitle: article.title,
      userName: req.user!.email,
      userId: req.user!.id,
      articleId: article.id,
    });

    const enriched = await enrichArticle(article);
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/articles/:id/related
router.get("/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!article) {
      res.json([]);
      return;
    }

    const related = await db.select().from(articlesTable)
      .where(and(
        eq(articlesTable.status, "PUBLISHED"),
        ne(articlesTable.id, id),
        article.categoryId ? eq(articlesTable.categoryId, article.categoryId) : sql`true`
      ))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(4);

    const enriched = await Promise.all(related.map(enrichArticle));
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
