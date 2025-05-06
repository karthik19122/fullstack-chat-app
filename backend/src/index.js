import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs"; // Import fs to check for folder existence and create it
import multer from "multer"; // Import multer for file uploads
import "./lib/scheduledMessages.js"; // Ensure the cron job is imported correctly

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Ensure the 'uploads' folder exists, create it if it doesn't
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Store uploaded files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Ensure unique filenames using current timestamp
  }
});

// File filter to allow PDFs, JPEG, JPG, PNG, and MP4 videos
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|jpeg|jpg|png|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only PDF, JPEG, JPG, PNG, and MP4 files are allowed"), false);
    }
  },
  limits: { fileSize: 1000000000 } // Limit file size to 1GB (optional)
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL (adjust as necessary)
    credentials: true,
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Upload file route
app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log("📦 /api/upload route called"); // Debug log

  try {
    if (!req.file) {
      console.log("⚠️ No file found in the request"); // Debug log
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("✅ File received:", req.file.originalname); // Debug log

    // Construct the file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    // Return the URL of the uploaded file
    return res.status(200).json({ fileUrl });
  } catch (error) {
    console.error("❌ Upload error:", error.message); // Debug log
    return res.status(500).json({ error: "Server Error: " + error.message });
  }
});

// Serve static files from the 'uploads' folder
app.use("/uploads", express.static(uploadsDir));

// Production settings
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start server
server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});
