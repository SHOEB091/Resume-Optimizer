const axios = require('axios');

async function optimizeResume(sections, jd, userPrompt, apiType) {
  const prompt = `
You are a resume optimization expert. Optimize the resume sections for the JD. Preserve LaTeX class and commands. Integrate JD keywords naturally, highlight with \\textbf{}. Ensure ATS-friendliness (standard fonts, no tables/images, 1-page). Follow user instructions: ${userPrompt || 'None'}.
Resume sections: ${JSON.stringify(sections)}
JD: ${jd}
Output ONLY the full optimized LaTeX code, no explanations.
  `;

  try {
    if (apiType === 'gemini') {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data.candidates[0].content.parts[0].text;
    } else if (apiType === 'grok') {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',  // Adjust endpoint per xAI docs
        {
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000
        },
        { headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}`, 'Content-Type': 'application/json' } }
      );
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid apiType: Use "gemini" or "grok"');
    }
  } catch (error) {
    throw new Error(`GenAI API error (${apiType}): ${error.message}`);
  }
}

module.exports = { optimizeResume };