import { resumeHook } from "workflow/api";
import * as z from "zod";

export const VisionWebhookSchema = z.object({
  job_id: z.string(),
  external_id: z.string(),
  status: z.string(),
  timestamp: z.string(),
});

export type VisionWebhook = z.infer<typeof VisionWebhookSchema>;

export async function handleVisionWebhook(request: Request) {
  const body = await request.json();
  const { success, data, error } = VisionWebhookSchema.safeParse(body);
  if (success) {
    try {
      // Reconstruct the token using the channel ID
      await resumeHook(`vision_results:${data.external_id}`, data);
    } catch (error) {
      console.error("Failed to resume hook", error);
    }
  } else {
    console.error("Failed to parse webhook", error);
  }

  return Response.json({
    success: true,
  });
}
