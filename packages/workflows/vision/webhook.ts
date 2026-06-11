import { resumeHook } from "workflow/api";
import * as z from "zod";

export const VisionWebhookSchema = z.object({
  job_id: z.string(),
  external_id: z.string(),
  status: z.string(),
  timestamp: z.string(),
  job_type: z.enum(["scene_detect", "object_detect"]),
});

export type VisionWebhook = z.infer<typeof VisionWebhookSchema>;

export async function handleVisionWebhook(request: Request) {
  const body = await request.json();
  const { success, data, error } = VisionWebhookSchema.safeParse(body);
  if (success) {
    console.log(
      `[TOOLKIT WEBHOOK] TYPE:${data.job_type}: JOB ID:${data.job_id}`,
    );
    console.log("[TOOLKIT WEBHOOK] DATA:", data);
    try {
      await resumeHook(data.job_id, data);
    } catch (error) {
      console.error("[TOOLKIT WEBHOOK] Failed to resume hook", error);
    }
  } else {
    console.error("[TOOLKIT WEBHOOK] Failed to parse webhook", error);
  }

  return Response.json({
    success: true,
  });
}
