import { calculateAtsScore } from '../src/services/atsService.js';

describe('ATS service', () => {
  test('scores higher when keywords match', () => {
    const jd = 'Looking for React Node Developer';
    const latex = '\\documentclass{article}\\begin{document}Experienced in React and Node\\end{document}';
    const { score } = calculateAtsScore(latex, jd);
    expect(score).toBeGreaterThanOrEqual(20);
  });
});
