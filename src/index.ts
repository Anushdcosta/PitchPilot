import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { generatePitch } from "./pitchGen.js";
import { v4 as uuidv4 } from 'uuid';
import { refineIdea } from "./refineIdea.js";
import { regenerateField } from "./fieldRefiner.js";


dotenv.config(); // Don't forget to call this

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
app.post("/generate", async (req, res) => {
  try {
    const { keywords } = req.body;
    console.log("🚀 Received /generate request with keywords:", keywords);

    const pitch1 = await generatePitch(keywords);
    console.log("✅ Pitch 1 generated:", pitch1);

    const pitch2 = await generatePitch(keywords + " - a different idea from the previous to serve as an alternative");
    console.log("✅ Pitch 2 generated:", pitch2);
    
    pitch1.id = uuidv4()
    pitch2.id = uuidv4()

    storedPitches.push(pitch1)
    storedPitches.push(pitch2)
    const response = {
      pitches: [pitch1, pitch2],
    };


    console.log("✅ Sending response to client");
    res.json(response);
  } catch (error) {
    console.error("❌ Error generating pitches:", error);
    res.status(500).json({ error: "Failed to generate pitches" });
  }
});


app.get('/pitch/:id', (req, res) => {
  const pitch = storedPitches.find(p => p.id === req.params.id);
  console.log(req.params.id)

  console.log(pitch)
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
// routes/refine.ts (or directly in app.js)

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

app.use((err, req, res, next) => {
  console.error("🔥 Uncaught backend error:", err);
  res.status(500).json({ error: "Internal server error" });
});


// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

module.exports = app;
