import type { Caption } from "@celluloid/utils";
import logger from "@celluloid/utils/logger";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { env } from "../env";

const SYSTEM_PROMPT = `You are a transcript editor. Your task is to process raw video caption data and reformat it into a clean, highly readable transcript.

**Instructions:**
1.  Merge short caption lines into complete, grammatically correct sentences.
2.  Remove all timestamps and caption sequence numbers.
3.  Create new paragraphs for new speakers or significant pauses and topic shifts.
4.  Correct capitalization and punctuation.

**Strict Rule:** Your output must ONLY be the final transcript. Do not include any introductory text, titles, or explanations like "Here is the transcript."`;

const USER_PROMPT_TEMPLATE = (
  captionText: string,
) => `Process the following caption data and convert it to a clean transcript:

${captionText}`;

export const convertCaptionsToTranscript = async (captions: Caption) => {
  const apiKey = env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not set");
  }

  logger.debug("Converting captions to transcript");

  // Convert captions to text format
  const captionText = captions.entries
    .map((entry) => `${entry.from} --> ${entry.to}: ${entry.text}`)
    .join("\n");

  // Initialize text splitter with chunk size and overlap
  // Using conservative chunk sizes to stay well under token limits
  // Mistral Large has context window of 32k tokens, we'll use ~10k tokens per chunk as safety margin
  // Assuming ~4 characters per token, that's roughly 40k characters per chunk
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 40000,
    chunkOverlap: 2000, // Small overlap to maintain context between chunks
    separators: ["\n\n", "\n", " ", ""], // Split on newlines first to preserve caption structure
  });

  // Split the caption text into manageable chunks
  const chunks = await textSplitter.splitText(captionText);

  logger.debug(`Split captions into ${chunks.length} chunks`);

  // Create model instance
  const model = new ChatMistralAI({
    modelName: "mistral-large-latest",
    apiKey: apiKey,
    streaming: false,
    temperature: 0,
  });

  // Timeout helper function
  const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  };

  // Helper function to process a single chunk with error handling
  const processChunk = async (
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<string> => {
    logger.debug(
      `Processing chunk ${chunkIndex + 1}/${totalChunks} (length: ${chunk.length} chars)`,
    );

    try {
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(USER_PROMPT_TEMPLATE(chunk)),
      ];

      logger.debug(`Invoking model for chunk ${chunkIndex + 1}/${totalChunks}`);
      const response = await withTimeout(
        model.invoke(messages),
        60000, // 1 minute timeout per request
      );

      if (!response || !response.content) {
        throw new Error(
          `Empty response from model for chunk ${chunkIndex + 1}`,
        );
      }

      const processedText =
        typeof response.content === "string"
          ? response.content
          : String(response.content);

      logger.debug(
        `Completed chunk ${chunkIndex + 1}/${totalChunks} (output length: ${processedText.length} chars)`,
      );
      return processedText;
    } catch (error) {
      logger.error(
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

  logger.debug("Successfully converted captions to transcript");
  return finalTranscript;
};
