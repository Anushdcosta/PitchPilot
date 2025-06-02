import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { generatePitch } from "./pitchGen.js";
import { v4 as uuidv4 } from 'uuid';
import { refineIdea } from "./refineIdea.js";


dotenv.config(); // Don't forget to call this

const app = express();
const port = process.env.PORT || 3000;
const storedPitches = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate pitch and image endpoint
app.post('/generate', async (req, res) => {
  let { keywords } = req.body;
  try {
    console.log('Generating pitch for keywords:', keywords);
    const rawKeywords = req.body.keywords;
    keywords = rawKeywords?.trim() || "Generate a completely random, creative startup idea with no theme";

    const pitch = await generatePitch(keywords);
    const pitch2 = await generatePitch(keywords + "- another idea");
    console.log(pitch, pitch2);
    pitch.id = uuidv4(); // before pushing to storedPitches
    pitch2.id = uuidv4();
    storedPitches.push(pitch);
    storedPitches.push(pitch2);
    res.json({
      pitches: [pitch, pitch2]
    });
    
  } catch (err) {
    console.error('Error in /generate:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ 
      error: "Failed to generate content",
      details: errorMessage
    });
  }
});
app.get('/pitch/:id', (req, res) => {
  const pitch = storedPitches.find(p => p.id === req.params.id);
  if (!pitch) return res.status(404).json({ error: "Not found" });
  res.json(pitch);
});
app.post("/remix", async (req, res) => {
  const { pitch } = req.body;
  console.log(pitch)

  if (!pitch || !pitch.name) {
    return res.status(400).json({ error: "Missing original pitch." });
  }

  try {
    const remix = await generatePitch(`Give me an alternate version of this idea: ${pitch.name} - ${pitch.oneLiner}, Change the name and other info by a bit`);
    res.json({ remix });
  } catch (err) {
    console.error("Remix error:", err);
    res.status(500).json({ error: "Failed to remix pitch." });
  }
});
// routes/refine.ts (or directly in app.js)

app.post("/refine", async (req, res) => {
  const { pitch, answers } = req.body;

  if (!pitch || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid input format" });
  }

  try {
    const summary = await refineIdea(pitch, answers);
    res.json({ summary });
  } catch (err) {
    console.error("Refinement failed:", err);
    res.status(500).json({ error: "Failed to refine idea" });
  }
});


// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

module.exports = app;
