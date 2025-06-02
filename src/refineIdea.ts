import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

export interface PitchResponse {
  id: string;
  name: string;
  oneLiner: string;
  elevatorPitch: string;
  tagline: string;
}

export async function refineIdea(pitch: PitchResponse, answers: string[]): Promise<any> {
  const formattedAnswers = answers
    .map((answer, idx) => `Q${idx + 1}: ${answer}`)
    .join("\n");

  const promptTemplate = new PromptTemplate({
  template: `
You are a startup refinement assistant.

Given this startup pitch:
Name: {name}
One-liner: {oneLiner}
Elevator Pitch: {elevatorPitch}
Tagline: {tagline}

And these user reflections:
{formattedAnswers}

Return a concise but insightful summary as a valid JSON object with **only** these keys:

{{ 
  "name": string,
  "oneLiner": string,
  "elevatorPitch": string,
  "tagline": string,
  "vision": string,
  "targetAudience": string,
  "features": string,
  "tools": string,
  "risks": string,
  "uniquePoint": string
}}

⚠️ Do not explain or include anything outside of the JSON object.

Only return a valid JSON object with the populated fields.
  `.trim(),
  inputVariables: [
    "name",
    "oneLiner",
    "elevatorPitch",
    "tagline",
    "formattedAnswers",
  ],
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

  const result = await chain.invoke({
    name: pitch.name,
    oneLiner: pitch.oneLiner,
    elevatorPitch: pitch.elevatorPitch,
    tagline: pitch.tagline,
    formattedAnswers,
  });

  const raw = result.text;
  console.debug("📝 Raw model response:", raw);

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("❌ Invalid JSON format from model:\n" + raw);

    const parsed = JSON.parse(match[0]);

    // Sanity check for required fields
    const required = ["name", "oneLiner", "elevatorPitch", "tagline"];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`❌ Missing required field "${field}" in model response.`);
      }
    }

    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse JSON:", raw);
    throw err;
  }
}
