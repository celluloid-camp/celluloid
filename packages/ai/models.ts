import { ChatMistralAI } from "@langchain/mistralai";
import { keys } from "./keys";

// Create model instance
export const mistralLargeModel = new ChatMistralAI({
  modelName: "mistral-large-latest",
  apiKey: keys().MISTRAL_API_KEY,
  streaming: false,
  temperature: 0,
});
