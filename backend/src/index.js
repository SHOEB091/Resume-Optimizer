require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const { optimize } = require('./controllers/optimizeResume');


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temp dir for PDFs
const TEMP_DIR = process.env.TEMP_DIR || './temp';
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// Multer for file uploads (LaTeX .tex files)
const upload = multer({ dest: TEMP_DIR });

// Routes
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Basic /optimize endpoint (placeholder - will expand)
// app.post('/optimize', upload.single('latexFile'), async (req, res) => {
//   try {
//     const { latex, jd, userPrompt, apiType } = req.body;
//     // Placeholder: Call controller
//     res.json({ message: 'Optimization in progress', inputs: { latex, jd, userPrompt, apiType } });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
app.post('/optimize', upload.single('latexFile'), optimize);

// Download endpoint (placeholder)
app.get('/download/:id/:type', (req, res) => {
  const { id, type } = req.params;
  const filePath = path.join(TEMP_DIR, `${id}.${type}`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `optimized_resume.${type}`, (err) => {
      if (err) res.status(500).json({ error: 'Download failed' });
      // Cleanup temp file
      fs.unlinkSync(filePath);
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});