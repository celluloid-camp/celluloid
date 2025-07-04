import { startDetectionAnalysePost } from "@celluloid/vision";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await startDetectionAnalysePost(body);
  return Response.json(response);
}
