const { parse } = require('tex-parser');  // npm i tex-parser

function extractContent(node) {
  // Simple text extraction - expand as needed
  return node.content ? node.content.map(c => c.content || c).join(' ') : '';
}

async function parseLatex(latexCode) {
  try {
    const parsed = parse(latexCode);
    const sections = {};
    // Handle custom rSection or standard \section
    parsed.content.forEach(node => {
      if (node.command === 'begin' && node.args && node.args[0]?.content === 'rSection') {
        const sectionName = node.args[1]?.content || 'Unknown';
        sections[sectionName] = extractContent(node);
      } else if (node.command === 'section') {
        sections[node.args[0].content] = extractContent(node);
      }
    });
    return sections;
  } catch (e) {
    // Fallback regex for common patterns
    const sectionRegex = /\\begin\{rSection\}\{([^}]+)\}([\s\S]*?)\\end\{rSection\}/g;
    const sections = {};
    let match;
    while ((match = sectionRegex.exec(latexCode))) {
      sections[match[1]] = match[2].trim();
    }
    return sections;
  }
}

module.exports = { parseLatex };