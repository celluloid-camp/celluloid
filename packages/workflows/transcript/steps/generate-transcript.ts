import { transcribeCaptions } from "@celluloid/ai/transcript";

export async function generateTranscript(
  captions: {
    text: string;
    startTime: number;
    endTime: number;
  }[],
) {
  "use step";
  try {
    const transcript = await transcribeCaptions(captions);
    return transcript;
  } catch (error) {
    throw new Error("error generating transcript");
  }
}
