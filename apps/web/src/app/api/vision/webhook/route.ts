// import { visionResultQueue } from "@celluloid/queue";
// import { z } from "zod";

// const WebhookSchema = z.object({
//   job_id: z.string(),
//   project_id: z.string(),
//   status: z.string(),
//   timestamp: z.string(),
// });

// export async function POST(request: Request) {
//   const body = await request.json();
//   const parsed = WebhookSchema.safeParse(body);
//   if (parsed.success) {
//     await visionResultQueue.add({
//       projectId: parsed.data.project_id,
//     });
//   }

//   return Response.json({
//     success: true,
//   });
// }
