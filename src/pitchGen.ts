import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config();

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1-mini";

export interface PitchResponse {
  id: string;
  name: string;
  oneLiner: string;
  elevatorPitch: string;
  tagline: string;
}

export async function generatePitch(theme: string): Promise<PitchResponse> {
  console.log("🔁 generatePitch called with theme:", theme);

  if (!token) {
    console.error("❌ GITHUB_TOKEN is missing");
    throw new Error("❌ GITHUB_TOKEN is missing. Please set it in your .env file.");
  }

  console.log("🔐 Token found. Creating ModelClient...");
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  console.log("✅ Client created");

  const prompt = `
You are a startup pitch generator. Your ONLY task is to respond with raw JSON and nothing else.

Given the theme: "${theme}"

Respond EXACTLY in this format (no explanations, no extra text):

{
  "name": "string",
  "oneLiner": "string",
  "elevatorPitch": "string",
  "tagline": "string"
}
`.trim();

  console.log("🧠 Sending prompt to model...");
  let response;
  try {
    response = await client.path("/chat/completions").post({
      body: {
        model,
        temperature: 0.8,
        top_p: 0.9,
        messages: [
          { role: "system", content: "" },
          { role: "user", content: prompt }
        ]
      }
    });
  } catch (err) {
    console.error("🔥 Request to model failed:", err);
    throw err;
  }

  console.log("📥 Model response received");

  if (isUnexpected(response)) {
    console.error("❌ Unexpected response from model:", response.body?.error);
    throw new Error(response.body.error?.message || "Unexpected error from model API");
  }

  const raw = response.body.choices?.[0]?.message?.content;
  console.log("📦 Raw model output:", raw);

  if (!raw) {
    console.error("❌ No content received from model");
    throw new Error("No content received from model");
  }

  let parsed: PitchResponse;
  try {
    parsed = JSON.parse(raw);
    console.log("✅ Successfully parsed full JSON directly");
  } catch (err) {
    console.warn("⚠️ Full JSON parse failed, trying regex extraction...");
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("❌ Could not extract JSON object from model output");
      throw new Error("Invalid JSON returned by model:\n" + raw);
    }
    parsed = JSON.parse(match[0]);
    console.log("✅ Successfully parsed JSON using regex match");
  }

  if (!parsed.name || !parsed.oneLiner || !parsed.elevatorPitch || !parsed.tagline) {
    console.error("❌ Missing fields in parsed pitch:", parsed);
    throw new Error("Incomplete pitch returned:\n" + JSON.stringify(parsed, null, 2));
  }

  console.log("✅ Final pitch object ready:", parsed);

  return parsed;
}
