// --- Normalization helpers ---
function normalize(str = '') {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, ' ') // keep simple tech tokens like c++, node.js
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTextFromLatex(latex) {
  return normalize(latex.replace(/\\[a-zA-Z]+(\{[^}]+\})?|\{[^}]+\}/g, ' ')); // strip LaTeX
}

// Canonical skills with alias variants we commonly see in JDs
const SKILL_ALIASES = {
  'react': ['react', 'reactjs', 'react.js'],
  'node.js': ['node.js', 'nodejs', 'node'],
  'express': ['express', 'expressjs', 'express.js'],
  'postgresql': ['postgresql', 'postgres', 'postgresql db', 'postgre'],
  'docker': ['docker'],
  'aws': ['aws', 'amazon web services'],
  'rest apis': ['rest', 'rest api', 'rest apis', 'http apis'],
  'typescript': ['typescript', 'ts'],
  'python': ['python'],
  'java': ['java'],
  'kubernetes': ['kubernetes', 'k8s']
};

export function extractKeywords(jdText) {
  const jd = normalize(jdText);
  const found = new Set();
  Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
    if (aliases.some(a => jd.includes(a))) found.add(canonical);
  });
  // Fallback: also include capitalized multi-word phrases (simple heuristic)
  const generic = (jdText.match(/\b[A-Z][a-zA-Z+.#]+(?:\s[A-Z][a-zA-Z+.#]+)*\b/g) || [])
    .map(s => s.toLowerCase());
  generic.forEach(g => found.add(g));
  return Array.from(found);
}

export function calculateAtsScore(optimizedLatex, jd) {
  const jdKeywords = extractKeywords(jd);
  const resumeText = extractTextFromLatex(optimizedLatex);

  const matches = jdKeywords.filter(keyword => {
    // consider aliases for matching
    const aliases = SKILL_ALIASES[keyword] || [keyword];
    return aliases.some(a => resumeText.includes(normalize(a)));
  });

  let score = jdKeywords.length
    ? Math.round((matches.length / jdKeywords.length) * 80)
    : 0;

  const isAtsFriendly = !optimizedLatex.includes('\\table') && !optimizedLatex.includes('\\includegraphics');
  score += isAtsFriendly ? 20 : 0;

  const feedback = matches.length < Math.ceil(jdKeywords.length / 2)
    ? 'Add more JD-specific keywords for better match'
    : 'Strong keyword alignment';

  return { score: Math.min(score, 100), feedback };
}
