import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    isActive INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add a default admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (name, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)").run(
    "Admin Casis Gacor",
    "admin@casisgacor.com",
    "admin123",
    "admin",
    1
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (name, email, password, isActive) VALUES (?, ?, ?, ?)").run(name, email, password, 0);
      const newUser = db.prepare("SELECT id, name, email, role, isActive FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json({ ...newUser, isActive: !!newUser.isActive });
    } catch (error) {
      res.status(400).json({ error: "Email sudah terdaftar" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT id, name, email, role, isActive FROM users WHERE email = ? AND password = ?").get(email, password);
      if (user) {
        res.json({ ...user, isActive: !!user.isActive });
      } else {
        res.status(401).json({ error: "Email atau password salah" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login gagal" });
    }
  });

  // API Routes
  app.get("/api/users", (req, res) => {
    try {
      const users = db.prepare("SELECT id, name, email, role, isActive, createdAt FROM users ORDER BY createdAt DESC").all();
      res.json(users.map(u => ({ ...u, isActive: !!u.isActive })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", (req, res) => {
    const { name, email, password, role, isActive } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (name, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)").run(
        name, 
        email, 
        password || '123456', 
        role || 'user',
        isActive ? 1 : 0
      );
      const newUser = db.prepare("SELECT id, name, email, role, isActive, createdAt FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json({ ...newUser, isActive: !!newUser.isActive });
    } catch (error) {
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.patch("/api/users/:id/activate", (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
      db.prepare("UPDATE users SET isActive = ? WHERE id = ?").run(isActive ? 1 : 0, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
