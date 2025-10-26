function extractKeywords(text) {
  // Simple regex for keywords - improve with GenAI or NLP
  return text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [];  // e.g., "Machine Learning"
}

function extractTextFromLatex(latex) {
  return latex.replace(/\\[a-zA-Z]+(\{[^}]+\})?|\{[^}]+\}/g, '').trim();  // Strip LaTeX tags
}

function calculateAtsScore(optimizedLatex, jd) {
  const jdKeywords = extractKeywords(jd);
  const resumeText = extractTextFromLatex(optimizedLatex);
  const matches = jdKeywords.filter(keyword => 
    resumeText.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  let score = Math.round((matches / jdKeywords.length) * 80) || 0;
  const isAtsFriendly = !optimizedLatex.includes('\\table') && !optimizedLatex.includes('\\includegraphics');
  score += isAtsFriendly ? 20 : 0;
  const feedback = matches < jdKeywords.length / 2 ? 'Add more JD-specific keywords for better match' : 'Strong keyword alignment';
  return { score: Math.min(score, 100), feedback };
}

module.exports = { calculateAtsScore };