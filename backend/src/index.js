import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import optimizeResume from './controllers/optimizeResume.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Env-driven configuration
const REQUEST_SIZE_LIMIT = process.env.REQ_SIZE_LIMIT || '2mb';
const FILE_TTL_HOURS = Number(process.env.FILE_TTL_HOURS || 2); // default 2 hours
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting (per IP)
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: Number(process.env.RATE_LIMIT_MAX || 50), // 50 requests/5 min by default
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Multer memory storage for .tex file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Downloads dir (served statically)
const downloadsDir = process.env.DOWNLOADS_DIR
  ? path.isAbsolute(process.env.DOWNLOADS_DIR)
    ? process.env.DOWNLOADS_DIR
    : path.join(__dirname, '..', process.env.DOWNLOADS_DIR)
  : path.join(__dirname, '..', 'downloads');
await fs.ensureDir(downloadsDir);
app.use('/downloads', express.static(downloadsDir));

// Health
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Diagnostics: list available models for the configured key
app.get('/models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'GEMINI_API_KEY missing in server env' });
    const apiVersion = (req.query.v === 'v1beta') ? 'v1beta' : 'v1';
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;
    const { data } = await axios.get(url);
    const names = (data.models || []).map(m => m.name);
    res.json({ apiVersion, count: names.length, models: names });
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// Optimize
app.post('/optimize', upload.single('latexFile'), optimizeResume({ downloadsDir }));

// Download endpoint
app.get('/download/:id/:type', async (req, res) => {
  const { id, type } = req.params; // type: pdf|tex
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeType = type === 'pdf' ? 'pdf' : 'tex';
  const filePath = path.join(downloadsDir, `${safeId}.${safeType}`);
  if (!(await fs.pathExists(filePath))) return res.status(404).json({ error: 'File not found' });
  res.download(filePath, `optimized_resume.${safeType}`);
});

// Periodic cleanup of old files (> 2h)
const TWO_HOURS = FILE_TTL_HOURS * 60 * 60 * 1000;
setInterval(async () => {
  const files = await fs.readdir(downloadsDir);
  const now = Date.now();
  await Promise.all(
    files.map(async (fname) => {
      const fp = path.join(downloadsDir, fname);
      try {
        const stat = await fs.stat(fp);
        if (now - stat.mtimeMs > TWO_HOURS) await fs.remove(fp);
      } catch {}
    })
  );
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Resume Optimizer API listening on ${PORT}`);
});