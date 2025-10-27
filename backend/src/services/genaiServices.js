const axios = require('axios');

async function optimizeResume(sections, jd, userPrompt, apiType = 'gemini') {  // apiType is now fixed but kept for compatibility
  if (apiType !== 'gemini') {
    throw new Error('Only Gemini API is supported for free access');
  }

  const prompt = `
You are a resume optimization expert. Given the resume sections in LaTeX code and a job description (JD), output ONLY the full optimized LaTeX code. Make it a perfect fit by:
- Incorporating key JD keywords naturally (e.g., skills like "React.js", "Node.js").
- Highlighting matching keywords with \\textbf{}.
- Restructuring sections for relevance (e.g., prioritize matching experience).
- Ensuring ATS-friendliness: Use standard fonts, no tables/images, plain structure, 1-page if possible.
- Keeping it concise and impactful.
- Preserve the original LaTeX class and commands (e.g., resume class, rSection).
- Follow user instructions: ${userPrompt || 'None'}.

Resume sections:
${JSON.stringify(sections, null, 2)}

Job Description:
${jd}

Output ONLY the full optimized LaTeX code, no explanations or additional text.
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured in .env');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,  // Low for consistent output
          maxOutputTokens: 4096  // Enough for full LaTeX
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const optimizedLatex = response.data.candidates[0].content.parts[0].text.trim();
    if (!optimizedLatex.includes('\\documentclass')) {
      throw new Error('Invalid optimization output: Missing LaTeX structure');
    }

    return optimizedLatex;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error(`Failed to optimize resume with Gemini: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = { optimizeResume };