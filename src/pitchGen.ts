import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

interface PitchResponse {
  id: string;
  name: string;
  oneLiner: string;
  elevatorPitch: string;
  tagline: string;
}

export async function generatePitch(theme: string): Promise<PitchResponse> {
  const promptTemplate = new PromptTemplate({
    template: `You are a startup pitch generator. Your ONLY task is to respond with raw JSON and nothing else.

Given the theme: "{theme}"

Respond EXACTLY in this format (no explanations, no extra text):

{{
  "name": "string",
  "oneLiner": "string",
  "elevatorPitch": "string",
  "tagline": "string"
}}`,
    inputVariables: ["theme"],
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

  const result = await chain.invoke({ theme });

  let parsed;
  try {
    parsed = JSON.parse(result.text);
  } catch (err) {
    const match = result.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Unable to parse model response as JSON.");
    parsed = JSON.parse(match[0]);
  }

  if (!parsed?.name || !parsed?.oneLiner || !parsed?.elevatorPitch || !parsed?.tagline) {
    throw new Error("Incomplete or invalid pitch response.");
  }

  return parsed;
}
