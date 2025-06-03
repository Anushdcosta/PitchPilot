import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { generatePitch } from "./pitchGen.js";
import { v4 as uuidv4 } from 'uuid';
import { refineIdea } from "./refineIdea.js";
import { regenerateField } from "./FieldRefiner.js";

dotenv.config(); 

const app = express();
const port = process.env.PORT || 3000;
let storedPitches = [];

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

    const pitch1 = await generatePitch(keywords + uuidv4());
    const pitch2 = await generatePitch(keywords + uuidv4()  +" - a different idea from the previous to serve as an alternative");
    console.log(pitch1, pitch2);
    pitch1.id = uuidv4(); // before pushing to storedPitches
    pitch2.id = uuidv4();
    storedPitches.push(pitch1);
    storedPitches.push(pitch2);
    res.json({
      pitches: [pitch1, pitch2]
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
    remix.id = uuidv4()
    storedPitches.push(remix)
    res.json({ remix });
  } catch (err) {
    console.error("Remix error:", err);
    res.status(500).json({ error: "Failed to remix pitch." });
  }
});

app.post("/refine/field", async (req, res) => {
  const { pitch, field } = req.body;
  console.log("starting")
  if (!pitch || !field) {
    return res.status(400).json({ error: "Missing pitch or field" });
  }

  try {
    const newValue = await regenerateField(pitch, field);
    res.json({ value: newValue });
  } catch (err: any) {
    console.error("Field regeneration failed:", err);
    res.status(500).json({ error: err.message || "Failed to regenerate field" });
  }
});
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

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

module.exports = app;
