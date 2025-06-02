import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

interface PitchData {
  name: string;
  oneLiner: string;
  elevatorPitch: string;
  tagline: string;
}

export async function refineIdea(pitch: PitchData, answers: string[]): Promise<string> {
  const promptTemplate = new PromptTemplate({
  template: `You are a startup refinement assistant.

Given this startup pitch:
Name: {name}
One-liner: {oneLiner}
Elevator Pitch: {elevatorPitch}
Tagline: {tagline}

And these user reflections:
{formattedAnswers}

Return a concise but insightful summary as a valid JSON object with **only** these keys:

{ 
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
}

⚠️ Do not explain or include anything outside of the JSON object.

Only return a valid JSON object with the populated fields.

`,
  inputVariables: ["name", "oneLiner", "elevatorPitch", "tagline", "formattedAnswers"],
});


  const formattedAnswers = answers
    .map((answer, idx) => `Q${idx + 1}: ${answer}`)
    .join("\n");

  const model = new Ollama({
    model: "llama2",
    temperature: 0.7,
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

  return result.text.trim();
}
