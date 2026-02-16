import { transcribeCaptions } from "@celluloid/ai/transcript";
import { Caption } from "@celluloid/peertube/client";

export async function generateTranscript(captions: Caption) {
  "use step";

  try {
    const transcript = await transcribeCaptions(captions.entries);

    return transcript;
  } catch (error) {
    throw new Error("error generating transcript");
  }
}
