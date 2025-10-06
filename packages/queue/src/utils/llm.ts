import type { Caption } from "@celluloid/utils";
import { Mistral } from "@mistralai/mistralai";
import { env } from "../env";

export const convertCaptionsToTranscript = async (captions: Caption) => {
  const apiKey = env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not set");
  }

  const client = new Mistral({ apiKey: apiKey });

  const prompt = `
  You are a transcript editor. Your task is to process raw video caption data and reformat it into a clean, highly readable transcript.

  **Instructions:**
  1.  Merge short caption lines into complete, grammatically correct sentences.
  2.  Remove all timestamps and caption sequence numbers.
  3.  Create new paragraphs for new speakers or significant pauses and topic shifts.
  4.  Correct capitalization and punctuation.

  **Strict Rule:** Your output must ONLY be the final transcript. Do not include any introductory text, titles, or explanations like "Here is the transcript."

  ${JSON.stringify(captions.entries)}
  `;
  const chatResponse = await client.chat.stream({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: prompt }],
  });

  let transcript = "";

  for await (const chunk of chatResponse) {
    const streamText = chunk.data.choices[0]?.delta.content;
    if (streamText) {
      transcript += streamText;
    }
  }

  return transcript;
};
