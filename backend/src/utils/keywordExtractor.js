// Expand extractKeywords from atsService or use GenAI for better accuracy
module.exports = { extractKeywords: (text) => text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [] };