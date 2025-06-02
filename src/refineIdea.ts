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
export async function refineIdea(pitch: PitchResponse, answers: string[]): Promise<string> {
  if (!token) {
      throw new Error("❌ GITHUB_TOKEN is missing. Please set it in your .env file.");
    }
  
  const client = ModelClient(endpoint, new AzureKeyCredential(token));
  const formattedAnswers = answers
    .map((answer, idx) => `Q${idx + 1}: ${answer}`)
    .join("\n");
  let pitchname = pitch.name
  let oneLiner = pitch.oneLiner
  let elevatorPitch = pitch.elevatorPitch
  let tagline = pitch.tagline

  const promptTemplate = `
  You are a startup refinement assistant.

Given this startup pitch:
Name: ${pitchname}
One-liner: ${oneLiner}
Elevator Pitch: ${elevatorPitch}
Tagline: ${tagline}

And these user reflections:
${formattedAnswers}

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

Only return a valid JSON object with the populated fields.`.trim()

 const response = await client.path("/chat/completions").post({
     body: {
       model,
       temperature: 0.8,
       top_p: 0.9,
       messages: [
         { role: "system", content: "" },
         { role: "user", content: promptTemplate }
       ]
     }
   });
 
   if (isUnexpected(response)) {
     throw new Error(response.body.error?.message || "Unexpected error from model API");
   }
 
   const raw = response.body.choices?.[0]?.message?.content;
   if (!raw) {
     throw new Error("No content received from model");
   }
 
   let parsed: PitchResponse;
   try {
     parsed = JSON.parse(raw);
   } catch (err) {
     const match = raw.match(/\{[\s\S]*\}/);
     if (!match) throw new Error("Invalid JSON returned by model:\n" + raw);
     parsed = JSON.parse(match[0]);
   }
 
   if (!parsed.name || !parsed.oneLiner || !parsed.elevatorPitch || !parsed.tagline) {
     throw new Error("Incomplete pitch returned:\n" + JSON.stringify(parsed, null, 2));
   }
 
   return JSON.stringify(parsed, null, 2);
  }