import axios from 'axios';

function sanitizeModelLatex(raw) {
  if (!raw) return '';
  let text = String(raw).trim();
  // Normalize newlines
  text = text.replace(/\r\n?/g, '\n');
  // If fenced code block present, extract the inner content
  const fenceMatch = text.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) {
    text = fenceMatch[1].trim();
  } else {
    // Remove any stray starting/ending fences if present on separate lines
    text = text
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/\n```$/, '')
      .trim();
  }
  // Ensure starts at LaTeX doc if model prefixed comments or prose
  const idx = text.indexOf('\\documentclass');
  if (idx > 0) text = text.slice(idx);
  // Best-effort ensure it ends with \end{document}
  if (!/\\end\{document\}\s*$/.test(text)) {
    text = text + (text.endsWith('\n') ? '' : '\n') + '\\end{document}\n';
  }
  return text;
}

// Robust Gemini call: try v1 with gemini-1.5-flash first, then fall back to v1beta if needed.
async function resolveModel(apiKey) {
  const candidates = ['v1', 'v1beta'];
  for (const apiVersion of candidates) {
    try {
      const { data } = await axios.get(
        `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`
      );
      const models = data?.models || [];
      // Prefer flash variants that support generateContent
      const pick = (predicate) =>
        models.find(m => predicate(m) && (m.supportedGenerationMethods?.includes?.('generateContent')));
      const preferred =
        pick(m => /gemini-1\.5-flash(-\d+)?$/.test(m.name)) ||
        pick(m => /gemini-1\.5-flash/.test(m.name)) ||
        pick(m => /flash/.test(m.name)) ||
        pick(m => /gemini-1\.5/.test(m.name));
      if (preferred) {
        return { apiVersion, model: preferred.name.split('/').pop() };
      }
    } catch (e) {
      // try next apiVersion
    }
  }
  throw new Error('No suitable Gemini model with generateContent found for this API key');
}

export async function optimizeWithGemini(sections, jd, userPrompt = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing in environment');

  const prompt = `You are a resume optimization expert. Given resume sections and JD, output ONLY optimized LaTeX. Incorporate JD keywords naturally, highlight with \\textbf{}, restructure for relevance, ensure ATS-friendly (standard fonts, no tables/images, 1-page), concise. Preserve original class/commands. Follow user: [${userPrompt}]. Resume: ${JSON.stringify(
    sections
  )}. JD: ${jd}. Output ONLY LaTeX.`;
  
  // Strengthen the instruction to include a machine-readable change log as LaTeX comments
  const enhancedPrompt = `${prompt}\n\nStrict formatting requirements (must follow exactly):\n- At the very top, add a LaTeX comment meta block with precise changes and required user follow-ups:\n% === META START ===\n% CHANGES:\n% - List concrete edits you applied (section + short description).\n% TODO:\n% - List additional info needed from the user to further improve the resume (if any).\n% === META END ===\n- After the meta block, output the full LaTeX document starting with \\documentclass...\n- Do not include any prose outside LaTeX. Keep the meta block as comments so it doesn't affect compilation.\n- Apply only what the user requested; avoid fabricating details. If data is missing, keep original text and add a TODO instead.`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
  };

  try {
    const { apiVersion, model } = await resolveModel(apiKey);
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
    const { data } = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    let text = data?.candidates?.[0]?.content?.parts?.map?.(p => p.text).join('')?.trim();
    if (!text && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = data.candidates[0].content.parts[0].text.trim();
    }
    if (!text) throw new Error('Gemini returned empty result');
    const sanitized = sanitizeModelLatex(text);
    if (!/\\documentclass/.test(sanitized)) {
      return `\\documentclass{article}\n\\begin{document}\n${sanitized}\n\\end{document}`;
    }
    return sanitized;
  } catch (err) {
    const apiErr = err?.response?.data?.error?.message || err?.message || 'Unknown Gemini error';
    throw new Error(`Failed to optimize resume with Gemini: ${apiErr}`);
  }
}
