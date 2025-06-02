import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

/**
 * Regenerates a specific field (e.g., "tagline") from a full pitch object.
 */
export async function regenerateField(pitch: any, field: string): Promise<string> {
  console.debug("🔄 regenerateField() called with field:", field);

  const promptTemplate = new PromptTemplate({
  template: `
You are a startup pitch assistant. Your job is to regenerate ONLY the "{field}" field, but make sure it is meaningfully different from the original. Feel free to rewrite it with a new twist, style, or angle.

Given the full startup pitch:
{pitchJSON}

Return ONLY a valid JSON object like this:
{{ 
  "{field}": "..." 
}}

⚠️ No extra text, no explanation.
`.trim(),
  inputVariables: ["pitchJSON", "field"],
});


  const model = new Ollama({
    model: "nous-hermes2",
    temperature: 0.8,
    topP: 0.9,
  });

  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplate,
  });

  const pitchJSON = JSON.stringify(pitch, null, 2);

  console.debug("📨 Sending prompt to Ollama...");
  const result = await chain.invoke({
    pitchJSON,
    field,
  });

  const raw = result.text;
  console.debug("📝 Raw model content:", raw);

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
