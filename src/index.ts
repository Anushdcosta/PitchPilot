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
app.post("/generate", async (req, res) => {
  try {
    const { keywords } = req.body;
    console.log("🚀 Received /generate request with keywords:", keywords);

    const pitch1 = await generatePitch(keywords);
    console.log("✅ Pitch 1 generated:", pitch1);

    const pitch2 = await generatePitch(keywords + " - another idea");
    console.log("✅ Pitch 2 generated:", pitch2);

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

app.use((err, req, res, next) => {
  console.error("🔥 Uncaught backend error:", err);
  res.status(500).json({ error: "Internal server error" });
});


// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

module.exports = app;
