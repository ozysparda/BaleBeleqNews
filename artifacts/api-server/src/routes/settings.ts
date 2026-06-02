import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

async function ensureSettings() {
  const all = await db.select().from(settingsTable).limit(1);
  if (all.length === 0) {
    const [s] = await db.insert(settingsTable).values({
      siteName: "BALE BELEQ NEWS",
      siteSlogan: "Informasi • Budaya • Aspirasi",
      siteDescription: "Portal berita profesional dengan identitas budaya Sasak Lombok",
      footerText: "© 2024 BALE BELEQ NEWS. Dari Bale Beleq, Untuk Publik.",
    }).returning();
    return s;
  }
  return all[0];
}

// GET /api/settings
router.get("/", async (_req, res) => {
  try {
    const settings = await ensureSettings();
    res.json({ ...settings, createdAt: settings.createdAt.toISOString(), updatedAt: settings.updatedAt.toISOString() });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/settings
router.patch("/", requireAuth, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const settings = await ensureSettings();
    const { siteName, siteSlogan, siteDescription, logoUrl, primaryColor, footerText, socialFacebook, socialInstagram, socialTwitter, socialYoutube } = req.body;

    const [result] = await db.update(settingsTable)
      .set({ siteName, siteSlogan, siteDescription, logoUrl, primaryColor, footerText, socialFacebook, socialInstagram, socialTwitter, socialYoutube, updatedAt: new Date() })
      .where(eq(settingsTable.id, settings.id))
      .returning();

    res.json({ ...result, createdAt: result.createdAt.toISOString(), updatedAt: result.updatedAt.toISOString() });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
