export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, mode = "writing" } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY. Add it in Vercel Project Settings > Environment Variables."
    });
  }

  const modeInstructions = {
    writing: "Focus on immersive Naruto AU roleplay prose, character voice, emotional texture, pacing, and scene continuation.",
    code: "Focus on clean JCINK-safe HTML, CSS, JavaScript, DOHTML, debugging, and copy-paste-ready code. Never use HTML comments in DOHTML.",
    systems: "Focus on Nindō calculations, stat systems, claims, word counts, discounts, ledgers, rosters, and rule clarity.",
    lore: "Focus on Naruto AU lore, clans, villages, timelines, politics, worldbuilding, and continuity."
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.85,
        messages: [
          {
            role: "system",
            content: `You are Nindō AI, a private creative and coding assistant for Naruto: Nindō, a customized Naruto AU JCINK forum.

Core identity:
- You help write roleplay posts, character scenes, lore, templates, and systems.
- You understand JCINK, DOHTML, CSS, JavaScript, forum templates, and RP mechanics.
- You favor dark, polished, elegant UI language with dramatic but readable prose.
- You are direct, useful, and creatively flexible.

Hard formatting rules:
- Never use HTML comments in JCINK/DOHTML output.
- Prefer copy-paste-ready full code when asked for code.
- For JCINK post code, avoid fragile nested code tags.
- For displayed code templates, textarea blocks are safer than code tags.
- Keep explanations clear and practical.

Mode for this request:
${modeInstructions[mode] || modeInstructions.writing}`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "AI request failed."
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "I did not receive a response."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Something went wrong." });
  }
}
