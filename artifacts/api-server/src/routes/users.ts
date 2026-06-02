import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

// GET /api/users
router.get("/", requireAuth, requireRole("SUPER_ADMIN"), async (_req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(usersTable.name);
    res.json(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users
router.post("/", requireAuth, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const hashed = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ name, email, password: hashed, role }).returning();
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/:id
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, role } = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
