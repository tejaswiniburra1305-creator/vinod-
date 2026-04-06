import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

const DATA_FILE = path.join(process.cwd(), "data.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const defaultData = { 
    students: [
      {
        id: "1",
        name: "Prof. Anderson",
        rollNumber: "PROF001",
        age: 45,
        grade: "Faculty",
        email: "anderson@edufocus.edu",
        phone: "+1 234 567 8900",
        aadharNumber: "1234 5678 9012",
        parentContact: "N/A",
        attendanceStatus: "present",
        lastAttentionScore: 100,
        feedback: ["Welcome, Professor!"],
        role: "teacher"
      }
    ], 
    sessions: [], 
    attendance: [] 
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/students", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    res.json(data.students);
  });

  app.post("/api/students", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const newStudent = { ...req.body, id: Date.now().toString() };
    data.students.push(newStudent);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(newStudent);
  });

  app.put("/api/students/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const index = data.students.findIndex((s: any) => s.id === req.params.id);
    if (index !== -1) {
      data.students[index] = { ...data.students[index], ...req.body };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.json(data.students[index]);
    } else {
      res.status(404).json({ error: "Student not found" });
    }
  });

  app.get("/api/sessions", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    res.json(data.sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    data.sessions.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ status: "ok" });
  });

  app.get("/api/attendance", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    res.json(data.attendance || []);
  });

  app.post("/api/attendance", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (!data.attendance) data.attendance = [];
    const record = { 
      ...req.body, 
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    data.attendance.push(record);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(record);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
