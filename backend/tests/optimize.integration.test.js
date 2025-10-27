import express from 'express';
import request from 'supertest';
import multer from 'multer';
import { jest } from '@jest/globals';

// Mock services to avoid external calls
jest.unstable_mockModule('../src/services/genaiService.js', () => ({
  optimizeWithGemini: async () => '\\documentclass{article}\n\\begin{document}\n\\section{Skills} React, Node.js \\end{document}'
}));

jest.unstable_mockModule('../src/services/pdfService.js', () => ({
  compileLatexToPdf: async () => ({ pdfPath: '/tmp/mock.pdf' })
}));

const { default: optimizeFactory } = await import('../src/controllers/optimizeResume.js');

const setupApp = () => {
  const app = express();
  app.use(express.json());
  const upload = multer({ storage: multer.memoryStorage() });
  app.post('/optimize', upload.single('latexFile'), optimizeFactory({ downloadsDir: '/tmp' }));
  return app;
};

describe('POST /optimize (integration, mocked)', () => {
  it('returns optimizedLatex, atsScore, and ids', async () => {
    const app = setupApp();
    const res = await request(app)
      .post('/optimize')
      .send({
        latex: '\\documentclass{article}\\begin{document}\\section{Experience} ... \\end{document}',
        jd: 'React and Node.js developer',
        userPrompt: 'Highlight backend'
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.optimizedLatex).toBeTruthy();
    expect(typeof res.body.atsScore).toBe('number');
    expect(res.body.downloadId).toBeTruthy();
  });
});
