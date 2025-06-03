import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config();

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1-mini";

/**
 * Regenerates a specific field (e.g., "tagline") from a full pitch object.
 */
export async function regenerateField(pitch: any, field: string): Promise<string> {
  console.debug("🔄 regenerateField() called with field:", field);
  if (!token) {
    throw new Error("❌ GITHUB_TOKEN is missing. Please set it in your .env file.");
  }

  console.debug("🔐 Token loaded, creating model client...");
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const prompt = `
You are a startup pitch assistant. Your job is to regenerate ONLY the "${field}" field.

Given the full startup pitch:
${JSON.stringify(pitch, null, 2)}

Return ONLY a JSON object like this:
{
  "${field}": "..."
}
No extra text. Return only a valid JSON object.
`.trim();

  console.debug("📨 Sending prompt to model...");
  const response = await client.path("/chat/completions").post({
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

  console.debug("📬 Model response received");
  if (isUnexpected(response)) {
    console.error("❌ Unexpected model response:", response.body);
    throw new Error(response.body.error?.message || "Unexpected error from model API");
  }

  const raw = response.body.choices?.[0]?.message?.content;
  console.debug("📝 Raw model content:", raw);

  if (!raw) {
    throw new Error("No content received from model");
  }

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("❌ Could not match JSON object in raw output:", raw);
      throw new Error("Invalid JSON returned:\n" + raw);
    }

    const parsed = JSON.parse(match[0]);
    console.debug("✅ Parsed JSON:", parsed);

    if (!parsed[field]) {
      console.error(`❌ Field "${field}" missing in parsed output`, parsed);
      throw new Error(`Field "${field}" not found in model response:\n${raw}`);
    }

    console.debug(`🎯 Returning regenerated field "${field}":`, parsed[field]);
    return parsed[field];
  } catch (err) {
    console.error("❌ Failed to parse model output:", raw);
    throw new Error("❌ Failed to parse model output:\n" + raw);
  }
}
