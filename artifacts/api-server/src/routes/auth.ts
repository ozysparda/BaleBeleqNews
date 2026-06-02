import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

// GET /api/auth/setup-status
router.get("/setup-status", async (_req, res) => {
  try {
    const admins = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "SUPER_ADMIN"))
      .limit(1);
    res.json({ setupRequired: admins.length === 0 });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/setup
router.post("/setup", async (req, res) => {
  try {
    const admins = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "SUPER_ADMIN"))
      .limit(1);
    if (admins.length > 0) {
      res.status(409).json({ error: "Setup already completed" });
      return;
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ name, email, password: hashed, role: "SUPER_ADMIN" })
      .returning();

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
