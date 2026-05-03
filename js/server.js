import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI setup
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// ✅ AI REPORT ROUTE
app.post("/generate-report", async (req, res) => {
  const projects = req.body.projects;

  if (!projects || projects.length === 0) {
    return res.status(400).json({ error: "No project data provided" });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a senior business analyst. Analyze project data and return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `
Return ONLY JSON in this format:

{
  "summary": "overall project summary",
  "risks": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"],
   "decisions": ["decision1"],
  "insights": ["insight1"],
  "priority_actions": ["action1", "action2"]
}

Analyze the following project data:
${JSON.stringify(projects)}
`,
        },
      ],
      temperature: 0.3,
    });

    let aiText = response.choices[0].message.content;

    // Try parsing AI response
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      // fallback if AI returns bad JSON
      return res.json({
        summary: aiText,
        risks: [],
        recommendations: [],
        decisions: [],
        insights: [],
        priority_actions: [],
      });
    }

    res.json(parsed);
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "Failed to generate AI report" });
  }
});

// Server start
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});