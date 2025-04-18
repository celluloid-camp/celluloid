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
  You are a helpful assistant that converts captions to a transcript.
  The captions are in the following format:
  Important:
  1- Do not include any other text than the transcript.
  2 - Do not add any other text like "Here is the transcript" or "Transcript:" or anything like that.
  3 - format the transcript to be more readable.

  ${captions.entries.map((entry) => `${entry.text}`).join("\n")}
  `
  const chatResponse = await client.chat.stream({
    model: "mistral-large-latest",
    messages: [{ role: 'user', content: prompt }]
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
