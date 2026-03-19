import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { keys } from "../keys";
import { SYSTEM_PROMPT } from "./prompts";

const USER_PROMPT_TEMPLATE = (
  captionText: string,
) => `Process the following caption data and convert it to a clean transcript:

${captionText}`;

export const transcribeCaptions = async (
  captions: {
    startTime: number;
    endTime: number;
    text: string;
  }[],
) => {
  const env = keys();
  console.debug("Converting captions to transcript");

  // Convert captions to text format
  const captionText = captions
    .map((entry) => `${entry.startTime} --> ${entry.endTime}: ${entry.text}`)
    .join("\n");

  // Initialize text splitter with chunk size and overlap
  // Using conservative chunk sizes to stay well under token limits
  // Mistral Large has context window of 32k tokens, we'll use ~10k tokens per chunk as safety margin
  // Assuming ~4 characters per token, that's roughly 40k characters per chunk
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 20000,
    chunkOverlap: 1000, // Small overlap to maintain context between chunks
    separators: ["\n\n", "\n", " ", ""], // Split on newlines first to preserve caption structure
  });

  // Split the caption text into manageable chunks
  const chunks = await textSplitter.splitText(captionText);

  console.debug(`Split captions into ${chunks.length} chunks`);

  // Helper function to process a single chunk with error handling
  const processChunk = async (
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<string> => {
    console.debug(
      `Processing chunk ${chunkIndex + 1}/${totalChunks} (length: ${chunk.length} chars)`,
    );

    try {
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(USER_PROMPT_TEMPLATE(chunk)),
      ];

      console.debug(
        `Invoking model for chunk ${chunkIndex + 1}/${totalChunks}`,
      );
      // const response = await withTimeout(
      //   model.invoke(messages),
      //   60000, // 1 minute timeout per request
      // );

      const mistralLargeModel = new ChatMistralAI({
        modelName: "mistral-large-latest",
        apiKey: env.MISTRAL_API_KEY,
        streaming: false,
        temperature: 0,
      });

      const response = await mistralLargeModel.invoke(messages);

      if (!response || !response.content) {
        throw new Error(
          `Empty response from model for chunk ${chunkIndex + 1}`,
        );
      }

      const processedText =
        typeof response.content === "string"
          ? response.content
          : String(response.content);

      console.debug(
        `Completed chunk ${chunkIndex + 1}/${totalChunks} (output length: ${processedText.length} chars)`,
      );
      return processedText;
    } catch (error) {
      console.error(
        `Error processing chunk ${chunkIndex + 1}/${totalChunks}:`,
        error,
      );
      throw new Error(
        `Failed to process chunk ${chunkIndex + 1}/${totalChunks}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // If only one chunk, process it normally
  if (chunks.length === 1) {
    return await processChunk(chunks[0]!, 0, 1);
  }

  // Process multiple chunks sequentially and combine results
  const processedChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const processedText = await processChunk(chunks[i]!, i, chunks.length);
    processedChunks.push(processedText);
  }

  // Combine all processed chunks into final transcript
  // Join with double newlines to create natural paragraph breaks
  const finalTranscript = processedChunks.join("\n\n").trim();

  console.debug("Successfully converted captions to transcript");
  return finalTranscript;
};
