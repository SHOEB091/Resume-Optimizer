[Resume Optimizer Backend - Node.js/Express]
  ├── Server Entry (index.js)
  │   ├── Port: 5000
  │   ├── Middleware: CORS, Multer (file uploads), JSON parsing
  │   ├── Routes:
  │   │   ├── GET /health: Checks server status
  │   │   ├── POST /optimize: Main endpoint (inputs: latex, jd, userPrompt, apiType)
  │   │   ├── GET /download/:id/:type: Serves PDF or LaTeX
  ├── Controllers (controllers/optimizeResume.js)
  │   ├── Orchestrates: Parse LaTeX → Optimize → ATS Score → PDF
  │   ├── Inputs: latex (text/file), jd, userPrompt, apiType (gemini/grok)
  │   ├── Outputs: optimizedLatex, pdfUrl, downloadId, atsScore, atsFeedback
  ├── Services
  │   ├── latexParser.js
  │   │   ├── Function: parseLatex()
  │   │   ├── Logic: tex-parser or regex to extract sections (e.g., rSection)
  │   │   ├── Output: JSON { sectionName: content }
  │   ├── genaiService.js
  │   │   ├── Function: optimizeResume()
  │   │   ├── APIs: Gemini (HTTPS POST), Grok (HTTPS POST)
  │   │   ├── Logic: Sends prompt with latex, jd, userPrompt
  │   │   ├── Output: Optimized LaTeX code
  │   ├── atsService.js
  │   │   ├── Function: calculateAtsScore()
  │   │   ├── Logic: Keyword matching, ATS compliance check
  │   │   ├── Output: { score, feedback }
  │   ├── pdfService.js
  │   │   ├── Function: compileLatexToPdf()
  │   │   ├── Logic: pdflatex or online compiler (e.g., latexonline.cc)
  │   │   ├── Output: PDF file path/URL
  ├── Utils (utils/)
  │   ├── keywordExtractor.js: Extracts keywords from JD
  │   ├── fileHelper.js: Manages temp files for PDF/LaTeX
  ├── Tests (tests/)
  │   ├── Jest: Unit tests for services, integration tests for endpoints
  ├── .env
  │   ├── Keys: GEMINI_API_KEY, GROK_API_KEY
  │   ├── Config: Temp file paths, port