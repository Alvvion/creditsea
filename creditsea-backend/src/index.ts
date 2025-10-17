import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { parseStringPromise } from "xml2js";
import { extractCreditReportData } from "./utils/functions";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserReport from "./models/xmlData";
import type { NextFunction, Request, Response } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.gc8vt2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const uploadDir = path.resolve("./uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    callback(null, uploadDir);
  },
  filename(req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xml") {
      return callback(new Error("Only XML files are allowed"));
    }
    callback(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ message: "Backend is running successfully!" });
});

app.post("/upload", upload.single("xmlData"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No XML file uploaded" });

    const xmlFilePath = req.file.path;
    const xmlContent = fs.readFileSync(xmlFilePath, "utf-8");

    const parsedXml = await parseStringPromise(xmlContent);
    const creditReportData = extractCreditReportData(parsedXml);

    const savedDoc = await UserReport.create(creditReportData);

    res.status(200).json({
      message: "XML file uploaded and parsed successfully!",
      data: creditReportData,
      dbId: savedDoc._id.toString(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to parse or save XML file" });
  }
});

// Global error handler
app.use(
  (
    err: { message: string },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Unhandled Error:", err.message);
    res.status(500).json({
      error: err.message || "Something went wrong",
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;
