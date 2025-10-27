// Lightweight LaTeX section parser using regex.
// Extracts custom rSection blocks and standard \section blocks.

export async function parseLatex(latexCode = '') {
  const sections = {};

  // rSection blocks: \begin{rSection}{Name} ... \end{rSection}
  const rSectionRegex = /\\begin\{rSection\}\{([^}]+)\}([\s\S]*?)\\end\{rSection\}/g;
  let m;
  while ((m = rSectionRegex.exec(latexCode))) {
    const name = m[1].trim();
    const content = m[2].trim();
    sections[name] = content;
  }

  // Standard \section{Name}
  const sectionRegex = /\\section\{([^}]+)\}([\s\S]*?)(?=\\section\{|\\end\{document\}|$)/g;
  while ((m = sectionRegex.exec(latexCode))) {
    const name = m[1].trim();
    const content = m[2].trim();
    if (!sections[name]) sections[name] = content;
  }

  // Basic fields if nothing parsed
  if (Object.keys(sections).length === 0) {
    sections.Body = latexCode;
  }
  return sections;
}