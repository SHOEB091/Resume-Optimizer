import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { parseLatex } from '../services/latexParser.js';
import { optimizeWithGemini } from '../services/genaiService.js';
import { calculateAtsScore, extractKeywords, extractTextFromLatex } from '../services/atsService.js';
import { compileLatexToPdf } from '../services/pdfService.js';
import { extractMeta } from '../utils/latexMeta.js';

export default function optimizeResumeFactory({ downloadsDir }) {
  return async function optimize(req, res) {
    try {
      let latex = req.body.latex || '';
      if (req.file && req.file.buffer) {
        latex = req.file.buffer.toString('utf8');
      }
      const { jd = '', userPrompt = '' } = req.body;
      if (!latex || !jd) {
        return res.status(400).json({ error: 'Both latex and jd are required' });
      }

      // Step 1: Parse LaTeX into sections
      const sections = await parseLatex(latex);

      // Step 2: Optimize with Gemini
      const optimizedLatex = await optimizeWithGemini(sections, jd, userPrompt);
  const meta = extractMeta(optimizedLatex);

  // Step 3: ATS score + details
  const { score, feedback } = calculateAtsScore(optimizedLatex, jd);
  const jdKeywords = extractKeywords(jd);
  const resumeText = extractTextFromLatex(optimizedLatex).toLowerCase();
  const matched = jdKeywords.filter(k => resumeText.includes(k.toLowerCase()));
  const missing = jdKeywords.filter(k => !resumeText.includes(k.toLowerCase()));
  const coverage = jdKeywords.length ? Math.round((matched.length / jdKeywords.length) * 100) : 0;

      // Step 4: Persist files and compile PDF
      const downloadId = uuidv4();
      const texPath = `${downloadsDir}/${downloadId}.tex`;
      await fs.writeFile(texPath, optimizedLatex, 'utf8');

      let pdfOk = false;
      let pdfExternalUrl = null;
      try {
        const result = await compileLatexToPdf(optimizedLatex, downloadId, downloadsDir);
        if (typeof result === 'string') {
          pdfOk = true;
        } else if (result && result.pdfPath) {
          pdfOk = true;
        } else if (result && result.pdfExternalUrl) {
          pdfExternalUrl = result.pdfExternalUrl;
        }
      } catch (e) {
        pdfOk = false;
      }

      res.json({
        optimizedLatex,
  pdfUrl: pdfOk ? `/downloads/${downloadId}.pdf` : null,
  pdfExternalUrl,
        downloadId,
        atsScore: score,
        atsFeedback: feedback,
        atsDetails: {
          jdKeywords,
          matched,
          missing,
          coverage
        },
        changeLog: meta.changes,
        nextActions: meta.todo
      });
    } catch (error) {
      console.error('Optimize error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}