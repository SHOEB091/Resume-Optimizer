const { parseLatex } = require('../services/latexParser');
const { optimizeResume } = require('../services/genaiService');
const { calculateAtsScore } = require('../services/atsService');
const { compileLatexToPdf } = require('../services/pdfService');

async function optimize(req, res) {
  try {
    let latex = req.body.latex;
    if (req.file) {
      latex = fs.readFileSync(req.file.path, 'utf8');
    }
    const { jd, userPrompt = '', apiType = 'gemini' } = req.body;

    // Step 1: Parse LaTeX
    const sections = await parseLatex(latex);

    // Step 2: Optimize with GenAI
    const optimizedLatex = await optimizeResume(sections, jd, userPrompt, apiType);

    // Step 3: ATS Score
    const { score, feedback } = calculateAtsScore(optimizedLatex, jd);

    // Step 4: Compile PDF
    const downloadId = Date.now().toString();
    const pdfPath = await compileLatexToPdf(optimizedLatex, downloadId);

    res.json({
      optimizedLatex,
      pdfUrl: `/download/${downloadId}/pdf`,
      downloadId,
      atsScore: score,
      atsFeedback: feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { optimize };